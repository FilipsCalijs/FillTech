import express from 'express';
import Stripe from 'stripe';
import { pool } from '../db.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const requireUid = (req, res, next) => {
  const uid = req.headers['x-user-uid'];
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  req.userUid = uid;
  next();
};

// GET /api/billing — balance + spent this month
router.get('/', requireUid, async (req, res) => {
  const [[user]] = await pool.execute(
    `SELECT balance FROM users WHERE uid = ?`,
    [req.userUid]
  );

  const [[spent]] = await pool.execute(
    `SELECT COALESCE(SUM(cost), 0) AS total
     FROM generations
     WHERE user_uid = ?
       AND status = 'completed'
       AND YEAR(created_at) = YEAR(NOW())
       AND MONTH(created_at) = MONTH(NOW())`,
    [req.userUid]
  );

  res.json({
    balance:     parseFloat(user?.balance ?? 0),
    spent_month: parseFloat(spent?.total ?? 0),
  });
});

// GET /api/billing/history — spending history from generations
router.get('/history', requireUid, async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT id, tool_type, cost, status, created_at
     FROM generations
     WHERE user_uid = ? AND cost > 0
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [req.userUid]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM generations WHERE user_uid = ? AND cost > 0`,
    [req.userUid]
  );

  res.json({ rows, total, page, pages: Math.ceil(total / limit) });
});

// POST /api/billing/create-checkout-session
router.post('/create-checkout-session', requireUid, async (req, res) => {
  try {
    const amount = parseFloat(req.body.amount);
    const lang   = req.body.lang || 'en';

    if (!amount || isNaN(amount) || amount < 5 || amount > 5000) {
      return res.status(400).json({ error: 'Amount must be between $5 and $5,000' });
    }

    const base = process.env.FRONTEND_URL || 'http://localhost:5174';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Visaulio Balance Top-up' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      // session_id appended so frontend can verify the payment on return
      success_url: `${base}/${lang}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${base}/${lang}/billing?cancel=true`,
      metadata: { userUid: req.userUid },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/billing/verify-session?session_id=xxx
// Called on return from Stripe success URL — credits balance idempotently
router.get('/verify-session', requireUid, async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  try {
    // Check if already processed
    const [[existing]] = await pool.execute(
      `SELECT id FROM stripe_payments WHERE session_id = ?`,
      [session_id]
    );
    if (existing) return res.json({ already_credited: true });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const amount  = session.amount_total / 100;
    const userUid = session.metadata?.userUid;

    if (!userUid || userUid !== req.userUid) {
      return res.status(403).json({ error: 'Session does not belong to this user' });
    }

    // Record payment and credit balance atomically
    await pool.execute(
      `INSERT INTO stripe_payments (session_id, user_uid, amount) VALUES (?, ?, ?)`,
      [session_id, userUid, amount]
    );
    await pool.execute(
      `UPDATE users SET balance = balance + ? WHERE uid = ?`,
      [amount, userUid]
    );

    res.json({ credited: true, amount });
  } catch (err) {
    console.error('[verify-session]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/billing/payments — Stripe top-up history
router.get('/payments', requireUid, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT session_id, amount, created_at FROM stripe_payments WHERE user_uid = ? ORDER BY created_at DESC`,
    [req.userUid]
  );
  res.json({ rows });
});

// Mounted in index.js BEFORE express.json() so Stripe can verify the raw body
export const stripeWebhookHandler = async (req, res) => {
  const sig           = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && !webhookSecret.startsWith('whsec_REPLACE')) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session   = event.data.object;
    const { userUid } = session.metadata ?? {};
    const amount    = session.amount_total / 100;
    const sessionId = session.id;
    if (userUid && sessionId) {
      try {
        // Idempotent: skip if verify-session already processed this session
        await pool.execute(
          `INSERT INTO stripe_payments (session_id, user_uid, amount) VALUES (?, ?, ?)`,
          [sessionId, userUid, amount]
        );
        await pool.execute(
          'UPDATE users SET balance = balance + ? WHERE uid = ?',
          [amount, userUid]
        );
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') console.error('[webhook]', err);
      }
    }
  }

  res.json({ received: true });
};

export default router;

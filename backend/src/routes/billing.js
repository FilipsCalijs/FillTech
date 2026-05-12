import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

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

  const [rows] = await pool.execute(
    `SELECT id, tool_type, cost, status, created_at
     FROM generations
     WHERE user_uid = ? AND cost > 0
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [req.userUid, limit, offset]
  );

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM generations WHERE user_uid = ? AND cost > 0`,
    [req.userUid]
  );

  res.json({ rows, total, page, pages: Math.ceil(total / limit) });
});

export default router;

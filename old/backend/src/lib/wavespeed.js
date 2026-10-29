import { pool } from '../db.js';
import { uploadFromUrl } from './r2.js';
import { v4 as uuidv4 } from 'uuid';
import { getPrice } from '../config/toolPrices.js';

const TTL_DAYS = 7;

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Non-JSON response: ${text.slice(0, 300)}`); }
}

/**
 * Full WaveSpeed flow with DB status tracking:
 * pending → processing → completed/failed
 *
 * @param {object} opts
 * @param {string}   opts.createUrl   - WaveSpeed model endpoint
 * @param {object}   opts.body        - request body
 * @param {string}   opts.userUid
 * @param {string}   opts.toolType    - 'portrait' | 'ps2-filter' | etc.
 * @param {string}   opts.r2Folder    - folder name in R2
 * @param {string}   opts.inputUrl    - optional R2 URL of input file
 * @returns {{ genId, imageUrl }}
 */
export async function runWavespeed({ createUrl, body, userUid, toolType, r2Folder, inputUrl = null }) {
  const genId     = uuidv4();
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);

  const cost = getPrice(toolType);

  // 1. Insert as pending immediately
  await pool.execute(
    `INSERT INTO generations (id, user_uid, input_url, tool_type, status, expires_at, cost, created_at)
     VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW())`,
    [genId, userUid, inputUrl, toolType, expiresAt, cost]
  );

  try {
    // 2. Create WaveSpeed prediction
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${process.env.NANO_BANANO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const createData = await safeJson(createRes);
    const pollUrl    = createData.data?.urls?.get;
    const wsId       = createData.data?.id;

    if (!pollUrl) throw new Error(`No poll URL: ${JSON.stringify(createData)}`);

    // Save WaveSpeed task ID
    await pool.execute(
      `UPDATE generations SET job_id = ? WHERE id = ?`,
      [wsId ?? null, genId]
    );

    // 3. Poll with status updates
    const imageUrl = await pollWithUpdates(pollUrl, genId);

    // 4. Upload result to R2
    const r2Url = await uploadFromUrl(imageUrl, userUid, r2Folder);

    // 5. Mark completed
    await pool.execute(
      `UPDATE generations SET status = 'completed', output_url = ?, completed_at = NOW() WHERE id = ?`,
      [r2Url, genId]
    );

    return { genId, imageUrl: r2Url };

  } catch (err) {
    // Mark failed
    await pool.execute(
      `UPDATE generations SET status = 'failed', error_message = ? WHERE id = ?`,
      [err.message.slice(0, 500), genId]
    );
    throw err;
  }
}

async function pollWithUpdates(pollUrl, genId) {
  let lastStatus = 'pending';

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));

    const res  = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${process.env.NANO_BANANO_API_KEY}` },
    });
    const json = await safeJson(res);
    const pred = json.data ?? json;
    const status = pred.status;

    // Update DB when status changes
    if (status !== lastStatus) {
      lastStatus = status;
      if (status === 'processing') {
        await pool.execute(
          `UPDATE generations SET status = 'processing', started_at = NOW() WHERE id = ?`,
          [genId]
        );
      }
    }

    if (status === 'completed') return (pred.outputs ?? pred.output)?.[0];
    if (status === 'failed')   throw new Error(pred.error || 'Generation failed');
  }

  throw new Error('Timeout: generation took too long');
}

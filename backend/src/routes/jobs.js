import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const userUid = req.headers['x-user-uid'];
  if (!userUid) return res.status(401).json({ error: 'Unauthorized' });

  const [rows] = await pool.execute(
    `SELECT id, status, tool_type, output_url, error_message,
            created_at, started_at, completed_at
     FROM generations WHERE id = ? AND user_uid = ?`,
    [req.params.id, userUid]
  );

  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

export default router;

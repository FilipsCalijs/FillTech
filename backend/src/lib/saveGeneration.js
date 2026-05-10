import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';

export async function createPendingGeneration(userUid, inputUrl, toolType) {
  const id = uuidv4();
  await pool.execute(
    `INSERT INTO generations (id, user_uid, input_url, tool_type, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [id, userUid, inputUrl, toolType]
  );
  return id;
}

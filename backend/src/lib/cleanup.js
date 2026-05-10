import { pool } from '../db.js';
import { deleteFromR2 } from './r2.js';

export async function cleanupExpiredGenerations() {
  const [expired] = await pool.query(
    `SELECT id, output_url FROM generations
     WHERE expires_at IS NOT NULL AND expires_at < NOW() AND output_url IS NOT NULL`
  );

  if (!expired.length) return;

  const publicBase = process.env.R2_PUBLIC_URL;

  for (const row of expired) {
    try {
      if (publicBase && row.output_url.startsWith(publicBase)) {
        const key = row.output_url.slice(publicBase.length + 1);
        await deleteFromR2(key);
      }
      await pool.execute('DELETE FROM generations WHERE id = ?', [row.id]);
    } catch (err) {
      console.error('[cleanup] Failed to delete generation', row.id, err.message);
    }
  }

  console.log(`[cleanup] Deleted ${expired.length} expired generation(s)`);
}

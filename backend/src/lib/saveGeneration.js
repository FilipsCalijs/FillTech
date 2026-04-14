import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';

/**
 * Сохраняет результат генерации в таблицу generations.
 * @param {string} userUid
 * @param {string} outputUrl  - публичный URL из R2
 * @param {string} model      - название инструмента (watermark-remove, bg-remove, etc.)
 * @returns {string} id новой записи
 */
export async function saveGeneration(userUid, outputUrl, model) {
  const id = uuidv4();
  await db.query(
    `INSERT INTO generations (id, user_uid, output_url, model, status) VALUES (?, ?, ?, ?, 'completed')`,
    [id, userUid, outputUrl, model]
  );
  return id;
}

import mysql from 'mysql2/promise'
import 'dotenv/config'

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export async function runMigrations() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS media (
      id           INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
      filename     VARCHAR(500)  NOT NULL,
      r2_key       VARCHAR(1000) NOT NULL,
      url          VARCHAR(1000) NOT NULL,
      content_type VARCHAR(100)  NOT NULL DEFAULT 'image/jpeg',
      size         INT           NULL,
      uploaded_by  VARCHAR(255)  NULL,
      created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id               INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title            VARCHAR(255)  NOT NULL,
      slug             VARCHAR(255)  NOT NULL UNIQUE,
      content          LONGTEXT      NOT NULL,
      excerpt          TEXT          NULL,
      author_uid       VARCHAR(255)  NULL,
      status           ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
      seo_title        VARCHAR(255)  NULL,
      seo_description  VARCHAR(500)  NULL,
      cover_url        VARCHAR(1000) NULL,
      tags             JSON          NULL,
      published_at     DATETIME      NULL,
      created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
  // Добавить cover_url если колонки ещё нет
  const [[coverCol]] = await db.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'cover_url'
  `);
  if (!coverCol) {
    await db.query(`ALTER TABLE posts ADD COLUMN cover_url VARCHAR(1000) NULL AFTER excerpt`);
  }

  console.log('✅ Migrations done')
}

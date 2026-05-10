import mysql from 'mysql2/promise'
import 'dotenv/config'

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// алиас — весь старый код использует { db }
export const db = pool;

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

  // Fix posts with empty slugs (created before transliteration support)
  await pool.query(`
    UPDATE posts SET slug = CONCAT('post-', id) WHERE slug = '' OR slug IS NULL
  `);

  // Таблица generations
  await pool.query(`
    CREATE TABLE IF NOT EXISTS generations (
      id            VARCHAR(36)   NOT NULL PRIMARY KEY,
      user_uid      VARCHAR(255)  NOT NULL,
      input_url     VARCHAR(1000) NULL,
      tool_type     VARCHAR(100)  NOT NULL DEFAULT 'watermark-remove',
      job_id        VARCHAR(255)  NULL,
      output_url    VARCHAR(1000) NULL,
      model         VARCHAR(100)  NULL,
      status        ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
      error_message TEXT          NULL,
      created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      started_at    DATETIME      NULL,
      completed_at  DATETIME      NULL
    )
  `)

  // Исправить колонки — старый migration.sql сделал их NOT NULL без дефолта
  await pool.query(`ALTER TABLE generations MODIFY COLUMN output_url VARCHAR(1000) NULL`).catch(() => {});
  await pool.query(`ALTER TABLE generations MODIFY COLUMN model VARCHAR(100) NULL`).catch(() => {});
  // Убрать FK на users — auth идёт через Firebase, constraint только мешает
  await pool.query(`ALTER TABLE generations DROP FOREIGN KEY generations_ibfk_1`).catch(() => {});
  // Добавить 'processing' в ENUM status (старый migration.sql не включал его)
  await pool.query(`ALTER TABLE generations MODIFY COLUMN status ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending'`).catch(() => {});

  // Generations: добавить новые колонки если их нет (для старых инсталляций)
  const newCols = [
    { name: 'input_url',      def: 'VARCHAR(1000) NULL AFTER user_uid' },
    { name: 'tool_type',      def: "VARCHAR(100) NOT NULL DEFAULT 'watermark-remove' AFTER input_url" },
    { name: 'job_id',         def: 'VARCHAR(255) NULL AFTER tool_type' },
    { name: 'error_message',  def: 'TEXT NULL AFTER job_id' },
    { name: 'started_at',     def: 'DATETIME NULL AFTER created_at' },
    { name: 'completed_at',   def: 'DATETIME NULL AFTER started_at' },
    { name: 'expires_at',     def: 'DATETIME NULL AFTER completed_at' },
  ];

  for (const col of newCols) {
    const [[exists]] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'generations' AND COLUMN_NAME = ?`,
      [col.name]
    );
    if (!exists) {
      await pool.query(`ALTER TABLE generations ADD COLUMN ${col.name} ${col.def}`);
    }
  }

  // Таблица эффектов (AI инструменты)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS effects (
      id          INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255)  NOT NULL,
      slug        VARCHAR(255)  NOT NULL UNIQUE,
      short_desc  VARCHAR(500)  NULL,
      description TEXT          NULL,
      icon        VARCHAR(100)  NULL DEFAULT '✨',
      cover_url   VARCHAR(1000) NULL,
      status      ENUM('draft','published') NOT NULL DEFAULT 'draft',
      sort_order  INT           NOT NULL DEFAULT 0,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  // Сид начальных эффектов
  const effects = [
    ['Watermark Remover', 'watermark-remover', 'Remove watermarks from any image with AI',        '🚫', 'published', 1],
    ['BG Remover',        'bg-remover',        'Remove background from photos in seconds',         '✂️', 'published', 2],
    ['Upscaler',          'upscaler',          'Upscale images up to 4x without losing quality',  '🔍', 'published', 3],
    ['Layers Cutter',     'layers-cutter',     'Cut objects from images into separate layers',     '🪄', 'published', 4],
    ['PS2 Filter',        'ps2-filter',        'Apply retro PS2-era filter to any photo',         '🎮', 'published', 5],
    ['AI SVG Maker',      'ai-svg-maker',      'Convert any image to clean SVG vector',           '🖼️', 'published', 6],
    ['Clothes Swap',      'clothes-swap',      'Try on different clothes with AI',                '👕', 'published', 7],
    ['Photo Colorize',    'photo-colorize',    'Colorize black & white photos with AI',           '🎨', 'published', 8],
    ['PDF Extractor',     'pdf-extractor',     'Extract text and data from PDF files',            '📄', 'published', 9],
    ['Portrait',          'portrait',          'Create stunning AI portrait photos with style',    '🎭', 'published', 10],
  ];
  for (const [name, slug, short_desc, icon, status, sort_order] of effects) {
    await pool.query(
      `INSERT INTO effects (name, slug, short_desc, icon, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), short_desc=VALUES(short_desc),
         icon=VALUES(icon), status=VALUES(status), sort_order=VALUES(sort_order)`,
      [name, slug, short_desc, icon, status, sort_order]
    );
  }

  // Таблица комментариев
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id           INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
      post_id      INT           NOT NULL,
      user_uid     VARCHAR(255)  NOT NULL,
      display_name VARCHAR(255)  NOT NULL DEFAULT 'User',
      photo_url    VARCHAR(500)  NULL,
      content      TEXT          NOT NULL,
      created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  console.log('✅ Migrations done')
}

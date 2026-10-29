import mysql from 'mysql2/promise'
import 'dotenv/config'

export const pool = mysql.createPool({
  host:             process.env.DB_HOST || 'localhost',
  user:             process.env.DB_USER,
  password:         process.env.DB_PASS,
  database:         process.env.DB_NAME,
  port:             process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
})

export const db = pool;

export async function runMigrations() {

  // ── users ──────────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      uid           VARCHAR(128)             NOT NULL PRIMARY KEY,
      email         VARCHAR(255)             NULL,
      is_anonymous  TINYINT(1)               NOT NULL DEFAULT 0,
      display_name  VARCHAR(255)             NULL     DEFAULT 'User',
      photo_url     TEXT                     NULL,
      created_at    DATETIME                 NULL,
      last_login_at DATETIME                 NULL,
      updated_at    TIMESTAMP                NULL     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      role          VARCHAR(20)              NOT NULL DEFAULT 'user',
      plan          ENUM('free','basic','pro') NOT NULL DEFAULT 'free',
      is_ban        TINYINT(1)               NOT NULL DEFAULT 0,
      balance       DECIMAL(10,4)            NOT NULL DEFAULT 0.0000
    )
  `);

  // ── media ──────────────────────────────────────────────────────────────────
  await pool.query(`
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
  `);

  // ── posts ──────────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id              INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title           VARCHAR(255)  NOT NULL,
      slug            VARCHAR(255)  NOT NULL UNIQUE,
      content         LONGTEXT      NOT NULL,
      excerpt         TEXT          NULL,
      cover_url       VARCHAR(1000) NULL,
      author_uid      VARCHAR(255)  NULL,
      status          ENUM('draft','published') NOT NULL DEFAULT 'draft',
      seo_title       VARCHAR(255)  NULL,
      seo_description VARCHAR(500)  NULL,
      tags            JSON          NULL,
      lang            ENUM('en','ru','lv','de','pt','es','ja','hi','ko','zh') NOT NULL DEFAULT 'en',
      translations    JSON          NULL,
      published_at    DATETIME      NULL,
      created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_posts_lang_status (lang, status, published_at)
    )
  `);

  // ── generations ────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS generations (
      id            VARCHAR(36)   NOT NULL PRIMARY KEY,
      user_uid      VARCHAR(255)  NOT NULL,
      input_url     VARCHAR(1000) NULL,
      tool_type     VARCHAR(100)  NOT NULL DEFAULT 'unknown',
      job_id        VARCHAR(255)  NULL,
      output_url    VARCHAR(1000) NULL,
      model         VARCHAR(100)  NULL,
      status        ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
      error_message TEXT          NULL,
      created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      started_at    DATETIME      NULL,
      completed_at  DATETIME      NULL,
      expires_at    DATETIME      NULL,
      cost          DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
      INDEX idx_generations_user (user_uid)
    )
  `);

  // ── effects ────────────────────────────────────────────────────────────────
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
  `);

  // ── comments ───────────────────────────────────────────────────────────────
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
  `);

  // ── post_likes ─────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
      post_id    INT          NOT NULL,
      user_uid   VARCHAR(255) NOT NULL,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_like (post_id, user_uid)
    )
  `);

  // ── stripe_payments ────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stripe_payments (
      id          INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
      session_id  VARCHAR(255)  NOT NULL UNIQUE,
      user_uid    VARCHAR(255)  NOT NULL,
      amount      DECIMAL(10,4) NOT NULL,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Backward-compat ALTERs (silently skip if column/index already exists) ──

  // posts: cover_url was added later
  await pool.query(`ALTER TABLE posts ADD COLUMN cover_url VARCHAR(1000) NULL AFTER excerpt`).catch(() => {});
  // posts: lang enum may need expanding for new languages
  await pool.query(`ALTER TABLE posts MODIFY COLUMN lang ENUM('en','ru','lv','de','pt','es','ja','hi','ko','zh') NOT NULL DEFAULT 'en'`).catch(() => {});
  // posts: translations column
  await pool.query(`ALTER TABLE posts ADD COLUMN translations JSON NULL AFTER lang`).catch(() => {});
  // posts: index
  await pool.query(`ALTER TABLE posts ADD INDEX idx_posts_lang_status (lang, status, published_at)`).catch(() => {});
  // posts: fix empty slugs from old data
  await pool.query(`UPDATE posts SET slug = CONCAT('post-', id) WHERE slug = '' OR slug IS NULL`).catch(() => {});

  // generations: columns added over time
  await pool.query(`ALTER TABLE generations DROP FOREIGN KEY generations_ibfk_1`).catch(() => {});
  await pool.query(`ALTER TABLE generations MODIFY COLUMN output_url VARCHAR(1000) NULL`).catch(() => {});
  await pool.query(`ALTER TABLE generations MODIFY COLUMN model VARCHAR(100) NULL`).catch(() => {});
  await pool.query(`ALTER TABLE generations MODIFY COLUMN status ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending'`).catch(() => {});
  for (const [col, def] of [
    ['input_url',     'VARCHAR(1000) NULL AFTER user_uid'],
    ['tool_type',     "VARCHAR(100) NOT NULL DEFAULT 'unknown' AFTER input_url"],
    ['job_id',        'VARCHAR(255) NULL AFTER tool_type'],
    ['error_message', 'TEXT NULL AFTER job_id'],
    ['started_at',    'DATETIME NULL AFTER created_at'],
    ['completed_at',  'DATETIME NULL AFTER started_at'],
    ['expires_at',    'DATETIME NULL AFTER completed_at'],
    ['cost',          'DECIMAL(10,4) NOT NULL DEFAULT 0.0000 AFTER expires_at'],
  ]) {
    const [[exists]] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'generations' AND COLUMN_NAME = ?`,
      [col]
    );
    if (!exists) await pool.query(`ALTER TABLE generations ADD COLUMN ${col} ${def}`);
  }

  // users: balance added later (old deployments)
  await pool.query(`ALTER TABLE users ADD COLUMN balance DECIMAL(10,4) NOT NULL DEFAULT 0.0000`).catch(() => {});
  await pool.query(`ALTER TABLE users ADD COLUMN plan ENUM('free','basic','pro') NOT NULL DEFAULT 'free'`).catch(() => {});
  await pool.query(`ALTER TABLE users ADD COLUMN is_ban TINYINT(1) NOT NULL DEFAULT 0`).catch(() => {});

  // ── Seed effects ───────────────────────────────────────────────────────────
  const effects = [
    ['Watermark Remover',        'watermark-remover',        'Remove watermarks from any image with AI',            '🚫', '/logo/watermark_remover.png',  'published', 1],
    ['BG Remover',               'bg-remover',               'Remove background from photos in seconds',            '✂️', '/logo/bg_remover.png',          'published', 2],
    ['Upscaler',                 'upscaler',                 'Upscale images up to 4x without losing quality',     '🔍', '/effects/upscaler.png',          'published', 3],
    ['PS2 Filter',               'ps2-filter',               'Apply retro PS2-era filter to any photo',            '🎮', '/effects/ps_filters.png',        'published', 4],
    ['Clothes Swap',             'clothes-swap',             'Try on different clothes with AI',                   '👕', null,                             'published', 5],
    ['Photo Colorize',           'photo-colorize',           'Colorize black & white photos with AI',              '🎨', '/effects/coloriezed.png',        'published', 6],
    ['PDF Extractor',            'pdf-extractor',            'Extract text and data from PDF files',               '📄', null,                             'published', 7],
    ['Portrait',                 'portrait',                 'Create stunning AI portrait photos with style',      '🎭', null,                             'published', 8],
    ['Voice Cloning',            'voice-clone',              'Clone any voice from a short audio sample',          '🎙️', '/effects/voice-cloning.png',     'published', 9],
    ['Vocal Isolator',           'vocal-isolator',           'Separate vocals from music in any audio track',      '🎵', '/effects/voice-isolator.png',    'published', 10],
    ['Text to Speech',           'text-to-speech',           'Convert any text into natural-sounding audio',       '🔊', null,                             'published', 11],
    ['Video BG Replace',         'video-bg-replace',         'Replace video background without green screen',      '🎬', null,                             'published', 12],
    ['Video Watermark Remover',  'watermark-remover-video',  'Remove watermarks from video files with AI',         '🎞️', null,                             'published', 13],
    ['Layers Cutter',            'layers-cutter',            'Cut objects from images into separate layers',       '🪄', null,                             'draft',     99],
  ];

  for (const [name, slug, short_desc, icon, cover_url, status, sort_order] of effects) {
    await pool.query(
      `INSERT INTO effects (name, slug, short_desc, icon, cover_url, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), short_desc=VALUES(short_desc), icon=VALUES(icon),
         cover_url=VALUES(cover_url), status=VALUES(status), sort_order=VALUES(sort_order)`,
      [name, slug, short_desc, icon, cover_url, status, sort_order]
    );
  }

  console.log('✅ Migrations done');
}

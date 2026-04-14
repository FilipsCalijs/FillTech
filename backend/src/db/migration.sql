-- ============================================
-- FillTech Database Migration
-- Run this in MAMP phpMyAdmin on database: FillTech
-- ============================================

-- 1. Add missing columns to users table
ALTER TABLE users
  ADD COLUMN plan ENUM('free', 'basic', 'pro') NOT NULL DEFAULT 'free',
  ADD COLUMN is_ban TINYINT(1) NOT NULL DEFAULT 0;

-- 2. Generations history (AI tool results)
CREATE TABLE IF NOT EXISTS generations (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  user_uid      VARCHAR(255)  NOT NULL,
  output_url    VARCHAR(1000) NOT NULL,
  model         VARCHAR(100)  NOT NULL,
  status        ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- 3. Payments (Stripe)
CREATE TABLE IF NOT EXISTS payments (
  id            INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_uid      VARCHAR(255)  NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  currency      VARCHAR(10)   NOT NULL DEFAULT 'eur',
  status        ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  stripe_id     VARCHAR(255)  NULL,
  plan_purchased ENUM('basic', 'pro') NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- 4. Photo styles (AI tool presets)
CREATE TABLE IF NOT EXISTS photo_styles (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT         NULL,
  tool_type   VARCHAR(100) NOT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1
);

-- Seed default styles
INSERT INTO photo_styles (name, slug, description, tool_type) VALUES
  ('Professional', 'professional', 'Clean studio portrait with soft lighting', 'headshot'),
  ('Royal',        'royal',        'Elegant royal-style portrait',             'headshot'),
  ('Christmas',    'christmas',    'Festive holiday style portrait',           'headshot'),
  ('Cinematic',    'cinematic',    'Movie-style dramatic lighting',            'headshot');

-- 5. Blog posts
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
  tags             JSON          NULL,
  published_at     DATETIME      NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_uid) REFERENCES users(uid) ON DELETE SET NULL
);

-- Если таблица уже существует, добавь колонку вручную:
-- ALTER TABLE posts ADD COLUMN tags JSON NULL AFTER seo_description;

import express from 'express';
import { db } from '../db.js';

const router = express.Router();
const BASE   = process.env.PUBLIC_URL || 'https://visaulio.com';
const LANGS  = ['en', 'ru', 'lv', 'de'];

const STATIC_PATHS = [
  '/tools',
  '/blog',
  '/tools/portrait',
  '/tools/bg-remover',
  '/tools/watermark-remover',
  '/tools/watermark-remover-video',
  '/tools/photo-colorize',
  '/tools/clothes-swap',
  '/tools/upscaler',
  '/testing',
  '/testing-2',
];

let cache = null;
let cacheAt = 0;

router.get('/', async (_req, res) => {
  if (cache && Date.now() - cacheAt < 3600_000) {
    res.setHeader('Content-Type', 'application/xml');
    return res.send(cache);
  }

  const [posts] = await db.query(
    `SELECT slug, lang, translations, updated_at FROM posts WHERE status = 'published'`
  ).catch(() => [[]]);

  const urls = [];

  // Static pages
  for (const path of STATIC_PATHS) {
    const alts = LANGS.map(l =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}${path}"/>`
    ).join('\n');
    urls.push(`
  <url>
    <loc>${BASE}/en${path}</loc>
${alts}
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/en${path}"/>
    <changefreq>weekly</changefreq>
  </url>`);
  }

  // Blog posts
  for (const post of posts) {
    const path = `/blog/${post.slug}`;
    const postLangs = [{ lang: post.lang, slug: post.slug }];

    // Add linked translations if available
    if (post.translations) {
      try {
        const trans = JSON.parse(post.translations);
        for (const [l, id] of Object.entries(trans)) {
          const found = posts.find(p => p.id === id);
          if (found) postLangs.push({ lang: l, slug: found.slug });
        }
      } catch {}
    }

    const alts = postLangs.map(({ lang: l, slug: s }) =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}/blog/${s}"/>`
    ).join('\n');

    urls.push(`
  <url>
    <loc>${BASE}/${post.lang}${path}</loc>
${alts}
    <lastmod>${post.updated_at?.toISOString?.()?.slice(0, 10) ?? ''}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`);
  }

  cache = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
  cacheAt = Date.now();

  res.setHeader('Content-Type', 'application/xml');
  res.send(cache);
});

export default router;

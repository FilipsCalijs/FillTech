// src/index.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/usersAuth.js';
import toolsRoutes from './routes/tools/index.js';
import blogRoutes from './routes/blog.js';
import mediaRoutes from './routes/media.js';
import jobsRouter from './routes/jobs.js';
import commentsRouter from './routes/comments.js';
import effectsRouter from './routes/effects.js';
import generationsRouter from './routes/generations.js';
import { runMigrations } from './db.js';
import { cleanupExpiredGenerations } from './lib/cleanup.js';

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use('/api', authRoutes);
app.use('/', authRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/jobs', jobsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/effects', effectsRouter);
app.use('/api/generations', generationsRouter);

// Проверка здоровья
app.get('/health', (_req, res) => res.send('Server is alive!'));

const PORT = process.env.PORT || 5200;
app.listen(PORT, '0.0.0.0', async () => {
    await runMigrations();
    await cleanupExpiredGenerations();
    setInterval(cleanupExpiredGenerations, 60 * 60 * 1000); // каждый час
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
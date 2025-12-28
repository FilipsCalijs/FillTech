// src/index.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/usersAuth.js'; // Импортируем новый роутер

const app = express();

app.use(cors());
app.use(express.json());

// Подключаем роутер. Все пути в auth.js теперь будут начинаться с /api
app.use('/api', authRoutes);

// Проверка здоровья
app.get('/health', (req, res) => res.send('Server is alive!'));

const PORT = process.env.PORT || 5200;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
import express from 'express';
import { db } from '../db.js';
import { checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const toMysqlDate = (isoStr) => {
    if (!isoStr) return null;
    try {
        return new Date(isoStr).toISOString().slice(0, 19).replace('T', ' ');
    } catch (e) {
        return null;
    }
};

router.post('/sync-user', async (req, res) => {
    const { 
        uid, email, isAnonymous, displayName, 
        photoURL, creationTime, lastSignInTime 
    } = req.body;

    if (!uid) return res.status(400).json({ error: 'UID is required' });

    try {
        const sql = `
            INSERT INTO users (uid, email, is_anonymous, display_name, photo_url, created_at, last_login_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                email = VALUES(email),
                display_name = VALUES(display_name),
                photo_url = VALUES(photo_url),
                last_login_at = VALUES(last_login_at)
        `;

        const values = [
            uid, email || null, isAnonymous ? 1 : 0,
            displayName || 'User', photoURL || null,
            toMysqlDate(creationTime), toMysqlDate(lastSignInTime)
        ];

        await db.query(sql, values);

        // Получаем роль пользователя из БД, чтобы вернуть её фронтенду
        const [rows] = await db.query('SELECT role FROM users WHERE uid = ?', [uid]);
        const role = rows[0]?.role || 'user';

        res.status(200).json({ success: true, role });
    } catch (err) {
        console.error('Ошибка в БД:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ПРИМЕР ЗАЩИЩЕННОГО РОУТА
// Этот эндпоинт вернет всех пользователей только если заголовок x-user-uid принадлежит админу
router.get('/admin/users', checkAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT uid, email, display_name, role FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
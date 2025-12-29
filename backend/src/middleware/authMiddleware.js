import { db } from '../db.js';

export const checkAdmin = async (req, res, next) => {
    const uid = req.headers['x-user-uid']; 

    if (!uid) {
        return res.status(401).json({ error: "No user UID provided" });
    }

    try {
        const [rows] = await db.query('SELECT role FROM users WHERE uid = ?', [uid]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found in database" });
        }

        if (rows[0].role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: "Forbidden: You do not have admin rights" });
        }
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
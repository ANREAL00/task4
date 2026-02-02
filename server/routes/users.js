const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

const checkUserStatus = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [users] = await pool.execute('SELECT status FROM users WHERE id = ?', [decoded.id]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'User is blocked' });
        }

        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

router.use(checkUserStatus);

router.get('/', async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, name, email, last_login, registration_time, status FROM users ORDER BY last_login DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/block', async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid data' });

        await pool.query('UPDATE users SET previous_status = status, status = "blocked" WHERE id IN (?) AND status != "blocked"', [userIds]);

        res.json({ message: 'Users blocked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/unblock', async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid data' });

        await pool.query('UPDATE users SET status = COALESCE(previous_status, "active"), previous_status = NULL WHERE id IN (?)', [userIds]);

        res.json({ message: 'Users unblocked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/', async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid data' });

        await pool.query('DELETE FROM users WHERE id IN (?)', [userIds]);
        res.json({ message: 'Users deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/unverified', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE status = "unverified"');
        res.json({ message: 'All unverified users deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

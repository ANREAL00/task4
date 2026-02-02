const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

const checkUserStatus = require('../middleware/auth');

router.use(checkUserStatus);

// NOTA BENE: Admin table data is sorted by last login time by default.
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
        // IMPORTANT: multiple selection via array of userIds
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
        // NOTE: restoring status for multiple users at once
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
        // NOTA BENE: Users are physically deleted, not marked.
        if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid data' });

        await pool.query('DELETE FROM users WHERE id IN (?)', [userIds]);
        res.json({ message: 'Users deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/unverified', async (req, res) => {
    try {
        // IMPORTANT: cleaning up unverified accounts
        await pool.query('DELETE FROM users WHERE status = "unverified"');
        res.json({ message: 'All unverified users deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

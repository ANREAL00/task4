const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');
const sendEmail = require('../utils/emailService');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await pool.execute(
            'INSERT INTO users (name, email, password, verification_token) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, verificationToken]
        );

        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
        const html = `
            <h1>Verify your email</h1>
            <p>Thanks for registering! Please click the link below to verify your email:</p>
            <a href="${verifyUrl}">Verify Email</a>
        `;

        sendEmail(email, 'Verify your email - Task 4', html, verifyUrl)
            .catch(err => console.error('Delayed email failure:', err.message));

        res.status(201).json({
            message: 'User registered. Please check email to verify.',
            verifyUrl: verifyUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token required' });

        const [users] = await pool.execute('SELECT id FROM users WHERE verification_token = ?', [token]);
        const user = users[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        await pool.execute('UPDATE users SET status = "active", verification_token = NULL WHERE id = ?', [user.id]);

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'User is blocked' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

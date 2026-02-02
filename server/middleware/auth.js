const jwt = require('jsonwebtoken');
const pool = require('../db');

// IMPORTANT: This middleware checks user status before processing any request.
// It ensures that even if a user has a valid JWT, they cannot perform actions if blocked or deleted.
const checkUserStatus = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // NOTE: We must check the database directly in case the user was blocked or deleted 
        // after their token was issued.
        const [users] = await pool.execute('SELECT status FROM users WHERE id = ?', [decoded.id]);
        const user = users[0];

        // NOTA BENE: If user is not found, they were likely deleted.
        if (!user) {
            return res.status(401).json({ message: 'User account not found' });
        }

        // IMPORTANT: If user is blocked, we return 403 Forbidden.
        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'User is blocked' });
        }

        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = checkUserStatus;

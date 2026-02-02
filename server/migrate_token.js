const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        try {
            await connection.query('ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL');
            console.log('Successfully added verification_token column.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column verification_token already exists.');
            } else {
                throw err;
            }
        }

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
})();

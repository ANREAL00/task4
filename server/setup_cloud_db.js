const mysql = require('mysql2/promise');
require('dotenv').config();

const createTableSchema = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    last_login DATETIME,
    registration_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('unverified', 'active', 'blocked') DEFAULT 'unverified',
    previous_status VARCHAR(20) DEFAULT NULL,
    verification_token VARCHAR(255) DEFAULT NULL
);
`;

const addTokenColumnQuery = `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL;`;
// Note: Some MySQL versions don't support ADD COLUMN IF NOT EXISTS, so we'll use a try-catch

(async () => {
    try {
        console.log('Connecting to Cloud Database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected! Verifying database structure...');

        // 1. Create table if not exists
        await connection.query(createTableSchema);
        console.log('Base table check complete.');

        // 2. Explicitly try to add the column in case table existed without it
        try {
            // Check if column exists first (safer approach for all versions)
            const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'verification_token'");
            if (columns.length === 0) {
                console.log('Adding missing "verification_token" column...');
                await connection.query('ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL');
                console.log('Column added.');
            } else {
                console.log('Column "verification_token" already exists.');
            }
        } catch (colErr) {
            console.error('Error checking/adding column:', colErr.message);
        }

        await connection.end();
        console.log('Database is now ready for Task 4.');
        process.exit(0);
    } catch (err) {
        console.error('Setup failed:', err.message);
        process.exit(1);
    }
})();

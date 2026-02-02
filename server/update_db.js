const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function updateSchema() {
    try {
        console.log('Updating database schema...');
        // We need to alter the table because it (likely) already exists.
        // Dropping content is cleaner for dev if user doesn't mind losing data.
        // But let's try ALTER first to be safe, or just DROP if it's easier.
        // Given we just started, DROP is fine.

        await pool.query('DROP TABLE IF EXISTS users');
        console.log('Old table dropped.');

        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const statements = schema.split(';').filter(s => s.trim());

        for (const statement of statements) {
            await pool.query(statement);
        }

        console.log('✅ Database schema updated with "unverified" status!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update database:', error);
        process.exit(1);
    }
}

updateSchema();

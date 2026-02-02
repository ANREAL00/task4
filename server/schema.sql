CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_login DATETIME,
    registration_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('unverified', 'active', 'blocked') DEFAULT 'unverified',
    previous_status VARCHAR(20) DEFAULT NULL,
    verification_token VARCHAR(255) DEFAULT NULL,
    UNIQUE INDEX idx_user_email (email)
);
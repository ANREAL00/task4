const nodemailer = require('nodemailer');

const createTransporter = async () => {
    // Priority 1: Real SMTP from environment variables
    console.log('Using Real SMTP Service:', process.env.SMTP_HOST);
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    // Priority 2: Ethereal (Development Fallback)
    try {
        console.log('Falling back to Ethereal Email Service...');
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (err) {
        console.error("Failed to create Ethereal account:", err.message);
        return null;
    }
};

let transporterPromise = createTransporter();

const sendEmail = async (to, subject, html, fallbackLink) => {
    try {
        const transporter = await transporterPromise;
        const from = process.env.SMTP_FROM || '"Task 4 Admin" <admin@example.com>';

        if (!transporter) {
            console.log("\n--- EMAIL FALLBACK (NO TRANSPORTER) ---");
            console.log(`To: ${to}`);
            console.log(`Link: ${fallbackLink}`);
            console.log("---------------------------------------\n");
            return { messageId: 'fallback' };
        }

        const info = await transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            html: html,
        });

        console.log("Email sent successfully! ID:", info.messageId);
        if (nodemailer.getTestMessageUrl(info)) {
            console.log("Ethereal Preview URL:", nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error("Critical error in sendEmail:", error.message);
        console.log("\n--- EMERGENCY LINK LOG ---");
        console.log(`User: ${to}`);
        console.log(`Link: ${fallbackLink}`);
        console.log("---------------------------\n");
        throw error;
    }
};

module.exports = sendEmail;

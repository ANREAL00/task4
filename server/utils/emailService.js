const nodemailer = require('nodemailer');

let transporterPromise = (async () => {
    try {
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
        return null; // Fallback to console logging only
    }
})();

const sendEmail = async (to, subject, html, fallbackLink) => {
    try {
        const transporter = await transporterPromise;

        if (!transporter) {
            console.log("\n--- EMAIL FALLBACK (SMTP FAILED) ---");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Verification Link: ${fallbackLink}`);
            console.log("------------------------------------\n");
            return { messageId: 'fallback-log', previewUrl: 'check-console' };
        }

        const info = await transporter.sendMail({
            from: '"Task 4 Admin" <admin@example.com>',
            to: to,
            subject: subject,
            html: html,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        return info;
    } catch (error) {
        console.error("Error sending email: ", error.message);
        console.log("\n--- VERIFICATION LINK (EMERGENCY LOG) ---");
        console.log(`Link: ${fallbackLink}`);
        console.log("------------------------------------------\n");
        // We throw so auth.js knows it failed, but we logged the link
        throw error;
    }
};

module.exports = sendEmail;

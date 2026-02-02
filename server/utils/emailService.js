const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try {
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

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
        console.error("Error sending email: ", error);
        throw error;
    }
};

module.exports = sendEmail;

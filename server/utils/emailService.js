const axios = require('axios');

const sendEmail = async (to, subject, html, fallbackLink) => {
    // 1. Google Apps Script Proxy (Universal - sends to ANYONE from your Gmail)
    if (process.env.MAIL_PROXY_URL) {
        try {
            console.log('Sending email via Google Proxy to:', to);
            const response = await axios.post(process.env.MAIL_PROXY_URL, {
                to: to,
                subject: subject,
                html: html
            });

            if (response.data.status === 'success' || response.data === 'success') {
                console.log('Email sent successfully via Google Proxy!');
                return { status: 'success' };
            } else {
                console.error('Proxy Error Response:', response.data);
            }
        } catch (error) {
            console.error('Google Proxy Request Failed:', error.message);
        }
    }

    // 2. Resend API (Limited to self-sending on free tier)
    if (process.env.RESEND_API_KEY) {
        try {
            console.log('Sending email via Resend API (Limited to self)...');
            const response = await axios.post('https://api.resend.com/emails', {
                from: process.env.SMTP_FROM || 'onboarding@resend.dev',
                to: [to],
                subject: subject,
                html: html
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Resend Delivery ID:', response.data.id);
            return response.data;
        } catch (apiError) {
            console.error('Resend API Error:', apiError.response ? apiError.response.data : apiError.message);
        }
    }

    // FINAL FALLBACK
    console.log("\n--- VERIFICATION LINK FALLBACK ---");
    console.log(`User: ${to}`);
    console.log(`Link: ${fallbackLink}`);
    console.log("----------------------------------\n");

    return { status: 'fallback-logged' };
};

module.exports = sendEmail;

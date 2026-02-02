const axios = require('axios');

const sendEmail = async (to, subject, html, fallbackLink) => {
    // 1. Resend API (HTTPS - bypasses Render port blocks)
    if (process.env.RESEND_API_KEY) {
        try {
            console.log('Sending email via Resend API to:', to);

            const from = process.env.SMTP_FROM || 'onboarding@resend.dev';

            const response = await axios.post('https://api.resend.com/emails', {
                from: from,
                to: [to],
                subject: subject,
                html: html
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Email sent successfully via Resend! ID:', response.data.id);
            return response.data;
        } catch (apiError) {
            console.error('Resend API error:', apiError.response ? apiError.response.data : apiError.message);
            // Fallback continues below
        }
    }

    // 2. FINAL FALLBACK: Always log the link to the server console
    console.log("\n--- !!! VERIFICATION LINK FALLBACK !!! ---");
    console.log(`To: ${to}`);
    console.log(`Link: ${fallbackLink}`);
    console.log("------------------------------------------\n");

    return { status: 'fallback-logged' };
};

module.exports = sendEmail;

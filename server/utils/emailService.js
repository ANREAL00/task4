const axios = require('axios');

const sendEmail = async (to, subject, html, fallbackLink) => {
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

    return { status: 'sendEmailError' };
};

module.exports = sendEmail;

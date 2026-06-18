require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load Twilio credentials (if available)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;
if (accountSid && accountSid.startsWith('AC') && authToken) {
    try {
        twilioClient = twilio(accountSid, authToken);
    } catch (e) {
        console.error('Twilio initialization failed: Please check your credentials in .env');
    }
}

// POST endpoint to handle form submissions
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;

    console.log(`[Form Submission] Name: ${name}, Email: ${email}, Phone: ${phone}`);

    try {
        // If a phone number was provided and Twilio is set up, send the SMS
        if (phone && twilioClient) {
            await twilioClient.messages.create({
                body: `Hi ${name}, thank you for connecting! I will contact you soon. - Ankush`,
                from: twilioPhone,
                to: phone
            });
            console.log(`SMS successfully sent to ${phone}`);
        } else if (!twilioClient) {
            console.log('Skipping SMS: Twilio credentials not found in .env');
        }

        // Note: You can add an email sender (like Nodemailer) here later if you want 
        // to receive the client's message directly to your email inbox!

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ success: false, error: 'Failed to send automated SMS.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[Backend Active] Server is running on http://localhost:${PORT}`);
    if (!accountSid || !accountSid.startsWith('AC')) console.log('--> Note: Please configure your .env file with a valid Twilio Account SID to enable SMS transmission.');
});

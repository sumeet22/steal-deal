import express from 'express';
import Message from '../models/Message.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// @route   POST api/contact
// @desc    Send a contact message
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // Save to database
        const newMessage = new Message({
            name,
            email,
            subject,
            message,
        });

        await newMessage.save();

        // Send email to admin
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Steal Deal Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: `New Contact Message: ${subject}`,
            html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailErr) {
            console.error('Email send failed for contact form:', emailErr.message || emailErr);
            // We still return success because it's saved in the DB
        }

        res.status(200).json({ msg: 'Message sent successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;

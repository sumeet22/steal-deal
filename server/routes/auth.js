import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();

// Helper to generate a verification token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Helper to send verification email
const sendVerificationEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${user.verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify Your Email',
    html: `<p>Please click this link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

// @route   POST api/auth/register
// @desc    Register user & send verification email
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const verificationToken = generateToken(email);

    user = new User({
      name,
      email,
      password,
      phone,
      role,
      verificationToken,
    });

    await user.save();
    try {
      await sendVerificationEmail(user);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message || emailErr);
      // Continue even if email fails so registration doesn't block; notify client
      return res.status(201).json({ msg: 'User registered, but verification email failed to send. Please contact admin.' });
    }

    res.status(201).json({ msg: 'User registered. Please check your email for verification.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findOne({ email: decoded.id });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid token or user not found' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('Email verified successfully!');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error or invalid token');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email first.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ msg: 'Your account has been banned.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
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
    from: `"Steal Deal" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '✨ Verify Your Email - Steal Deal',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      🎉 Welcome to Steal Deal!
                    </h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                      Hi <strong>${user.name}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Thank you for registering with <strong>Steal Deal</strong>! We're excited to have you on board. 
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      To complete your registration and start shopping amazing deals, please verify your email address by clicking the button below:
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 0 0 30px;">
                          <a href="${verificationUrl}" 
                             style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Or copy and paste this link into your browser:
                    </p>
                    
                    <p style="margin: 0 0 30px; padding: 12px; background-color: #f9fafb; border-radius: 6px; word-break: break-all;">
                      <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                        ${verificationUrl}
                      </a>
                    </p>
                    
                    <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>⏰ Important:</strong> This verification link will expire in <strong>1 hour</strong> for security reasons.
                      </p>
                    </div>
                    
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      If you didn't create an account with Steal Deal, please ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
                      Happy Shopping! 🛍️
                    </p>
                    <p style="margin: 0 0 15px; color: #1f2937; font-size: 16px; font-weight: 600; text-align: center;">
                      The Steal Deal Team
                    </p>
                    
                    <div style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0 0 5px; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} Steal Deal. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        This is an automated email. Please do not reply.
                      </p>
                    </div>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
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

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified Successfully - Steal Deal</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 60px 40px;
            text-align: center;
            animation: slideUp 0.5s ease-out;
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            animation: scaleIn 0.5s ease-out 0.2s both;
          }
          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }
          .checkmark {
            width: 40px;
            height: 40px;
            border: 4px solid white;
            border-top: none;
            border-right: none;
            transform: rotate(-45deg);
            margin-top: -8px;
          }
          h1 {
            color: #1f2937;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
          }
          p {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .redirect-info {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .redirect-info p {
            margin: 0;
            color: #4b5563;
            font-size: 14px;
          }
          .countdown {
            font-weight: 700;
            color: #667eea;
            font-size: 18px;
          }
          .btn {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
          }
          .footer {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">
            <div class="checkmark"></div>
          </div>
          
          <h1>✨ Email Verified!</h1>
          
          <p>
            Congratulations! Your email has been successfully verified. 
            You can now log in and start shopping amazing deals.
          </p>
          
          <div class="redirect-info">
            <p>
              Redirecting you to login in <span class="countdown" id="countdown">5</span> seconds...
            </p>
          </div>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/?view=auth" class="btn">
            Go to Login Now
          </a>
          
          <div class="footer">
            <p>🎉 Welcome to Steal Deal!</p>
          </div>
        </div>
        
        <script>
          let seconds = 5;
          const countdownEl = document.getElementById('countdown');
          const redirectUrl = '${process.env.FRONTEND_URL || 'http://localhost:5173'}/?view=auth';
          
          const interval = setInterval(() => {
            seconds--;
            if (countdownEl) countdownEl.textContent = seconds;
            
            if (seconds <= 0) {
              clearInterval(interval);
              window.location.href = redirectUrl;
            }
          }, 1000);
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Error - Steal Deal</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 60px 40px;
            text-align: center;
          }
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #1f2937;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 16px;
          }
          p {
            color: #6b7280;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .btn {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h1>Verification Failed</h1>
          <p>
            The verification link is invalid or has expired. 
            Please try registering again or contact support.
          </p>
          <a href="${process.env.BASE_URL?.replace(':5000', ':5173') || 'http://localhost:5173'}/?view=auth" class="btn">
            Back to Login
          </a>
        </div>
      </body>
      </html>
    `);
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
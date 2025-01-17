const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../Models/User');
const PasswordResetToken = require('../Models/PasswordResetTokens');
const crypto = require('crypto');

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log("log the emmail", email);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }
        const existingToken = await PasswordResetToken.findOne({
            user_id: user._id,
            expires_at: { $gt: new Date() },
        });
        let token;
        if (existingToken) {
            token = existingToken.token; 
        } else {
            token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            await PasswordResetToken.create({
                user_id: user._id,
                token: token,
                expires_at: expiresAt,
            });
        }
  
        // Create reset URL with the token
        const resetUrl = `https://your-frontend-url.com/resetpassword/${token}`;
  
        const mailOptions = {
            to: user.email,
            from: 'your-email@gmail.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            ${resetUrl}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        await transporter.sendMail(mailOptions);
        console.log("log the url ", resetUrl)
        res.send('Password reset link sent to email');
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Server error');
    }
});

// Reset Password Endpoint
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const resetToken = await PasswordResetToken.findOne({
            token: token,
            expires_at: { $gt: new Date() }, 
        });
        if (!resetToken) {
            return res.status(400).send('Invalid or expired token');
        }
        const user = await User.findById(resetToken.user_id);
        if (!user) {
            return res.status(400).send('User not found');
        }
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        await PasswordResetToken.deleteOne({ token: token }); 
        res.send('Password has been reset successfully');
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { authenticateToken } = require('../middleware/authMiddleware');
require('dotenv').config();
const router = express.Router();
const mongoose = require("mongoose");
const Role = require('../Models/Role');
const UserDetails = require('../Models/UserDetails');
const JoiningDate = require('../Models/JoiningDate');
const ExpireUser = require('../Models/ExpireUser');

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT tokens with 12 hours expiration
const generateAccessToken = (user) => jwt.sign(user, JWT_SECRET, { expiresIn: '10h' });

// POST /register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const expireData = await ExpireUser.findOne();
    const currentDate = new Date();
    const currentDateOnly = new Date(currentDate.toISOString().slice(0, 10));
    const expireDate = new Date(expireData.expire_date);
    const expireDataOnly = new Date(expireDate.toISOString().slice(0, 10));

    if (currentDateOnly > expireDataOnly) {
      return res.status(403).json({ message: "Register is not allowed, the access has expired!" });
    }

    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      Role_id: '679098175ea402d05759f3e5',
    });

    await newUser.save();
    const fullName = `${newUser.first_name} ${newUser.last_name}`;
    res.status(201).json({
      message: 'User registered successfully',
      name: fullName,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.user_type !== 'SuperAdmin') {
      const expireData = await ExpireUser.findOne();
      const currentDate = new Date();
      const currentDateOnly = new Date(currentDate.toISOString().slice(0, 10));
      const expireDate = new Date(expireData.expire_date);
      const expireDataOnly = new Date(expireDate.toISOString().slice(0, 10));
      if (currentDateOnly > expireDataOnly) {
        return res.status(403).json({ message: "Login is not allowed, the access has expired!" });
      }
    }

    if (!user.Is_active) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact Admin.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const userPayload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(userPayload);
    const fullName = `${user.first_name} ${user.last_name}`;
    res.status(200).json({
      message: 'Login successful',
      name: fullName,
      accessToken,
      role: user.user_type,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Status route
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      isAuthenticated: true,
      Username: user.first_name,
      role: user.user_type,
      userId: user._id,
      message: "Status retrieved successfully"
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ message: 'Error checking status', error });
  }
});

// Update the expire employee data
router.post("/updateExpiredate", authenticateToken, async (req, res) => {
  const { expire_date, expire_id } = req.body;
  try {
    const existingExpireUser = await ExpireUser.findById(expire_id);
    if (existingExpireUser) {
      const result = await ExpireUser.updateOne(
        { _id: expire_id },
        { $set: { expire_date, updatedAt: new Date() } }
      );
      if (result.modifiedCount === 0) {
        return res.status(400).json({ message: 'No changes were made to the expire date.' });
      }
      return res.status(200).json({ message: 'Expire date updated successfully' });
    } else {
      await ExpireUser.create({
        _id: expire_id,
        expire_date: expire_date,
        updatedAt: new Date(),
      });
      return res.status(200).json({ message: 'New expire date created successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Expire date update failed" });
  }
});

// Get all expire dates
router.get("/getallExpiredate", authenticateToken, async (req, res) => {
  try {
    const data = await ExpireUser.find().lean();
    const modifiedData = data.map((item) => ({
      expire_id: item._id,
      expire_date: item.expire_date,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
    return res.status(200).json(modifiedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve expire dates" });
  }
});

module.exports = router;
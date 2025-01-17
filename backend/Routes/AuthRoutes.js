const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { authenticateToken } = require('../middleware/authMiddleware');
require('dotenv').config();
const router = express.Router();
const  mongoose = require("mongoose")
const Role = require('../Models/Role');

const JWT_SECRET = process.env.JWT_SECRET;
// Generate JWT tokens with 12 hours expiration
const generateAccessToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '10h' });
};

// POST /register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !password) {
      console.error('Validation failed: Missing fields in request body', req.body);
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with default Role_id (you can set a default Role ID directly in the model)
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      Role_id: '677f838269cab4be70d11c9b',  // Default role ID
    });

    console.log(newUser);
    // Save the new user to the database
    await newUser.save();

    // Construct full name
    const fullName = `${newUser.first_name} ${newUser.last_name}`;

    // Respond with success
    res.status(201).json({
      message: 'User registered successfully',
      name: fullName,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});




// POST /login - Authenticate use



//login system with-out reister !
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required!" });
    }
    let user = await User.findOne({ email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const userPayload = { id: user._id, email: user.email };
      const accessToken = generateAccessToken(userPayload);
      return res.status(200).json({ message: "Login successful", accessToken });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        email,
        password: hashedPassword
      });
      await user.save();
      const userPayload = { id: user._id, email: user.email };
      const accessToken = generateAccessToken(userPayload);
      return res.status(201).json({ message: "New user created and logged in", accessToken });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Status route
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // Use the user ID from the token payload
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      isAuthenticated: true,
      Username: user.first_name,
      role: user.user_type,
      userId: user._id,
      message:"status get successful"
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ message: 'Error checking status', error });
  }
});



router.post('/roles', async (req, res) => {
  const { role_name } = req.body;
  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required.' });
  }
  try {
    const existingRole = await Role.findOne({ role_name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists.' });
    }
    const role = new Role({ role_name });
    await role.save();
    res.status(201).json({
      message: 'Role created successfully',
      role,
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      message: 'Internal server error while creating role.',
      error: error.message || error,
    });
  }
});






module.exports = router;
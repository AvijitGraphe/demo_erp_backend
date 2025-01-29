const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { authenticateToken } = require('../middleware/authMiddleware');
require('dotenv').config();
const router = express.Router();
const  mongoose = require("mongoose")
const Role = require('../Models/Role');
const UserDetails = require('../Models/UserDetails');
const JoiningDate = require('../Models/JoiningDate');
const ExpireUser = require('../Models/ExpireUser');

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
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      Role_id: '679098175ea402d05759f3e5',  // Default role ID
    });
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
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required!" });
//     }
//     let user = await User.findOne({ email });
//     if (user) {
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         return res.status(400).json({ message: 'Invalid email or password' });
//       }
//       const userPayload = { id: user._id, email: user.email };
//       const accessToken = generateAccessToken(userPayload);
//       return res.status(200).json({ message: "Login successful", accessToken });
//     } else {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user = new User({
//         email,
//         password: hashedPassword
//       });
//       await user.save();
//       const userPayload = { id: user._id, email: user.email };
//       const accessToken = generateAccessToken(userPayload);
//       return res.status(201).json({ message: "New user created and logged in", accessToken });
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fetch the expiration data
    const expireData = await ExpireUser.findOne();
    console.log("expireData", expireData);
    
    // If expiration data exists, check if the account is expired
    if (expireData) {
      const currentDate = new Date();  // Get the current date and time
      console.log("currentDate", currentDate);
      
      // Convert current date to the start of the day (midnight) in UTC (Year, Month, Day only)
      const currentDateMidnightUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
      console.log("currentDateMidnightUTC:", currentDateMidnightUTC);
      
      // Convert expire date to the start of the day (midnight) in UTC (Year, Month, Day only)
      const expireDateMidnightUTC = new Date(Date.UTC(expireData.expire_date.getUTCFullYear(), expireData.expire_date.getUTCMonth(), expireData.expire_date.getUTCDate()));
      console.log("expireDateMidnightUTC:", expireDateMidnightUTC);
      
      // If the expiration date is today or has passed, deny login
      if (expireDateMidnightUTC <= currentDateMidnightUTC) {
        return res.status(403).json({ message: 'Your account has expired. Please contact Admin.' });
      }
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact Admin.' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If successful, generate tokens
    const userPayload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(userPayload);

    // Send tokens in response to be stored in session storage
    const fullName = `${user.firstName} ${user.lastName}`;
    res.status(200).json({
      message: 'Login successful',
      name: fullName,
      accessToken,
      role: user.userType,
    });
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






//update the expire employee data
router.post("/updateExpiredate", authenticateToken, async (req, res) => {
  const { expire_date, expire_id } = req.body;
  console.log(expire_date, expire_id);
  
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



router.get("/getallExpiredate", authenticateToken, async (req, res) => {
  try {
    const data = await ExpireUser.find().lean();
    const modifiedData = data.map(item => ({
      expire_id: item._id,
      expire_date: item.expire_date,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
    console.log(data);
    
    return res.status(200).json(modifiedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Expire date update failed" });
  }
});









module.exports = router;
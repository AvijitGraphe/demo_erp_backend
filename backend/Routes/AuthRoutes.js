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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    if (!user.Is_active) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact Admin.' });
    }
    
    // Check if the expireDate has passed
    const currentDate = new Date();
    if (user.expire_date && new Date(user.expire_date) < currentDate) {
      return res.status(403).json({ message: 'Your account has expired. Please contact Admin.' });
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
  const { expire_date, user_id } = req.body;
  console.log(expire_date, user_id)
  try {
      const userlog = await User.findById(user_id);
      if (!userlog) {
          return res.status(404).json({ message: 'User Not Found!' });
      }
      const result = await User.updateOne({ _id: userlog._id }, { $set: { expire_date } });
      if (result.modifiedCount === 0) {
          return res.status(400).json({ message: 'No changes were made to the user.' });
      }

      await ExpireUser.create({
          user_id: userlog._id,
          expire_date: expire_date,
          updatedAt: new Date(),
      });
      res.status(200).json({ message: 'Expire date updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Expire update failed" });
  }
});



//get the expire employee data
router.get('/getallEmplooyee', authenticateToken, async (req, res) => {
  try {
    const employees = await User.aggregate([
      {
        $lookup: {
          from: "joiningdates",
          localField: "_id",
          foreignField: "user_id",
          as: "joindates",
        }
      },
      {
        $unwind: {
          path: "$joindates",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          user_id: "$_id",
          first_name: 1,
          last_name: 1,
          email: 1,
          phone: 1,
          expireDate: 1,
          user_type: 1,
          expire_date:1,
          createdAt:1,
          joiningDate: "$joindates.joining_date",
        }
      }
    ]);

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    res.json(employees);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});







module.exports = router;
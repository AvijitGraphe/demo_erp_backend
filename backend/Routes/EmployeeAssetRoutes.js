const express = require('express');
const router = express.Router();
const EmployeeAssets = require('../Models/EmployeeAssets'); // Mongoose model for EmployeeAssets
const User = require('../Models/User'); // Mongoose model for User (if needed)
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/authMiddleware');

// Add multiple assets to employee
router.post('/add-multiple-assets', authenticateToken, async (req, res) => {
  const { user_id, assets } = req.body;
  // Validate the request payload
  if (!user_id || !Array.isArray(assets) || assets.length === 0) {
    return res.status(400).json({
      error: 'Invalid request payload. Please provide user_id and an array of assets.',
    });
  }
  try {
    // Prepare bulk data for insertion
    const assetsData = assets.map((asset) => ({
      user_id,
      Asset_Serial_No: asset.Asset_Serial_No,
      Asset_name: asset.Asset_name,
      Asset_Status: asset.Asset_Status || 'Provided',
      Asset_icon: asset.Asset_icon,
    }));
    // Insert multiple assets into the EmployeeAssets collection
    await EmployeeAssets.insertMany(assetsData);
    return res.status(201).json({ message: 'Assets added successfully.' });
  } catch (error) {
    console.error('Error adding assets:', error.message);
    return res.status(500).json({
      error: 'Failed to add assets.',
      details: error.message,
    });
  }
});


module.exports = router;

const express = require('express');
const User = require('../Models/User');
const Role = require('../Models/Role');
const UserDetails = require('../Models/UserDetails'); 
const Bank_Details = require('../Models/BankDetails'); 
const EducationInfo = require('../Models/EducationInfo'); 
const EmergencyContact = require('../Models/EmergencyContact'); 
const JoiningDate = require('../Models/JoiningDate');
const UserTime = require('../Models/Usertime'); 
const ProfileImage = require('../Models/ProfileImage'); 
const { authenticateToken } = require('../middleware/authMiddleware');
require('dotenv').config();
const router = express.Router();
const Attendance = require('../Models/Attendance');
const moment = require('moment');

const mongoose = require('mongoose');

// Add or update UserDetails 
router.post('/user-details', authenticateToken, async (req, res) => {
  try {
    const {
      user_id,
      details_id,
      address,
      city,
      pincode,
      state,
      country,
      phone,
      gender,
      date_of_birth,
      forte,
      other_skills,
      pan_card_no,
      passport_no,
      aadhar_no,
      nationality,
      religion,
      marital_status,
      employment_of_spouse,
      no_of_children
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required.' });
    }

    const data = {
      user_id,
      address,
      city,
      pincode,
      state,
      country,
      phone,
      gender,
      date_of_birth,
      forte,
      other_skills,
      pan_card_no,
      passport_no,
      aadhar_no,
      nationality,
      religion,
      marital_status,
      employment_of_spouse,
      no_of_children
    };

    // Remove undefined fields from the data object
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    let response;
    if (details_id) {
      // Update existing record
      const existingRecord = await UserDetails.findOne({ _id: details_id, user_id });
      if (existingRecord) {
        response = await existingRecord.updateOne(data);
        return res.status(200).json({ message: 'User details updated successfully.', data: response });
      } else {
        return res.status(404).json({ message: 'User details not found for the provided details_id and user_id.' });
      }
    } else {
      response = await UserDetails.create(data); 
      return res.status(201).json({ message: 'User details added successfully.', data: response });
    }
  } catch (error) {
    console.error('Error adding/updating user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Fetch UserDetails by user_id API
router.get('/getUserDetails', authenticateToken, async (req, res) => {
  const { userId } = req.query;
  try {
    const userDetails = await UserDetails.findOne({ user_id: userId });
    if (!userDetails) {
      return res.status(204).end(); 
    }
    const userDetailsResponse = userDetails.toObject();
    userDetailsResponse.details_id = userDetailsResponse._id;
    delete userDetailsResponse._id;
    res.status(200).json(userDetailsResponse);
  } catch (error) {
    console.error(`Error fetching user details: ${error.message}`);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});




// Add or update BankDetails 
router.post('/bank-details', authenticateToken, async (req, res) => {
  try {
    const {
      user_id,
      id_bank_details,
      bank_name,
      bank_account_no,
      ifsc_code,
      branch_name,
      accountHolder_name
    } = req.body;

    // Check if user_id is provided
    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required.' });
    }
    // Construct the data object
    const data = {
      user_id,
      bank_name,
      bank_account_no,
      ifsc_code,
      branch_name,
      accountHolder_name
    };

    // Remove undefined fields from the data object
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    let response;

    // Check if id_bank_details is provided (to update an existing record)
    if (id_bank_details) {
      // Try to find an existing record
      const existingRecord = await Bank_Details.findOne({ _id: id_bank_details, user_id });
      
      if (existingRecord) {
        // If record exists, update it
        response = await existingRecord.updateOne(data);
        return res.status(200).json({ message: 'Bank details updated successfully.', data: response });
      } else {
        // If record does not exist, return a 404 error
        return res.status(404).json({ message: 'Bank details not found for the provided id_bank_details and user_id.' });
      }
    } else {
      // If id_bank_details is not provided, create a new record
      response = await Bank_Details.create(data);
      return res.status(201).json({ message: 'Bank details added successfully.', data: response });
    }
  } catch (error) {
    // Handle any errors
    console.error('Error adding/updating bank details:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Fetch BankDetails by user_id API
router.get('/getBankDetails', authenticateToken, async (req, res) => {
  const { userId } = req.query;

  try {
    const bankDetails = await Bank_Details.findOne({ user_id: userId });
    if (!bankDetails) {
      return res.status(204).end();
    }

    const bankDetailsResponse = bankDetails.toObject();
    bankDetailsResponse.id_bank_details = bankDetailsResponse._id;
    delete bankDetailsResponse._id;

    res.status(200).json(bankDetailsResponse);
  } catch (error) {
    console.error(`Error fetching bank details: ${error.message}`);
    res.status(500).json({ message: 'Error fetching bank details', error: error.message });
  }
});



// Add or update EducationInfo

router.post('/education-info', authenticateToken, async (req, res) => {
  try {
    const {
      user_id,
      id_educational_info,
      institute,
      year_of_passing,
      degree_name
    } = req.body;

    // Check if user_id is provided
    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required.' });
    }

    // Construct the data object
    const data = {
      user_id,
      institute,
      year_of_passing,
      degree_name
    };

    // Remove undefined fields from the data object
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    let response;

    // Check if id_educational_info is provided (to update an existing record)
    if (id_educational_info) {
      // Try to find an existing record
      const existingRecord = await EducationInfo.findOne({ _id : id_educational_info, user_id });

      if (existingRecord) {
        // If record exists, update it
        response = await existingRecord.updateOne(data);
        return res.status(200).json({ message: 'Education info updated successfully.', data: response });
      } else {
        // If record does not exist, return a 404 error
        return res.status(404).json({ message: 'Education info not found for the provided id_educational_info and user_id.' });
      }
    } else {
      // If id_educational_info is not provided, create a new record
      response = await EducationInfo.create(data);
      return res.status(201).json({ message: 'Education info added successfully.', data: response });
    }
  } catch (error) {
    // Handle any errors
    console.error('Error adding/updating education info:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Fetch EducationInfo by user_id API
router.get('/getEducationInfo', authenticateToken, async (req, res) => {
  const { userId } = req.query;
  try {
    const educationInfo = await EducationInfo.find({ user_id: userId });
    if (educationInfo.length === 0) {
      return res.status(204).end();
    }

    const educationInfoResponse = educationInfo.map(item => {
      const itemResponse = item.toObject();
      itemResponse.id_educational_info = itemResponse._id;
      delete itemResponse._id;
      return itemResponse;
    });

    res.status(200).json(educationInfoResponse);
  } catch (error) {
    console.error(`Error fetching education info: ${error.message}`);
    res.status(500).json({ message: 'Error fetching education info', error: error.message });
  }
});



// Add or update EmergencyContact
router.post('/emergency-contact', authenticateToken, async (req, res) => {
  const {
    user_id,
    id_emergency_contact,
    name,
    relationship,
    phone
  } = req.body;

  try {
    // Check if user_id is provided
    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required.' });
    }

    // If only id_emergency_contact is provided and no other fields, delete the contact
    if (id_emergency_contact && !name && !relationship && !phone) {
      const existingRecord = await EmergencyContact.findOne({ _id: id_emergency_contact, user_id });
      if (existingRecord) {
        await existingRecord.remove();
        return res.status(200).json({ message: 'Emergency contact deleted successfully.' });
      } else {
        return res.status(404).json({ message: 'Emergency contact not found.' });
      }
    }

    const data = { user_id, name, relationship, phone };

    // Remove undefined fields from the data object
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    let response;

    if (id_emergency_contact) {
      // Update existing record
      const existingRecord = await EmergencyContact.findOne({ _id: id_emergency_contact, user_id });
      if (existingRecord) {
        existingRecord.set(data); // Update the fields
        response = await existingRecord.save();
        return res.status(200).json({ message: 'Emergency contact updated successfully.', data: response });
      } else {
        return res.status(404).json({ message: 'Emergency contact not found.' });
      }
    } else {
      // Create a new record
      response = await EmergencyContact.create(data);
      return res.status(201).json({ message: 'Emergency contact added successfully.', data: response });
    }
  } catch (error) {
    // Handle any errors
    console.error('Error adding/updating/deleting emergency contact:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Fetch EmergencyContact by user_id API
router.get('/getEmergencyContact', authenticateToken, async (req, res) => {
  const { userId } = req.query;
  try {
    const emergencyContact = await EmergencyContact.find({ user_id: userId });
    if (!emergencyContact || emergencyContact.length === 0) {
      return res.status(204).end();
    }

    const emergencyContactResponse = emergencyContact.map(item => {
      const itemResponse = item.toObject();
      itemResponse.id_emergency_contact = itemResponse._id;
      delete itemResponse._id;
      return itemResponse;
    });

    res.status(200).json(emergencyContactResponse);
  } catch (error) {
    console.error(`Error fetching emergency contact: ${error.message}`);
    res.status(500).json({ message: 'Error fetching emergency contact', error: error.message });
  }
});




router.get('/main-user-details', authenticateToken, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const todayStart = moment().startOf('day').toDate(); // Start of the current day
    const todayEnd = moment().endOf('day').toDate(); // End of the current day
    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert userId to ObjectId

    const userDetails = await User.aggregate([
      { $match: { _id: userObjectId } }, // Match user by ObjectId
      {
        $lookup: {
          from: 'roles',
          localField: 'Role_id',
          foreignField: '_id',
          as: 'role',
          pipeline: [{ $project: { role_name: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'usertimes',
          localField: '_id',
          foreignField: 'user_id',
          as: 'userTimes',
          pipeline: [
            { $project: { start_time: 1, createdAt: 1, updatedAt: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'joiningdates',
          localField: '_id',
          foreignField: 'user_id',
          as: 'joiningDates',
          pipeline: [
            { $project: { joining_date: 1, createdAt: 1, updatedAt: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'resignations',
          localField: '_id',
          foreignField: 'user_id',
          as: 'resignations',
          pipeline: [
            { $match: { status: 'Approved' } },
            { $project: { status: 1, last_working_day: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user_id',
          as: 'attendances',
          pipeline: [
            { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
            { $project: { checkin_status: 1 } }
          ]
        }
      },
      {
        $project: {
          password: 0,
          __v: 0, // Exclude version key if needed
        }
      }
    ]);
    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userDetail = userDetails[0];
    if (userDetail.userTimes.length === 0) {
      console.log('No user times found for the given user.');
    }

    res.status(200).json(userDetail);
  } catch (error) {
    console.error(`Error fetching user details: ${error.message}`);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});





/**
 *Get all profile of users Api 
 */
 router.get('/getallusers', authenticateToken, async (req, res) => {
  try {
    const today = moment().startOf('day').toDate();
    const users = await User.aggregate([
      {
        $match: {
          user_type: { $nin: ['Unverified', 'SuperAdmin'] },
        },
      },
      {
        $lookup: {
          from: 'usertimes',
          localField: '_id',
          foreignField: 'user_id',
          as: 'userTimes',
        },
      },
      {
        $lookup: {
          from: 'joiningdates',
          localField: '_id',
          foreignField: 'user_id',
          as: 'joiningDates',
        },
      },
      {
        $lookup: {
          from: 'resignations',
          localField: '_id',
          foreignField: 'user_id',
          as: 'resignations',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user_id', '$$userId'] },
                status: 'Approved',
              },
            },
            {
              $project: { status: 1, last_working_day: 1 },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'profileImages',
          localField: '_id',
          foreignField: 'user_id',
          as: 'profileImage',
        },
      },
      {
        $lookup: {
          from: 'userdetails',
          localField: '_id',
          foreignField: 'user_id',
          as: 'userDetails',
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user_id',
          as: 'attendances',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user_id', '$$userId'] },
                date: { $gte: today, $lt: moment(today).endOf('day').toDate() },
              },
            },
            {
              $project: { checkin_status: 1, _id: 0 },
            },
          ],
        },
      },
      {
        $sort: {
          first_name: 1,
          last_name: 1,
        },
      },
    ]);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





module.exports = router;
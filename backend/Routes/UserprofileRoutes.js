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


    console.log("log the existingRecord",  details_id)
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
      // Create a new record
      console.log("log the data", data)
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
    res.status(200).json(bankDetails);
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
    // Fetch all education info for the given userId
    const educationInfo = await EducationInfo.find({ user_id: userId });

    if (educationInfo.length === 0) {
      // If no education info found, return 204 No Content
      return res.status(204).end();
    }

    // Return the found education info as JSON
    res.status(200).json(educationInfo);
  } catch (error) {
    console.error(`Error fetching education info: ${error.message}`);
    // Return a 500 Internal Server Error response
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
      return res.status(204).end(); // 204 No Content if no records found
    }
    res.status(200).json(emergencyContact); // Send the found emergency contact as JSON
  } catch (error) {
    console.error(`Error fetching emergency contact: ${error.message}`);
    res.status(500).json({ message: 'Error fetching emergency contact', error: error.message });
  }
});

// Fetch main user details -
router.get('/main-user-details', authenticateToken, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const today = moment().format('YYYY-MM-DD'); 

    const aggregationPipeline = [
      {
        $match: { user_id: userId } // Match the user based on userId
      },
      {
        $lookup: {
          from: 'roles', // Name of the collection in MongoDB
          localField: 'role', // Field from the User model that references the Role
          foreignField: '_id', // _id from the Role model
          as: 'role'
        }
      },
      {
        $unwind: { path: '$role', preserveNullAndEmptyArrays: true } // Unwind the role array
      },
      {
        $lookup: {
          from: 'usertimes', // Name of the collection in MongoDB
          localField: '_id', // The user _id
          foreignField: 'user_id', // user_id in the UserTime model
          as: 'userTimes'
        }
      },
      {
        $lookup: {
          from: 'joiningdates', // Name of the collection in MongoDB
          localField: '_id', // The user _id
          foreignField: 'user_id', // user_id in the JoiningDate model
          as: 'joiningDates'
        }
      },
      {
        $lookup: {
          from: 'attendances', // Name of the collection in MongoDB
          localField: '_id', // The user _id
          foreignField: 'user_id', // user_id in the Attendance model
          as: 'attendances',
          pipeline: [
            { $match: { date: today } }, // Filter attendance by today's date
            { $project: { checkin_status: 1, _id: 0 } } // Select only checkin_status
          ]
        }
      },
      {
        $project: {
          _id: 1, // Include _id field
          user_id: 1,
          address: 1,
          city: 1,
          pincode: 1,
          state: 1,
          country: 1,
          phone: 1,
          gender: 1,
          date_of_birth: 1,
          forte: 1,
          other_skills: 1,
          pan_card_no: 1,
          passport_no: 1,
          aadhar_no: 1,
          nationality: 1,
          religion: 1,
          marital_status: 1,
          employment_of_spouse: 1,
          no_of_children: 1,
          createdAt: 1,
          updatedAt: 1,
          role: 1, // Include role field
          userTimes: 1, // Include userTimes
          joiningDates: 1, // Include joiningDates
          attendances: 1 // Include attendances
        }
      }
    ];
    

    // Execute the aggregation pipeline
    const userDetails = await User.aggregate(aggregationPipeline);

    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userDetails[0]); // Send the first result
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
    const today = moment().format('YYYY-MM-DD');

    const users = await User.aggregate([
        {
            $match: {
                user_type: { $nin: ['Unverified', 'SuperAdmin'] }
            }
        },
        {
            $lookup: {
                from: 'usertimes',
                localField: '_id',
                foreignField: 'user_id',
                as: 'userTimes'
            }
        },
        {
            $lookup: {
                from: 'joiningdates',
                localField: '_id',
                foreignField: 'user_id',
                as: 'joiningDates'
            }
        },
        {
            $lookup: {
                from: 'resignations',
                localField: '_id',
                foreignField: 'user_id',
                as: 'resignations',
                pipeline: [
                    {
                        $match: { status: 'Approved' }
                    },
                    {
                        $project: {
                            status: 1,
                            last_working_day: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'profileimages',
                localField: '_id',
                foreignField: 'user_id',
                as: 'profileImage'
            }
        },
        {
            $lookup: {
                from: 'userdetails',
                localField: '_id',
                foreignField: 'user_id',
                as: 'userDetails'
            }
        },
        {
            $lookup: {
                from: 'attendances',
                localField: '_id',
                foreignField: 'user_id',
                as: 'attendances',
                pipeline: [
                    {
                        $match: { date: today }
                    },
                    {
                        $project: {
                            checkin_status: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                userTypePriority: {
                    Founder: 1,
                    Admin: 2,
                    HumanResource: 3,
                    Accounts: 4,
                    Department_Head: 5,
                    Employee: 6,
                    Task_manager: 7,
                    Social_Media_Manager: 8,
                    Ex_employee: 9
                }
            }
        },
        {
            $addFields: {
                priority: {
                    $ifNull: [{ $arrayElemAt: [{ $objectToArray: "$userTypePriority" }, 0] }, 999]
                }
            }
        },
        {
            $sort: {
                priority: 1,
                first_name: 1,
                last_name: 1
            }
        }
    ]);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Role = require('../Models/Role');
const JoiningDate = require('../Models/JoiningDate'); // Adjust the path as necessary
const UserTime = require('../Models/Usertime'); // Adjust the path as necessary
const ProfileImage = require('../Models/ProfileImage');
const UserDetails = require('../Models/UserDetails');
const BankDetails = require('../Models/BankDetails');
const EducationInfo = require('../Models/EducationInfo');
const EmergencyContact = require('../Models/EmergencyContact');


const mongoose = require('mongoose');

const moment = require('moment'); // Install moment.js if not already installed
const { authenticateToken } = require('../middleware/authMiddleware');

// Employee verification
router.post('/update-user-role-location', authenticateToken, async (req, res) => {
    const { user_id, user_type, joining_date, start_time } = req.body;
    console.log(" user_id, user_type, joining_date, start_time",  user_id, user_type, joining_date, start_time)

    if (!user_id || !user_type || !joining_date || !start_time) {
        return res.status(400).json({ message: 'Missing required fields: user_id, user_type, joining_date, start_time' });
    }

    if (user_type === 'SuperAdmin') {
        return res.status(400).json({ message: 'Cannot update user to SuperAdmin role' });
    }

    try {
        // Step 1: Fetch the role from the Role collection
        const role = await Role.findOne({
            role_name: user_type,
        });

        if (!role) {
            return res.status(404).json({ message: 'Role not found or role is SuperAdmin' });
        }

        // Step 2: Update user details (User model)
        await User.updateOne(
            { user_id },
            { $set: { Role_id: role._id, user_type: role.role_name } }
        );

        // Step 3: Update or create joining date (JoiningDate model)
        const existingJoiningDate = await JoiningDate.findOne({ user_id });

        if (existingJoiningDate) {
            await JoiningDate.updateOne(
                { user_id },
                { $set: { joining_date } }
            );
        } else {
            await JoiningDate.create(
                { user_id, joining_date }
            );
        }

        // Step 4: Parse and format start_time into local time
        const localTime = moment.utc(start_time).tz('Asia/Kolkata'); // Adjust to desired timezone
        const formattedTime = localTime.format('HH:mm:ss');
        console.log(formattedTime);

        if (!formattedTime) {
            return res.status(400).json({ message: 'Invalid start_time format. Expected ISO 8601 format.' });
        }

        // Step 5: Update or create UserTime (UserTime model)
        const existingUserTime = await UserTime.findOne({ user_id });

        if (existingUserTime) {
            await UserTime.updateOne(
                { user_id },
                { $set: { start_time: formattedTime } }
            );
        } else {
            await UserTime.create(
                { user_id, start_time: formattedTime }
            );
        }

        return res.status(200).json({ message: 'User details updated successfully' });
    } catch (error) {
        console.error('Error updating user role and location:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});



// Count the number of unverified users
router.get('/unverified_count', authenticateToken, async (req, res) => {
    try {
        const count = await User.countDocuments({ user_type: 'Unverified' });
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching unverified users count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Fetch unverified users along with their associated data
router.get('/users_unverified', authenticateToken, async (req, res) => {
    try {
        // Define aggregation pipeline
        const pipeline = [
            {
                $match: { user_type: 'Unverified' }  // Match users with 'Unverified' type
            },
            {
                $lookup: {
                    from: 'userdetails',                // Mongo collection name for UserDetails
                    localField: '_id',                  // The field in User collection to match
                    foreignField: 'user_id',            // The field in UserDetails collection to match
                    as: 'userDetails'                   // Alias for the populated field
                }
            },
            {
                $lookup: {
                    from: 'emergencycontacts',          // Mongo collection name for EmergencyContact
                    localField: '_id',                  // The field in User collection to match
                    foreignField: 'user_id',            // The field in EmergencyContact collection to match
                    as: 'emergencyContacts'             // Alias for the populated field
                }
            },
            {
                $lookup: {
                    from: 'educationinfos',             // Mongo collection name for EducationInfo
                    localField: '_id',                  // The field in User collection to match
                    foreignField: 'user_id',            // The field in EducationInfo collection to match
                    as: 'educationInfos'                // Alias for the populated field
                }
            },
            {
                $lookup: {
                    from: 'profileimages',              // Mongo collection name for ProfileImage
                    localField: '_id',                  // The field in User collection to match
                    foreignField: 'user_id',            // The field in ProfileImage collection to match
                    as: 'profileImage'                  // Alias for the populated field
                }
            },
            {
                $lookup: {
                    from: 'bankdetails',                // Mongo collection name for BankDetails
                    localField: '_id',                  // The field in User collection to match
                    foreignField: 'user_id',            // The field in BankDetails collection to match
                    as: 'bankDetails'                   // Alias for the populated field
                }
            },
            {
                $project: {                             // Optionally project the fields you want
                    password: 0                       // Exclude the password field from the result
                }
            }
        ];

        // Execute the aggregation pipeline
        const unverifiedUsers = await User.aggregate(pipeline);

        // Respond with the unverified users and their associated data
        res.status(200).json(unverifiedUsers);
    } catch (error) {
        console.error('Error fetching unverified users and their documents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// GET /roles - Fetch all roles
router.get('/allroles', authenticateToken, async (req, res) => {
    try {
        const roles = await Role.find({}, 'Role_id role_name'); 
        res.status(200).json({
            success: true,
            data: roles, 
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch roles',  
        });
    }
});




router.get('/users_verified', authenticateToken, async (req, res) => {
    try {
        // Aggregation pipeline
        const aggregationPipeline = [
            {
                // Stage 1: Filter users by user_type excluding 'Admin', 'Founder', 'SuperAdmin', 'Ex_employee', 'Unverified'
                $match: {
                    user_type: { $nin: ['Admin', 'Founder', 'SuperAdmin', 'Ex_employee', 'Unverified'] }
                }
            },
            {
                // Stage 2: Join related collections (populate)
                $lookup: {
                    from: 'profileimages', // Ensure the collection name is correct
                    localField: 'profileImage', // Field in User schema
                    foreignField: '_id', // Reference field in ProfileImage collection
                    as: 'profileImage' // Alias for the result
                }
            },
            {
                $lookup: {
                    from: 'joiningdates', // Ensure the collection name is correct
                    localField: 'joiningDates', // Field in User schema
                    foreignField: '_id', // Reference field in JoiningDate collection
                    as: 'joiningDates' // Alias for the result
                }
            },
            {
                // Stage 3: Sort users by first_name and last_name
                $sort: {
                    first_name: 1, // Ascending order for first_name
                    last_name: 1  // Ascending order for last_name
                }
            },
            {
                // Stage 4: Project the fields (optional, can filter out unnecessary fields)
                $project: {
                    first_name: 1,
                    last_name: 1,
                    user_type: 1,
                    profileImage: { $arrayElemAt: ['$profileImage', 0] }, // Extract single profile image
                    joiningDates: { $arrayElemAt: ['$joiningDates', 0] } // Extract single joining date
                }
            }
        ];

        // Execute the aggregation pipeline
        const verifiedUsers = await User.aggregate(aggregationPipeline);

        // Get the count of verified users excluding 'Ex_employee' and 'Unverified'
        const verifiedUsersCount = await User.countDocuments({
            user_type: { $nin: ['Ex_employee', 'Unverified'] }
        });

        // Respond with the filtered user data and count
        res.status(200).json({
            users: verifiedUsers,
            count: verifiedUsersCount
        });
    } catch (error) {
        console.error('Error fetching verified users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Employee Promotion API
router.post('/promotion-users', authenticateToken, async (req, res) => {
    const { user_id, user_type } = req.body;
    console.log(user_id, user_type);
    

    if (!user_id || !user_type) {
        return res.status(400).json({ message: 'user_id and user_type are required' });
    }

    if (user_type === 'SuperAdmin') {
        return res.status(400).json({ message: 'Cannot promote user to SuperAdmin role' });
    }

    try {
        // Step 1: Fetch the role from the Role collection
        const role = await Role.findOne({
            role_name: user_type,
        });

        if (!role || role.role_name === 'SuperAdmin') {
            return res.status(404).json({ message: 'Role not found or role is SuperAdmin' });
        }

        // Step 2: Update user details with the new role
        const updatedUser = await User.findOneAndUpdate(
            { _id: user_id }, // Find the user by user_id (Mongo _id)
            { $set: { user_type: role.role_name, Role_id: role._id } }, // Update user_type and Role_id
            { new: true } // Return the updated user document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User promoted successfully', data: updatedUser });
    } catch (error) {
        console.error('Error promoting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = router;
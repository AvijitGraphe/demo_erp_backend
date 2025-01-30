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

const moment = require('moment-timezone'); // Install moment.js if not already installed
const { authenticateToken } = require('../middleware/authMiddleware');

// Employee verification
router.post('/update-user-role-location', authenticateToken, async (req, res) => {
    const { user_id, user_type, joining_date, start_time, user_type_id } = req.body;
    if (!user_id || !user_type || !joining_date || !start_time) {
        return res.status(400).json({ message: 'Missing required fields: user_id, user_type, joining_date, start_time' });
    }

    if (user_type === 'SuperAdmin') {
        return res.status(400).json({ message: 'Cannot update user to SuperAdmin role' });
    }

    try {
        // Step 1: Fetch the role from the Role collection
        const role = await Role.findOne({
            _id: user_type_id,
            role_name: { $ne: 'SuperAdmin'}
        });

        if (!role) {
            return res.status(404).json({ message: 'Role not found or role is SuperAdmin' });
        }
        // Step 2: Update user details (User model)
        await User.updateOne(
            { _id: user_id },
            { $set: { Role_id: role._id, user_type: role.role_name } }
        );
        // Step 3: Update or create joining date (JoiningDate model)
        const existingJoiningDate = await JoiningDate.findOne({ user_id:user_id });

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
        const localTime = moment.utc(start_time).tz('Asia/Kolkata');
        const formattedTime = localTime.format('HH:mm:ss');


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
        const unverifiedUsers = await User.aggregate([
            { $match: { user_type: 'Unverified' } },
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
                    from: 'emergencycontacts',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'emergencyContacts'
                }
            },
            {
                $lookup: {
                    from: 'educationinfos',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'educationInfos'
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
                    from: 'bankdetails',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'bankDetails'
                }
            }
        ]);
        res.status(200).json(unverifiedUsers);
    } catch (error) {
        console.error('Error fetching unverified users and their documents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// GET /roles - Fetch all roles
router.get('/allroles', authenticateToken, async (req, res) => {
    try {
        const roles = await Role.aggregate([
            {
                $project: {
                    role_name: 1
                }
            }
        ]);
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



//get user users_verified
router.get('/users_verified', authenticateToken, async (req, res) => {
    try {
        const verifiedUsers = await User.aggregate([
            {
                $match: {
                    user_type: { $nin: ['Admin', 'Founder', 'SuperAdmin', 'Ex_employee', 'Unverified'] }
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
                    from: 'joiningdates',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'joiningDates'
                }
            },
            {
                $sort: {
                    first_name: 1,
                    last_name: 1
                }
            }
        ]);
        const verifiedUsersCount = await User.countDocuments({
            user_type: { $nin: ['Ex_employee', 'Unverified'] }
        });
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
    const { user_id, user_type, user_role_id } = req.body;
    
    if (!user_id || !user_type, !user_role_id) {
        return res.status(400).json({ message: 'user_id and user_type are required' });
    }
    if (user_type === 'SuperAdmin') {
        return res.status(400).json({ message: 'Cannot promote user to SuperAdmin role' });
    }
    try {
        // Step 1: Fetch the role from the Role collection
        const role = await Role.findOne({
            _id: user_role_id,
            role_name: { $ne: 'SuperAdmin' },
        });
        if (!role || role.role_name === 'SuperAdmin') {
            return res.status(404).json({ message: 'Role not found or role is SuperAdmin' });
        }
        // Step 2: Update user details with the new role
        let data = await User.updateOne(
            { _id: user_id },
            {
                $set: {
                    Role_id: role._id, 
                    user_type: role.role_name,
                },
            }
        );
        console.log("log thedat aok", data);
        
        res.status(200).json({ message: 'User promoted successfully' });
    } catch (error) {
        console.error('Error promoting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = router;
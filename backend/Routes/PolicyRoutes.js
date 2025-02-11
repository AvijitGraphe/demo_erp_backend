const express = require('express');
const router = express.Router();
const Policy = require('../Models/Policy'); 
const User = require('../Models/User');
const ProfileImage = require('../Models/ProfileImage');
const { authenticateToken } = require('../middleware/authMiddleware');

const mongoose = require("mongoose")

// POST /api/policies
router.post('/policies', authenticateToken, async (req, res) => {
    try {
        const { policy_name, policy_subject, policy_desc, created_by, policy_type } = req.body;
        // Validate input
        if (!Array.isArray(policy_type) || policy_type.length === 0) {
            return res.status(400).json({ error: 'policy_type must be a non-empty array' });
        }
        // Validate if the `created_by` user exists
        const creator = await User.findById(created_by);
        if (!creator) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Insert policies for each policy_type
        const policies = await Promise.all(
            policy_type.map(async (type) => {
                const policy = new Policy({
                    policy_name,
                    policy_type: type,
                    policy_subject,
                    policy_desc,
                    created_by,
                });
                await policy.save(); 
            })
        );
        res.status(201).json({
            message: 'Policies created successfully',
        });
    } catch (error) {
        console.error('Error creating policies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// PUT /api/policies/:id
router.put('/policies/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { policy_name, policy_type, policy_subject, policy_desc, updated_by } = req.body;

        // Find the policy by ID
        const policy = await Policy.findById(id);

        if (!policy) {
            return res.status(404).json({ error: 'Policy not found' });
        }

        // Validate if the `updated_by` user exists
        const updator = await User.findById(updated_by);

        
        if (!updator) {
            return res.status(404).json({ error: 'Updator not found' });
        }
        // Update the policy fields
        policy.policy_name = policy_name;
        policy.policy_type = policy_type;
        policy.policy_subject = policy_subject;
        policy.policy_desc = policy_desc;
        policy.updated_by = updated_by;
        // Save the updated policy
        await policy.save();
        res.status(200).json({
            message: 'Policy updated successfully',
        });
    } catch (error) {
        console.error('Error updating policy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get all dist policies
router.get('/alldistpolicies',authenticateToken, async (req, res) => {
    try {
        const { policy_type } = req.query;
        // Aggregation pipeline to fetch policies with associated User and ProfileImage
        const policies = await Policy.aggregate([
            {
                $match: {
                    policy_type: policy_type, // Match policies based on the policy_type query parameter
                },
            },
            {
                $lookup: {
                    from: 'users', // Look up the 'users' collection (the user who created the policy)
                    localField: 'created_by',
                    foreignField: '_id',
                    as: 'creator', // Alias for the creator
                },
            },
            {
                $unwind: { path: '$creator', preserveNullAndEmptyArrays: true }, // Unwind to get single user details
            },
            {
                $lookup: {
                    from: 'profileimages', // Look up the 'profileimages' collection (creator's profile image)
                    localField: 'creator.profileImage',
                    foreignField: '_id',
                    as: 'creator.profileImage', // Nested profile image details
                },
            },
            {
                $lookup: {
                    from: 'users', // Look up the 'users' collection (the user who updated the policy)
                    localField: 'updated_by',
                    foreignField: '_id',
                    as: 'updater', // Alias for the updater
                },
            },
            {
                $unwind: { path: '$updater', preserveNullAndEmptyArrays: true }, // Unwind to get single user details
            },
            {
                $lookup: {
                    from: 'profileimages', // Look up the 'profileimages' collection (updater's profile image)
                    localField: 'updater.profileImage',
                    foreignField: '_id',
                    as: 'updater.profileImage', // Nested profile image details
                },
            },
            {
                $project: { // Select specific fields to return in the result
                    _id: 1, 
                    policy_id: '$_id',
                    policy_name: 1,
                    policy_subject: 1,
                    policy_desc: 1,
                    policy_type: 1,
                    created_by: 1,
                    updated_by: 1,
                    'creator.first_name': 1,
                    'creator.last_name': 1,
                    'creator.email': 1,
                    'creator.profileImage.image_url': 1,
                    'updater.first_name': 1,
                    'updater.last_name': 1,
                    'updater.email': 1,
                    'updater.profileImage.image_url': 1,
                },
            },
        ]);

        // Send empty array if no policies are found
        if (policies.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(policies);
    } catch (error) {
        console.error('Error fetching policies:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});


// GET /api/policies
router.get('/allpolicies', authenticateToken, async (req, res) => {
    try {
        // Aggregation pipeline to fetch policies with associated User and ProfileImage
        const policies = await Policy.aggregate([
            {
                $lookup: {
                    from: 'users', 
                    localField: 'created_by', 
                    foreignField: '_id', 
                    as: 'creator', // Alias for the creator
                },
            },
            {
                $unwind: { path: '$creator', preserveNullAndEmptyArrays: true }, // Unwind to get single user details
            },
            {
                $lookup: {
                    from: 'profileimages', // Look up the 'profileimages' collection (creator's profile image)
                    localField: 'creator.profileImage',
                    foreignField: '_id',
                    as: 'creator.profileImage', // Nested profile image details
                },
            },
            {
                $lookup: {
                    from: 'users', // Look up the 'users' collection (the user who updated the policy)
                    localField: 'updated_by',
                    foreignField: '_id',
                    as: 'updater', // Alias for the updater
                },
            },
            {
                $unwind: { path: '$updater', preserveNullAndEmptyArrays: true }, // Unwind to get single user details
            },
            {
                $lookup: {
                    from: 'profileimages', // Look up the 'profileimages' collection (updater's profile image)
                    localField: 'updater.profileImage',
                    foreignField: '_id',
                    as: 'updater.profileImage', // Nested profile image details
                },
            },
            {
                $project: { 
                    policy_id:'$_id',
                    policy_name: 1,
                    policy_subject: 1,
                    policy_desc: 1,
                    policy_type: 1,
                    created_by: 1,
                    updated_by: 1,
                    'creator.first_name': 1,
                    'creator.last_name': 1,
                    'creator.email': 1,
                    'creator.profileImage.image_url': 1,
                    'updater.first_name': 1,
                    'updater.last_name': 1,
                    'updater.email': 1,
                    'updater.profileImage.image_url': 1,
                },
            },
        ]);
        if (policies.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(policies);
    } catch (error) {
        console.error('Error fetching policies:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
});


router.delete('/policiesdelete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const policy = await Policy.findById(id);
        if (!policy) {
            return res.status(404).json({
                success: false,
                message: 'Policy not found.',
            });
        }
        // Use deleteOne instead of remove
        await Policy.deleteOne({ _id: id });
        return res.status(200).json({
            success: true,
            message: 'Policy successfully deleted.',
        });
    } catch (error) {
        console.error('Error deleting policy:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting the policy.',
            error: error.message,
        });
    }
});




module.exports = router;
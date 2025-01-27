const express = require('express');
const Resignation = require('../Models/Resignation'); 
const User = require('../Models/User'); 
const ProfileImage = require('../Models/ProfileImage'); 
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const  mongoose = require('mongoose');



/**
 * Add or Edit Resignation
 */
router.post('/add-resignation', async (req, res) => {
    const { user_id, resignation_reason, notice_period_served, resignation_id } = req.body;
    const resignation_date = new Date().toISOString().split('T')[0]; 
    try {
        if (resignation_id) {
            // Edit the existing resignation if resignation_id is provided
            const existingResignation = await Resignation.findOne({
                _id: resignation_id,
                status: 'Pending',
            });

            if (!existingResignation) {
                return res.status(404).json({ message: 'No pending resignation found with the provided ID.' });
            }

            // Update the existing resignation record
            existingResignation.resignation_reason = resignation_reason;
            existingResignation.resignation_date = resignation_date;
            existingResignation.notice_period_served = notice_period_served;
            await existingResignation.save();

            return res.status(200).json({
                message: 'Resignation updated successfully.',
            });
        } else {
            // Add a new resignation record if no resignation_id is provided
            const newResignation = new Resignation({
                user_id,
                resignation_date,
                resignation_reason,
                notice_period_served,
                status: 'Pending',
            });
            await newResignation.save();
            return res.status(201).json({
                message: 'Resignation added successfully.',
            });
        }
    } catch (error) {
        console.error('Error adding/editing resignation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



/**
 * Delete Resignation
 */
router.delete('/delete-resignation/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Find the resignation by ID
        const resignation = await Resignation.findById(id);
        // Check if resignation exists
        if (!resignation) {
            return res.status(404).json({ error: 'Resignation not found.' });
        }
        // Log the resignation status for debugging
        console.log(`Resignation Status: ${resignation.status}`);
        // Ensure only resignations with status 'Pending' can be deleted
        if (resignation.status !== 'Pending') {
            return res.status(400).json({ error: `Only resignations with status "Pending" can be deleted. Current status: "${resignation.status}".` });
        }
        // Delete the resignation
        await resignation.deleteOne();
        return res.status(200).json({ message: 'Resignation deleted successfully.' });
    } catch (error) {
        console.error('Error deleting resignation:', error);
        // Return specific error message for debugging, but avoid sending it to the client in production.
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
});





/**
 * Update Resignation Status
 */
router.put('/update-resignation-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status, last_working_day, notice_duration } = req.body;
    try {
        // Find the resignation by ID
        const resignation = await Resignation.findById(id);
        if (!resignation) {
            return res.status(404).json({ error: 'Resignation not found.' });
        }
        // Update the status field (mandatory)
        resignation.status = status;

        // Update optional fields if provided
        if (last_working_day) {
            resignation.last_working_day = last_working_day;
        }

        if (notice_duration) {
            resignation.notice_duration = notice_duration;

            // Calculate and update the estimated last working day if notice_duration is provided
            resignation.estimated_last_working_day = new Date(
                new Date().setDate(new Date().getDate() + parseInt(notice_duration))
            );
        }

        // Save the updated resignation
        await resignation.save();

        return res.status(200).json({
            message: 'Resignation status updated successfully.',
        });
    } catch (error) {
        console.error('Error updating resignation status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





/**
 * Fetch all resignations
 */
router.get('/fetch-all-resignations', async (req, res) => {
    try {
        const resignations = await Resignation.aggregate([
            {
                $lookup: {
                    from: 'users', // 'users' is the collection name for User
                    localField: 'user_id', // Field in Resignation referencing the User
                    foreignField: '_id', // Field in User model
                    as: 'user', // Name of the field to store populated result
                },
            },
            {
                $unwind: '$user', // Flatten the array returned by $lookup
            },
            {
                $lookup: {
                    from: 'profileimages', // 'profileimages' is the collection name for ProfileImage
                    localField: 'user.profileImage', // Field in User model that references ProfileImage
                    foreignField: '_id', // Field in ProfileImage model
                    as: 'user.profileImage',
                },
            },
            {
                $unwind: { path: '$user.profileImage', preserveNullAndEmptyArrays: true },
            },
            {
                $sort: { createdAt: 1 },
            },
        ]);

        return res.status(200).json(resignations);
    } catch (error) {
        console.error('Error fetching resignations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



/**
 * Fetch resignations by user_id
 */
router.get('/fetch-resignations-by-user/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;
    try {
        // Fetch all resignations for the user from MongoDB
        const userResignations = await Resignation.find({ user_id })
            .populate({
                path: 'user', // Populate the user details from the User model
                select: 'first_name last_name email',
                populate: {
                    path: 'profileImage', // Populate the profileImage
                    select: 'image_url', // Only select the image_url from the ProfileImage model
                },
            })
            .sort([
                ['status', 'asc'], // Sort by status (ensure 'Pending', 'Approved', 'Rejected' priority)
                ['createdAt', 'asc'], // Sort by creation date
            ]);

        // Check if any resignation has status 'Accepted'
        const hasAcceptedResignation = userResignations.some(
            (resignation) => resignation.status === 'Accepted'
        );

        return res.status(200).json({
            can_add: !hasAcceptedResignation, // true if no 'Accepted' status, false otherwise
            resignations: userResignations,
        });
    } catch (error) {
        console.error('Error fetching user resignations:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



/**
 * Fetch resignation details by id
 */
router.get('/fetch-specific-resignation/:id', async (req, res) => {
    const { id: resignation_id } = req.params;

    try {
        // Use aggregation to fetch resignation with related data
        const resignation = await Resignation.aggregate([
            // Match the specific resignation by ID
            { $match: { _id: new mongoose.Types.ObjectId(resignation_id) } },
            
            // Lookup the related user data
            {
                $lookup: {
                    from: 'users', // Name of the User collection
                    localField: 'user_id', // Field in Resignation model that references User
                    foreignField: '_id', // Field in User model that this references
                    as: 'user', // The resulting field will be named 'user'
                },
            },
            { $unwind: '$user' }, // Unwind the array to flatten the result
            
            // Lookup the profile image data
            {
                $lookup: {
                    from: 'profileimages', // Name of the ProfileImage collection
                    localField: 'user.profileImage', // Field in User model referencing ProfileImage
                    foreignField: '_id', // Field in ProfileImage model
                    as: 'user.profileImage', // Result will be in 'user.profileImage'
                },
            },
            { $unwind: { path: '$user.profileImage', preserveNullAndEmptyArrays: true } }, // Optional profile image
            
            // Lookup the joining date data
            {
                $lookup: {
                    from: 'joiningdates', // Name of the JoiningDate collection
                    localField: 'user.joiningDates', // Field in User model referencing JoiningDate
                    foreignField: '_id', // Field in JoiningDate model
                    as: 'user.joiningDates', // The result will be in 'user.joiningDates'
                },
            },

            // Optionally unwind joiningDates if needed
            { $unwind: { path: '$user.joiningDates', preserveNullAndEmptyArrays: true } },

            // Project the necessary fields (filter out unwanted fields if needed)
            {
                $project: {
                    'user.first_name': 1,
                    'user.last_name': 1,
                    'user.email': 1,
                    'user.user_type': 1,
                    'user.profileImage.image_url': 1,
                    'user.joiningDates.joining_date': 1,
                    resignation_reason: 1,
                    resignation_date: 1,
                    notice_period_served: 1,
                    status: 1,
                    last_working_day: 1,
                    notice_duration: 1,
                    estimated_last_working_day: 1,
                },
            },
        ]);

        if (resignation.length === 0) {
            return res.status(404).json({ error: 'No resignation found for the specified ID.' });
        }

        return res.status(200).json(resignation[0]); // Since it’s an array, we return the first result
    } catch (error) {
        console.error('Error fetching resignation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
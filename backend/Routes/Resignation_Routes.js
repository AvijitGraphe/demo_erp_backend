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
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'user.profileImage',
                    foreignField: '_id',
                    as: 'user.profileImage',
                },
            },
            {
                $unwind: { path: '$user.profileImage', preserveNullAndEmptyArrays: true },
            },
            {
                $sort: { createdAt: 1 },
            },
            {
                $addFields: {
                    resignation_id: '$_id', 
                },
            },
            {
                $project: {
                    _id: 0,
                },
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
        const userResignations = await Resignation.aggregate([
            {
                $match: { user_id: new mongoose.Types.ObjectId(user_id) },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        { $project: { first_name: 1, last_name: 1, email: 1 } },
                        {
                            $lookup: {
                                from: 'profileimages',
                                localField: '_id',
                                foreignField: 'user_id',
                                as: 'profileImage',
                                pipeline: [{ $project: { image_url: 1 } }],
                            },
                        },
                        { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
                    ],
                },
            },
            {
                $unwind: '$user',
            },
            {
                $addFields: {
                    status_priority: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$status', 'Pending'] }, then: 1 },
                                { case: { $eq: ['$status', 'Approved'] }, then: 2 },
                                { case: { $eq: ['$status', 'Rejected'] }, then: 3 },
                            ],
                            default: 4,
                        },
                    },
                },
            },
            {
                $sort: {
                    status_priority: 1,
                    createdAt: 1,
                },
            },
            {
                $project: { status_priority: 0 }, // Remove the temporary field after sorting
            },
        ]);

        const hasAcceptedResignation = userResignations.some(
            (resignation) => resignation.status === 'Accepted'
        );

        return res.status(200).json({
            can_add: !hasAcceptedResignation,
            resignations: userResignations,
        });
    } catch (error) {
        console.error('Error fetching user resignations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





/**
 * Fetch resignation details by id
 */
router.get('/fetch-specific-resignation/:id', async (req, res) => {
    const { id: resignation_id } = req.params;
    try {
        const resignation = await Resignation.aggregate([
            { 
                $match: { 
                    _id: new mongoose.Types.ObjectId(resignation_id) 
                }
            },
            {
                $lookup: {
                    from: 'users', 
                    localField: 'user_id', 
                    foreignField: '_id', 
                    as: 'user'
                }
            },
            { 
                $unwind: '$user' 
            },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'user.profileImage', 
                    foreignField: '_id', 
                    as: 'user.profileImage'
                }
            },
            { 
                $unwind: { path: '$user.profileImage', preserveNullAndEmptyArrays: true } 
            },
            {
                $lookup: {
                    from: 'joiningdates', 
                    localField: 'user._id', // Match the user's _id to user_id in the joiningdates collection
                    foreignField: 'user_id', 
                    as: 'user.joiningDates'
                }
            },
            // No need to $unwind the joiningDate if it’s not an array, we can skip it
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
                    estimated_last_working_day: 1
                }
            }
        ]);

        if (resignation.length === 0) {
            return res.status(404).json({ error: 'No resignation found for the specified ID.' });
        }
        return res.status(200).json(resignation[0]);
    } catch (error) {
        console.error('Error fetching resignation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





module.exports = router;
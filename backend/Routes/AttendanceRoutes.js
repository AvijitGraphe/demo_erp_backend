const express = require('express');
const User = require('../Models/User');
const Attendance = require('../Models/Attendance');
const LeaveRequest = require('../Models/LeaveRequest');
const ProfileImage = require('../Models/ProfileImage');
const UserDetails = require('../Models/UserDetails');
const { authenticateToken } = require('../middleware/authMiddleware');
require('dotenv').config();
const router = express.Router();
const moment = require('moment');

const mongoose = require('mongoose');

//Add attendance API--------------------------//
router.post('/add-checkin', authenticateToken, async (req, res) => {
    const { user_id, date, start_time } = req.body;
    console.log(user_id, date, start_time);
    try {
        const existingCheckIn = await Attendance.findOne({ user_id, date });
        if (existingCheckIn) {
            return res.status(400).json({ message: 'Check-in already exists for this date.' });
        }
        const attendance = new Attendance({
            user_id,
            date,
            start_time,
            checkin_status: true
        });
        await attendance.save();
        res.status(201).json({ message: 'Check-in added successfully', attendance });
    } catch (error) {
        console.error('Error adding check-in:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});



// Update checkout API
router.put('/update-checkout/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;
    const { date, end_time } = req.body;
    try {
        const attendance = await Attendance.findOne({ user_id, date });
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found for the specified user and date.' });
        }
        if (!attendance.start_time) {
            return res.status(400).json({ message: 'Start time is missing for this attendance record.' });
        }
        const startTime = moment(attendance.start_time, 'HH:mm');
        const endTime = moment(end_time, 'HH:mm');
        const duration = moment.duration(endTime.diff(startTime));
        const hours = duration.asHours();

        if (hours <= 0) {
            return res.status(400).json({ message: 'End time must be later than start time.' });
        }
        const total_time = `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
        let Attendance_status = 'Absent';
        if (hours > 5) {
            Attendance_status = 'Full-Day';
        } else if (hours > 3 && hours <= 5) {
            Attendance_status = 'Half-Day';
        }
        attendance.end_time = end_time;
        attendance.total_time = total_time;
        attendance.checkin_status = false;
        attendance.attendance_status = Attendance_status;
        await attendance.save(); 
        res.status(200).json({
            message: 'Checkout updated successfully.'
        });
    } catch (error) {
        console.error('Error updating checkout:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});



// Fetch attendance API
router.get('/fetch-attendance', authenticateToken, async (req, res) => {
    const { user_id } = req.query;
    try {
        const currentDate = moment().format('YYYY-MM-DD');
        const attendance = await Attendance.findOne({
            user_id, 
            date: currentDate
        }).select('checkin_status');
        if (!attendance) {
            return res.status(200).json({ checkin_status: false });
        }
        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Attendance summary monthly API--------------------------//
router.get('/fetch-monthly-attendance', authenticateToken, async (req, res) => {
    const { user_id } = req.query;
    try {
        const startOfMonth = moment().startOf('month').toDate(); 
        const endOfMonth = moment().endOf('month').toDate(); 

        // Fetch attendance records for the current month
        const attendanceRecords = await Attendance.find({
            user_id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // Calculate statistics
        let totalPresent = 0;
        let halfDays = 0;
        let fullDays = 0;
        const daysInMonth = moment().daysInMonth();
        const attendedDates = new Set();

        attendanceRecords.forEach(record => {
            attendedDates.add(record.date.toISOString().split('T')[0]); // Convert date to 'YYYY-MM-DD' format
            if (record.Attendance_status === 'Full-Day') {
                totalPresent++;
                fullDays++;
            } else if (record.Attendance_status === 'Half-Day') {
                totalPresent++;
                halfDays++;
            }
        });

        const totalAbsent = daysInMonth - attendedDates.size;
        const remainingDays = daysInMonth - moment().date();

        // Response
        res.status(200).json({
            totalPresent,
            totalAbsent,
            halfDays,
            fullDays,
            remainingDays
        });
    } catch (error) {
        console.error('Error fetching monthly attendance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




router.get('/fetch-dashboard-attendance-summary', authenticateToken, async (req, res) => {
    try {
        const currentDate = moment().format('YYYY-MM-DD'); // Current date in YYYY-MM-DD format
        // Aggregation pipeline for fetching user data and attendance summary
        const pipeline = [
            {
                $match: {
                    user_type: { $nin: ['Founder', 'Admin', 'SuperAdmin', 'Ex_employee', 'Unverified'] },
                    Is_active: true,
                }
            },
            {
                $lookup: {
                    from: 'attendances',
                    localField: 'user_id',
                    foreignField: 'user_id',
                    as: 'attendance'
                }
            },
            {
                $lookup: {
                    from: 'leaverequests',
                    localField: 'user_id',
                    foreignField: 'user_id',
                    as: 'leaveRequests'
                }
            },
            {
                $project: {
                    user_id: 1,
                    first_name: 1,
                    last_name: 1,
                    email: 1,
                    user_type: 1,
                    profileImage: { $arrayElemAt: ['$profileImage.image_url', 0] },
                    userDetails: { $arrayElemAt: ['$userDetails.phone', 0] },
                    attendance: {
                        $filter: {
                            input: '$attendance',
                            as: 'attendance',
                            cond: { $eq: ['$$attendance.date', currentDate] }
                        }
                    },
                    leaveRequests: {
                        $filter: {
                            input: '$leaveRequests',
                            as: 'leaveRequest',
                            cond: { $regexMatch: { input: '$$leaveRequest.dates', regex: currentDate } }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    presentCount: {
                        $sum: {
                            $cond: [
                                { $gt: [{ $size: '$attendance' }, 0] }, 1, 0
                            ]
                        }
                    },
                    notCheckedInCount: {
                        $sum: {
                            $cond: [
                                { $eq: [{ $size: '$attendance' }, 0] }, 1, 0
                            ]
                        }
                    },
                    leaveCount: {
                        $sum: {
                            $cond: [
                                { $gt: [{ $size: '$leaveRequests' }, 0] }, 1, 0
                            ]
                        }
                    },
                    notCheckedInUsers: {
                        $push: {
                            $cond: [
                                { $eq: [{ $size: '$attendance' }, 0] },
                                {
                                    user_id: '$user_id',
                                    first_name: '$first_name',
                                    last_name: '$last_name',
                                    email: '$email',
                                    profileImage: '$profileImage',
                                    userDetails: '$userDetails'
                                },
                                null
                            ]
                        }
                    },
                    leaveUsers: {
                        $push: {
                            $cond: [
                                { $gt: [{ $size: '$leaveRequests' }, 0] },
                                {
                                    user_id: '$user_id',
                                    first_name: '$first_name',
                                    last_name: '$last_name',
                                    email: '$email',
                                    profileImage: '$profileImage',
                                    userDetails: '$userDetails',
                                    leaveReason: { $arrayElemAt: ['$leaveRequests.reason', 0] },
                                    leaveTotalDays: { $arrayElemAt: ['$leaveRequests.Total_days', 0] }
                                },
                                null
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    totalUsers: 1,
                    presentCount: 1,
                    notCheckedInCount: 1,
                    leaveCount: 1,
                    notCheckedInUsers: { $filter: { input: '$notCheckedInUsers', as: 'user', cond: { $ne: ['$$user', null] } } },
                    leaveUsers: { $filter: { input: '$leaveUsers', as: 'user', cond: { $ne: ['$$user', null] } } }
                }
            }
        ];

        const result = await User.aggregate(pipeline);

        if (result.length === 0) {
            return res.json({
                totalUsers: 0,
                presentCount: 0,
                notCheckedInCount: 0,
                leaveCount: 0,
                notCheckedInUsers: [],
                leaveUsers: [],
            });
        }

        const summary = result[0];
        res.json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching attendance data' });
    }
});



// Add attendance API
router.post('/add-attendance', authenticateToken, async (req, res) => {
    const { user_id, date, start_time, end_time } = req.body;

    try {
        // Validate input
        if (!user_id || !date || !start_time) {
            return res.status(400).json({ message: 'user_id, date, and start_time are required.' });
        }

        // Check if attendance record already exists for the user and date
        const existingAttendance = await Attendance.findOne({
            user_id,
            date,
        });

        if (existingAttendance) {
            return res.status(409).json({ message: 'Attendance record for this date already exists.' });
        }

        let total_time = null;
        let Attendance_status = 'Started';

        if (end_time) {
            // Calculate total time
            const startTime = moment(start_time, 'HH:mm');
            const endTime = moment(end_time, 'HH:mm');
            const duration = moment.duration(endTime.diff(startTime));
            const hours = duration.asHours();

            if (hours <= 0) {
                return res.status(400).json({ message: 'End time must be later than start time.' });
            }

            total_time = `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;

            // Determine attendance status based on hours worked
            if (hours > 5) {
                Attendance_status = 'Full-Day';
            } else if (hours > 3 && hours <= 5) {
                Attendance_status = 'Half-Day';
            } else {
                Attendance_status = 'Absent';
            }
        }

        // Create the attendance record in MongoDB
        const newAttendance = new Attendance({
            user_id,
            date,
            start_time,
            end_time: end_time || null,
            total_time,
            checkin_status: true, // Assuming user is checked in when adding a record
            Attendance_status,
        });

        await newAttendance.save();

        res.status(201).json({
            message: 'Attendance record created successfully.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
  


// Edit attendance API
router.put('/edit-attendance/:attendance_id', authenticateToken, async (req, res) => {
    const { attendance_id } = req.params;
    const { start_time, end_time } = req.body; // Include both `start_time` and `end_time`

    try {
        // Find the attendance record by ID
        const attendance = await Attendance.findById(attendance_id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found.' });
        }

        // Validate inputs
        if (!start_time && !end_time) {
            return res.status(400).json({ message: 'At least one of start_time or end_time is required.' });
        }

        // Update start_time if provided
        if (start_time) {
            attendance.start_time = start_time;
        }

        // Update end_time if provided and calculate total_time
        if (end_time) {
            // Ensure `start_time` is available for calculations
            const startTimeToUse = start_time || attendance.start_time;
            const startTime = moment(startTimeToUse, 'HH:mm');
            const endTime = moment(end_time, 'HH:mm');
            const duration = moment.duration(endTime.diff(startTime));
            const hours = duration.asHours();

            if (hours <= 0) {
                return res.status(400).json({ message: 'End time must be later than start time.' });
            }

            const total_time = `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;

            // Determine attendance status
            let Attendance_status = 'Absent';
            if (hours > 5) {
                Attendance_status = 'Full-Day';
            } else if (hours > 3 && hours <= 5) {
                Attendance_status = 'Half-Day';
            }

            attendance.end_time = end_time;
            attendance.total_time = total_time;
            attendance.Attendance_status = Attendance_status;
        }

        // Save the updated attendance record
        await attendance.save();
        res.status(200).json({
            message: 'Attendance updated successfully.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


module.exports = router;
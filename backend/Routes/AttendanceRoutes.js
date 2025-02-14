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



/** */
router.get('/fetch-dashboard-attendance-summary', authenticateToken, async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const users = await User.aggregate([
            {
                $match: {
                    user_type: { $nin: ['Founder', 'Admin', 'SuperAdmin', 'Ex_employee', 'Unverified'] },
                    Is_active: true,
                },
            },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'profileImage',
                    foreignField: '_id',
                    as: 'profileImage',
                },
            },
            { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'userdetails',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'userDetails',
                },
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    user_id: '$_id',
                    first_name: 1,
                    last_name: 1,
                    email: 1,
                    user_type: 1,
                    'profileImage.image_url': 1,
                    'userDetails.phone': 1,
                },
            },
        ]);
        const totalUsers = users.length;
        if (totalUsers === 0) {
            return res.json({
                totalUsers: 0,
                presentCount: 0,
                notCheckedInCount: 0,
                leaveCount: 0,
                notCheckedInUsers: [],
                leaveUsers: [],
            });
        }
        const userIds = users.map(user => user.user_id);
        const attendanceRecords = await Attendance.aggregate([
            {
                $match: {
                    user_id: { $in: userIds },
                    date:new Date(currentDate),
                },
            },
            {
                $project: {
                    user_id: 1,
                },
            },
        ]);
        const presentUserIds = attendanceRecords.map(record => record.user_id);
        const notCheckedInUsers  = users.filter(user => !presentUserIds.some(presentUserId => presentUserId.equals(user.user_id)));
        const leaveRequests = await LeaveRequest.aggregate([
            {
                $match: {
                    user_id: { $in: notCheckedInUsers.map(user => user.user_id) },
                    dates: { $regex: currentDate, $options: 'i' },
                    Status: 'Approved',
                },
            },
            {
                $project: {
                    user_id: 1,
                    reason: 1,
                    Total_days: 1,
                },
            },
        ]);        
        const leaveUserIds = leaveRequests.map(leave => leave.user_id);
        const leaveUsers = users.filter(user => leaveUserIds.some(leaveUserId => leaveUserId.equals(user.user_id)));
        const finalNotCheckedInUsers = notCheckedInUsers.filter(
            user => !leaveUserIds.includes(user.user_id)
        );
        res.json({
            totalUsers,
            presentCount: presentUserIds.length,
            notCheckedInCount: finalNotCheckedInUsers.length,
            leaveCount: leaveUsers.length,
            notCheckedInUsers: finalNotCheckedInUsers,
            leaveUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching attendance data' });
    }
});

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
            checkin_status: true, 
            attendance_status : Attendance_status,
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
    const { start_time, end_time } = req.body;
    try {
      const attendance = await Attendance.findById(attendance_id);
      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found.' });
      }
      if (!start_time && !end_time) {
        return res.status(400).json({ message: 'At least one of start_time or end_time is required.' });
      }
      if (start_time) {
        attendance.start_time = start_time;
      }
      if (end_time) {
        const startTimeToUse = start_time || attendance.start_time;
        const startTime = moment(startTimeToUse, 'HH:mm');
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
        attendance.attendance_status = Attendance_status;
      }
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
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Meeting = require('../Models/Meetings'); 
const User = require('../Models/User'); 
const ProfileImage = require('../Models/ProfileImage');
const { authenticateToken } = require('../middleware/authMiddleware');




//fetch all users --------------------------/
// Fetch all users
// router.get('/fetch-all-users', authenticateToken, async (req, res) => {
//   try {
//       const users = await User.find({
//           user_type: {
//               $in: ['Founder', 'Admin', 'SuperAdmin', 'HumanResource', 'Accounts', 'Department_Head', 'Employee', 'Social_Media_Manager', 'Task_manager']
//           }
//       }).select('user_id first_name last_name email user_type'); 
//       res.status(200).json(users);
//   } catch (error) {
//       console.error('Error fetching all users:', error);
//       res.status(500).json({ message: 'Internal server error' });
//   }
// });
router.get('/fetch-all-users', authenticateToken, async (req, res) => {
    try {
      const users = await User.find({
        user_type: {
          $in: [
            'Founder', 'Admin', 'SuperAdmin', 'HumanResource', 
            'Accounts', 'Department_Head', 'Employee', 'Social_Media_Manager', 'Task_manager'
          ],
        },
      }).select('user_id first_name last_name email user_type');
  
      // Map the users and rename _id to user_id
      const modifiedUsers = users.map(user => ({
        user_id: user._id,  // Rename _id to user_id
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_type: user.user_type,
      }));
  
      res.status(200).json(modifiedUsers);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  



// Add or Edit a meeting
router.post('/add-or-edit-meeting', async (req, res) => {
    const { meeting_id, date, start_time, end_time, purpose, meeting_member_id } = req.body;

 // Validate required fields
    if (!date || !start_time || !end_time || !purpose) {
        return res.status(400).json({
            success: false,
            message: 'Please provide date, start_time, end_time, and purpose.',
        });
    }
    try {
        let meeting;
        if (meeting_id) {
            meeting = await Meeting.findById(meeting_id);
            if (!meeting) {
                return res.status(404).json({
                    success: false,
                    message: 'Meeting not found.',
                });
            }
            // Update the meeting
            meeting.date = date;
            meeting.start_time = start_time;
            meeting.end_time = end_time;
            meeting.purpose = purpose;
            meeting.meeting_member_id = meeting_member_id;

            await meeting.save();

            res.status(200).json({
                success: true,
                message: 'Meeting updated successfully.',
                data: meeting,
            });
        } else {
            meeting = new Meeting({
                date,
                start_time,
                end_time,
                purpose,
                meeting_member_id, 
            });
            await meeting.save(); 
            res.status(201).json({
                success: true,
                message: 'Meeting created successfully.',
                data: meeting,
            });
        }
    } catch (error) {
        console.error('Error creating/updating meeting:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error creating/updating meeting.',
            error: error.message,
        });
    }
});
  


// Fetch meetings within a given date range
router.get('/meetings', async (req, res) => {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
        return res.status(400).json({
            success: false,
            message: 'Please provide both start_date and end_date query parameters.',
        });
    }
    try {
        const start = new Date(start_date);
        const end = new Date(end_date);
        const meetingsQuery = {
            date: {
                $gte: start,
                $lte: end,  
            },
        };

        const meetings = await Meeting.find(meetingsQuery)
            .populate('meeting_member_id', 'first_name last_name email profileImage');
        if (!meetings.length) {
            return res.status(200).json({
                success: true,
                message: 'No meetings found within the given date range.',
                data: [],
            });
        }

        const memberIds = [
            ...new Set(
                meetings
                    .flatMap(meeting => meeting.meeting_member_id || [])
                    .map(user => user._id.toString())  
            ),
        ];
        const users = await User.find({
            _id: { $in: memberIds },
        }).populate('profileImage', 'image_url', null, { strictPopulate: false });

        const userMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                profile_image: user.profileImage?.image_url || null,
            };
            return acc;
        }, {});

        const enrichedMeetings = meetings.map(meeting => ({
            ...meeting.toObject(),
            meeting_id: meeting._id.toString(),
            date: meeting.date.toISOString().slice(0, 10), 
            members: (meeting.meeting_member_id || []).map(member => userMap[member._id.toString()] || null),
        }));
        // console.log("log enrichedMeetings", enrichedMeetings)
        res.status(200).json({
            success: true,
            message: 'Meetings fetched successfully.',
            data: enrichedMeetings,
        });
    } catch (error) {
        console.error('Error fetching meetings:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching meetings.',
            error: error.message,
        });
    }
});




module.exports = router;

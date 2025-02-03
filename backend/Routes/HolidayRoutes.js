const express = require('express');
const router = express.Router();
const multer = require('multer');
const Holiday = require('../Models/Holiday');
const User = require('../Models/User');
const UserDetails = require('../Models/UserDetails');
const ProfileImage = require('../Models/ProfileImage');
const LeaveRequest = require('../Models/LeaveRequest');
const JoiningDate = require('../Models/JoiningDate');
const { authenticateToken } = require('../middleware/authMiddleware');
const moment = require('moment'); // You'll need this package for date handling

const ImageKit = require('imagekit');
const mongoose = require('mongoose');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: "public_UCxvoHx58ajkX85Q6oBFCP7pSuI=",
  privateKey: "private_ATOOFtW1RZ2IoJWSF41Jbu46lDM=",
  urlEndpoint: "https://ik.imagekit.io/blackboxv2",
});

const upload = multer({ storage: multer.memoryStorage() });

router.post('/addholiday', authenticateToken, upload.single('image'), async (req, res) => {
  const { holiday_name, holiday_date, status } = req.body;
  let imageUrl = null;
  let imagekitFileId = null;

  try {
    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `holiday_${Date.now()}`,
        folder: '/Holiday-images',
      });
      imageUrl = uploadResponse.url;
      imagekitFileId = uploadResponse.fileId;
    }

    const newHoliday = new Holiday({
      holiday_name,
      holiday_date,
      image_url: imageUrl,
      imagekit_file_id: imagekitFileId,
      status,
    });

    await newHoliday.save();
    res.status(201).json({ message: 'Holiday created successfully' });

  } catch (error) {
    console.error('Error creating holiday:', error);
    res.status(500).json({
      message: 'Internal server error',
      details: error.message,
    });
  }
});




// Update holiday
router.put("/holiday/:id", authenticateToken, upload.single("image"), async (req, res) => {
  const {id} = req.params;
  const {holiday_name, holiday_date, status} = req.body;
  try {
    const holiday = await Holiday.findById(id);
    if(!holiday){
      return res.status(404).json({error: "Holiday not found"});
    }
    let newImageUrl = holiday.image_url;
    let newImagekitFileId = holiday.imagekit_file_id;

    if(req.file){
      if(holiday.imagekit_file_id){
        await imagekit.deleteFile(holiday.imagekit_file_id);
      }
      //upload the image kit
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `holiday_${Date.now()}`,
        folder: '/Holiday-images',
      });

      newImageUrl = uploadResponse.url;
      newImagekitFileId = uploadResponse.fileId;
    }
    //update the holiday
    const updatedHoliday = await Holiday.findByIdAndUpdate(id, {
      holiday_name,
      holiday_date,
      status,
      image_url: newImageUrl,
      imagekit_file_id: newImagekitFileId,
    });
    res.status(200).json({
      message: "Holiday updated successfully",
      holiday: updatedHoliday,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      details: error.message
    });
  }
 });

 

// delete the holiday
router.delete("/holiday/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try { 
    const holiday = await Holiday.findById(id);
    if (!holiday) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }
    if (holiday.imagekit_file_id) {
      try{
        await imagekit.deleteFile(holiday.imagekit_file_id);
      } catch (imageKitError) {
        console.error("Error deleting image from ImageKit:", imageKitError.message);
        return res.status(500).json({
          message: "Failed to delete image from ImageKit",
          details: imageKitError.message,
        });
      }
    }
    await Holiday.findByIdAndDelete(id);
    res.status(200).json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error!",
      details: error.message,
    });
  }
});




//Fetches All Holiday in the database
router.get('/holidays', authenticateToken, async (req, res) => {
  try {
    const holidays = await Holiday.find();
    const formattedHolidays = holidays.map(holiday => ({
      holiday_id: holiday._id,
      holiday_name: holiday.holiday_name,
      holiday_date: moment(holiday.holiday_date).format('YYYY-MM-DD'),
      image_url: holiday.image_url,
      imagekit_file_id: holiday.imagekit_file_id,
      status: holiday.status,
      createdAt: holiday.createdAt,
      updatedAt: holiday.updatedAt,
    }));
    res.status(200).json(formattedHolidays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holidays', details: error.message });
  }
});



// Route to get holidays for the current month
router.get('/holidays/current-month', authenticateToken, async (req, res) => {
  try {
    const startOfMonth = moment().startOf('month').utc().toDate(); 
    const endOfMonth = moment().endOf('month').utc().toDate(); 
    const holidays = await Holiday.find({
      holiday_date: {
        $gte: startOfMonth,
        $lte: endOfMonth,   
      },
    });
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holidays for the current month', details: error.message });
  }
});


// weekly holiday
// Route to fetch holidays within a date range
router.get('/holidays/week', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Validate and parse dates
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    // Fetch holidays in the date range
    const holidays = await Holiday.find({
      holiday_date: {
        $gte: start.toDate(),
        $lte: end.toDate(),
      },
    });

    // Format the holiday_date to 'YYYY-MM-DD' before returning it
    const formattedHolidays = holidays.map(holiday => ({
      ...holiday.toObject(),
      holiday_date: moment(holiday.holiday_date).format('YYYY-MM-DD'),
    }));    
    res.status(200).json({ holidays: formattedHolidays });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching holidays' });
  }
});



// API to fetch approved leave requests based on a date range and user_id
router.get('/birthdays-in-range', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const start = moment(start_date, 'YYYY-MM-DD').startOf('day');
    const end = moment(end_date, 'YYYY-MM-DD').endOf('day');

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    const currentYear = start.format('YYYY');
    const users = await User.aggregate([
      {
        $match: {
          user_type: {
            $in: [
              'Founder', 'Admin', 'SuperAdmin', 'HumanResource',
              'Accounts', 'Department_Head', 'Employee',
              'Social_Media_Manager', 'Task_manager',
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'userdetails', // Assuming the collection name for UserDetails is 'userdetails'
          localField: '_id',
          foreignField: 'user_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          'userDetails.date_of_birth': {
            $gte: moment().startOf('day').toDate(), 
          },
        },
      },
      {
        $project: {
          user_id: 1,
          first_name: 1,
          last_name: 1,
          'userDetails.date_of_birth': 1,
          profileImage: {
            $ifNull: ['$profileImage.image_url', null],
          },
        },
      },
      {
        $lookup: {
          from: 'profileimages',
          localField: '_id',
          foreignField: 'user_id',
          as: 'profileImage',
        },
      },
    ]);
    
    const result = users.map((user) => {
      const birthDate = moment(user.userDetails.date_of_birth);
      const birthMonthDay = birthDate.format('MM-DD');
      const birthdayInRange = moment(`${currentYear}-${birthMonthDay}`).isBetween(start, end, null, '[]');
      if (birthdayInRange) {
        return {
          user_id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          date_of_birth: `${currentYear}-${birthMonthDay}`,
          profile_image: user.profileImage ? user.profileImage.image_url : null,
        };
      }
    }).filter(user => user !== undefined);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//approved-leave-requests
router.get('/approved-leave-requests', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    const leaveRequests = await LeaveRequest.aggregate([
      {
        $match: { Status: 'Approved' },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'requestor',
        },
      },
      {
        $unwind: { path: '$requestor' },
      },
      {
        $lookup: {
          from: 'profileimages',
          localField: 'requestor.profileImage_id',
          foreignField: '_id',
          as: 'requestor.profileImage',
        },
      },
      {
        $project: {
          'requestor.first_name': 1,
          'requestor.last_name': 1,
          'requestor.profileImage.image_url': 1,
          Status: 1,
          dates: 1,
        },
      },
    ]);

    const filteredRequests = leaveRequests.filter((request) => {
      const datesArray =
        typeof request.dates === 'string' ? JSON.parse(request.dates) : request.dates;
      return datesArray.some((date) => {
        const dateObj = new Date(date);
        return dateObj >= start && dateObj <= end;
      });
    });

    const formattedRequests = filteredRequests.map(request => {
      const formattedDates = typeof request.dates === 'string' 
        ? JSON.parse(request.dates) 
        : request.dates;

      const formattedRequest = {
        ...request,
        Leave_request_id: request._id,
        _id: undefined,
        dates: formattedDates.map(date => new Date(date).toISOString().split('T')[0]), // Convert date to 'YYYY-MM-DD'
      };

      return formattedRequest;
    });
    res.json({ leaveRequests: formattedRequests });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'An error occurred while fetching leave requests.' });
  }
});





//work-anniversaries
router.get('/work-anniversaries', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Validate input dates
    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'start_date and end_date are required.' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    // Normalize input dates to remove time
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // MongoDB aggregation pipeline to fetch users with joining dates
    const anniversaries = await JoiningDate.aggregate([
      {
        $lookup: {
          from: 'users', // User collection
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false, // Ensure only users with a joining date are included
        }
      },
      {
        $match: {
          'user.user_type': { $ne: 'Ex_employee' }, // Exclude users with user_type 'Ex_employee'
        }
      },
      {
        $addFields: {
          joining_date: { $toDate: '$joining_date' }, // Ensure it's a Date object
        }
      },
      {
        $project: {
          user_id: '$user._id',
          first_name: '$user.first_name',
          last_name: '$user.last_name',
          email: '$user.email',
          profile_image: {
            $ifNull: [{ $arrayElemAt: ['$user.profileImage.image_url', 0] }, null],
          },
          joining_date: 1,
        }
      },
      {
        $addFields: {
          anniversary_date: {
            $dateFromParts: {
              year: { $year: '$joining_date' },
              month: { $month: '$joining_date' },
              day: { $dayOfMonth: '$joining_date' },
            },
          },
        },
      },
      {
        $match: {
          anniversary_date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $addFields: {
          years_of_service: { $subtract: [new Date().getFullYear(), { $year: '$joining_date' }] },
        }
      },
      {
        $project: {
          user_id: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          profile_image: 1,
          joining_date: 1,
          anniversary_date: 1,
          years_of_service: 1,
        }
      }
    ]);

    return res.status(200).json(anniversaries);
  } catch (error) {
    console.error('Error fetching work anniversaries:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});




module.exports = router;
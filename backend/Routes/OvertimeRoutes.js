const express = require('express');
const router = express.Router();
const Overtime = require('../Models/Overtime');
const ProfileImage = require('../Models/ProfileImage');
const moment = require('moment');
const User = require('../Models/User');
const { authenticateToken } = require('../middleware/authMiddleware');

const mongoose = require('mongoose');

// POST endpoint 
router.post('/add-overtime', authenticateToken, async (req, res) => {
  try {
    const { user_id, start_time, end_time, total_time, overtime_date } = req.body;
    // Validate required fields
    if (!user_id || !start_time || !end_time || !total_time || !overtime_date) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Create a new overtime record
    const newOvertime = new Overtime({
      user_id,
      start_time,
      end_time,
      total_time,
      status: 'Pending',
      overtime_date,
    });
    // Save the overtime record to the database
    await newOvertime.save();
    return res.status(201).json({
      message: 'Overtime record created successfully.',
      data: newOvertime,
    });
  } catch (error) {
    console.error('Error adding overtime record:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// PUT endpoint to edit overtime if status is Pending
router.put('/edit-overtime/:overtime_id', authenticateToken, async (req, res) => {
  try {
    const { overtime_id } = req.params;
    const { start_time, end_time, total_time, overtime_date } = req.body;
    // Validate required fields
    if (!start_time || !end_time || !total_time || !overtime_date) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Fetch the overtime record
    const overtimeRecord = await Overtime.findById(overtime_id)
    if (!overtimeRecord) {
      return res.status(404).json({ message: 'Overtime record not found.' });
    }
    // Allow editing only if status is 'Pending'
    if (overtimeRecord.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot edit overtime record unless status is Pending.' });
    }
    // Update the overtime record
    overtimeRecord.start_time = start_time;
    overtimeRecord.end_time = end_time;
    overtimeRecord.total_time = total_time;
    overtimeRecord.overtime_date = overtime_date;
    await overtimeRecord.save(); 
    res.status(200).json({ message: 'Overtime record updated successfully.', data: overtimeRecord });
  } catch (error) {
    console.error('Error editing overtime record:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } 
});


// PUT endpoint to update approval details and status
router.put('/update-overtime-status/:overtime_id', authenticateToken, async (req, res) => {
  try {
    const { overtime_id } = req.params;
    const { approved_by, reason, status } = req.body;

    // Validate required fields
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Only "Approved" or "Rejected" are allowed.' });
    }

    if (status === 'Rejected' && !reason) {
      return res.status(400).json({ message: 'Reason is required when rejecting an overtime request.' });
    }
    // Fetch the overtime record
    const overtimeRecord = await Overtime.findById(overtime_id)
    if (!overtimeRecord) {
      return res.status(404).json({ message: 'Overtime record not found.' });
    }
    if (overtimeRecord.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot update overtime record unless status is Pending.' });
    }
    overtimeRecord.approved_by = approved_by;
    overtimeRecord.reason = reason;
    overtimeRecord.status = status;
    await overtimeRecord.save();
    res.status(200).json({ message: 'Overtime status updated successfully.' });
  } catch (error) {
    console.error('Error updating overtime status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Get overtime data
router.get('/allovertime', authenticateToken, async (req, res) => {
  try {
    const { requesterName, monthYear } = req.query;
    const match = {};
    if (requesterName) {
      const matchedUsers = await User.find({
        $or: [
          { first_name: { $regex: requesterName, $options: 'i' } }, 
          { last_name: { $regex: requesterName, $options: 'i' } }  
        ]
      }).select('_id');
      match['user_id'] = {
        $in: matchedUsers.map(user => user._id) 
      };
    }
    // Overtime date filtering based on monthYear
    if (monthYear) {
      const [year, month] = monthYear.split('-');
      if (year && month) {
        const startDate = new Date(`${year}-${month}-01T00:00:00Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        match.overtime_date = { $gte: startDate, $lt: endDate };
      } else {
        return res.status(400).json({ message: 'Invalid monthYear format. Use YYYY-MM.' });
      }
    }
    // Aggregate the overtime records with filters
    const overtimeRecords = await Overtime.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'requester'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'approved_by',
          foreignField: '_id',
          as: 'approver'
        }
      },
      { $unwind: { path: '$requester', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$approver', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          user_id: 1,
          start_time: 1,
          end_time: 1,
          total_time: 1,
          status: 1,
          overtime_date: 1,
          reason: 1,
          requester_first_name: '$requester.first_name',
          requester_last_name: '$requester.last_name',
          approver_first_name: '$approver.first_name',
          approver_last_name: '$approver.last_name'
        }
      }
    ]);
    // Separate records by status
    const pendingRecords = overtimeRecords.filter(record => record.status === 'Pending');
    const approvedRecords = overtimeRecords.filter(record => record.status === 'Approved');
    const rejectedRecords = overtimeRecords.filter(record => record.status === 'Rejected');
    // Return the response
    res.status(200).json({
      Pending: pendingRecords,
      Approved: approvedRecords,
      Rejected: rejectedRecords
    });
  } catch (error) {
    console.error('Error fetching overtime records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.get('/overtime/user/:user_id', authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { monthYear } = req.query;

  try {
      // Build a dynamic filter object
      const filter = { user_id };

      // Filter by month and year for overtime_date
      if (monthYear) {
          const [year, month] = monthYear.split('-'); 

          if (year && month && !isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
              const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)); 
              const endOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)); 

              // Log the generated dates for debugging
              console.log(`Filtering overtime records for user ${user_id} in the range:`);
              console.log(`Start of the month: ${startOfMonth}`);
              console.log(`End of the month: ${endOfMonth}`);

              // Add the date range to the filter
              filter.overtime_date = {
                  $gte: startOfMonth, 
                  $lt: endOfMonth,   
              };
          } else {
              return res.status(400).json({ message: 'Invalid monthYear format. Use YYYY-MM.' });
          }
      }

      // Fetch overtime records from MongoDB
    const userOvertimeRecords = await Overtime.aggregate([
        { $match: filter }, 
        {
            $lookup: {
                from: 'users', 
                localField: 'requester',  
                foreignField: '_id', 
                as: 'requester'  
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'approver',
                foreignField: '_id',
                as: 'approver'
            }
        },
    
        // Unwind the requester and approver arrays if needed (in case the lookup results in arrays)
        { $unwind: { path: '$requester', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$approver', preserveNullAndEmptyArrays: true } },
    
        // Group the overtime records by status and count them
        {
            $group: {
                _id: '$status',  // Group by the status field
                count: { $sum: 1 },  // Count the number of records for each status
                records: { $push: '$$ROOT' }  // Optionally push all the records into an array for each status
            }
        },
    
        // Optionally, sort by the status or count if necessary
        { $sort: { _id: 1 } },  // Sort by status, or you can use count for sorting
    
        // Optionally, project the fields to control the final structure of the response
        {
            $project: {
                _id: 1,  // Show status
                count: 1,  // Show count
                records: 1,  // Show the actual overtime records in each group
            }
        }
    ]);
    
      // Separate records by status
      const pendingRecords = userOvertimeRecords.filter(record => record.status === 'Pending');
      const approvedRecords = userOvertimeRecords.filter(record => record.status === 'Approved');
      const rejectedRecords = userOvertimeRecords.filter(record => record.status === 'Rejected');

      // Structure the response
      res.status(200).json({
          Pending: pendingRecords,
          Approved: approvedRecords,
          Rejected: rejectedRecords,
      });
  } catch (error) {
      console.error('Error fetching overtime records for user:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

  
//get overtime 
router.get('/overtime/:overtime_id', authenticateToken, async (req, res) => {
    const { overtime_id } = req.params;
    console.log("log the overtimel", overtime_id)
    try {
        // If overtime_id is a string, we need to convert it to ObjectId for MongoDB
        const overtimeRecord = await Overtime.findById(overtime_id);
        console.log(overtimeRecord);
        if (!overtimeRecord) {
            return res.status(404).json({ message: 'Overtime record not found.' });
        }

        res.status(200).json(overtimeRecord);
    } catch (error) {
        console.error('Error fetching overtime record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

  

router.get('/dashboardovertime', authenticateToken, async (req, res) => {
  try {
      // Get the start and end dates for the current week
      const startOfWeek = moment().startOf('week').toDate(); 
      const endOfWeek = moment().endOf('week').toDate();     

      // Aggregate the overtime records with filters
      const overtimeRecords = await Overtime.aggregate([
          {
              $match: {
                  status: 'Pending',  // Filter by status
                  overtime_date: {
                      $gte: startOfWeek,  // Start of the current week
                      $lte: endOfWeek     // End of the current week
                  }
              }
          },
          {
              $lookup: {
                  from: 'users',  // Lookup for the 'requester' field from the 'User' collection
                  localField: 'requester',  // Field in the 'Overtime' collection
                  foreignField: '_id',  // Field in the 'User' collection
                  as: 'requester'
              }
          },
          {
              $unwind: { path: '$requester', preserveNullAndEmptyArrays: true }  // Unwind requester array to get the document itself
          },
          {
              $lookup: {
                  from: 'profileimages',  // Lookup for the 'profileImage' field from the 'ProfileImage' collection
                  localField: 'requester.profileImage',  // Field in the 'User' collection (embedded)
                  foreignField: '_id',  // Field in the 'ProfileImage' collection
                  as: 'requester.profileImage'
              }
          },
          {
              $lookup: {
                  from: 'users',  // Lookup for the 'approver' field from the 'User' collection
                  localField: 'approver',
                  foreignField: '_id',
                  as: 'approver'
              }
          },
          {
              $unwind: { path: '$approver', preserveNullAndEmptyArrays: true }  // Unwind approver array to get the document itself
          },
          {
              $project: {
                  status: 1,
                  overtime_date: 1,
                  requester: {
                      first_name: 1,
                      last_name: 1,
                      profileImage: { image_url: 1 }  // Only return the image URL of the requester
                  },
                  approver: {
                      first_name: 1,
                      last_name: 1
                  }
              }
          }
      ]);

      // Respond with the filtered records
      res.status(200).json({
          Pending: overtimeRecords
      });
  } catch (error) {
      console.error('Error fetching overtime records:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});







module.exports = router;

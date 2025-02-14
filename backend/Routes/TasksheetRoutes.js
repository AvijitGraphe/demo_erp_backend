const express = require('express');
const router = express.Router();
const Tasks = require('../Models/Tasks');
const Tasksheet = require('../Models/Tasksheet');
const Subtasksheet = require('../Models/Subtasksheet');
const Subtask = require('../Models/Subtask');
const User = require('../Models/User');
const ProfileImage = require('../Models/ProfileImage');
const Projects = require('../Models/Projects');
const Brand = require('../Models/Brand');
const { authenticateToken } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const mongooseTypes = mongoose.Types;

// Endpoint to update Tasksheet when task status changes
router.post('/update-tasksheet', authenticateToken, async (req, res) => {
  const { task_id, status } = req.body;
  try {
    const task = await Tasks.findById(task_id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    // Get the current date in the format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    // Fetch today's Tasksheet data
    const todaysTasksheets = await Tasksheet.find({ tasksheet_date: today });
    // Find the existing entry for the current task using the correct task_id
    const existingEntry = todaysTasksheets.find(sheet => sheet.task_id.toString() === task._id.toString());

    if (existingEntry) {
      // Update the existing entry
      existingEntry.task_status = status;
      existingEntry.task_deadline = task.task_deadline;
      existingEntry.task_priority_flag = task.priority_flag;
      existingEntry.missed_deadline = task.missed_deadline;
      existingEntry.tasksheet_date = today;

      await existingEntry.save(); // Save the updated entry
    } else {
      // Insert a new entry for today using the correct task_id from task._id
      const newTasksheet = new Tasksheet({
        task_id: task._id,  // Use task._id here
        tasksheet_user_id: task.task_user_id,
        task_status: status,
        task_deadline: task.task_deadline,
        task_priority_flag: task.priority_flag,
        missed_deadline: task.missed_deadline,
        tasksheet_date: today,
      });
      await newTasksheet.save(); // Save the new entry
    }

    res.status(200).json({ message: 'Tasksheet updated successfully.' });
  } catch (error) {
    console.error('Error updating tasksheet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//post handle-subtask-status
router.post('/handle-subtask-status', authenticateToken, async (req, res) => {
  const { subtask_id, task_id } = req.body;

  if (!subtask_id || !task_id) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    // Fetch subtask details
    const subtask = await Subtask.findById(subtask_id, {
      _id: 1, // Only fetching necessary fields
      status: 1,
      sub_task_deadline: 1,
      priority_flag: 1,
      missed_deadline: 1,
      sub_task_user_id: 1,
    });

    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found.' });
    }

    if (subtask.status !== 'Completed') {
      return res.status(400).json({ message: 'Subtask is not completed.' });
    }

    // Fetch task details
    const task = await Tasks.findById(task_id, {
      _id: 1, // Only fetching necessary fields
      task_user_id: 1,
      task_deadline: 1,
      status: 1,
      priority_flag: 1,
      missed_deadline: 1,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const today = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD

    // Check for an existing entry in Tasksheet
    let tasksheet = await Tasksheet.findOne({
      task_id: task._id,
      tasksheet_date: today,
    });

    if (!tasksheet) {
      // Create a new entry in Tasksheet if not found
      tasksheet = new Tasksheet({
        task_id: task._id,
        tasksheet_user_id: task.task_user_id,
        task_status: task.status, // Default status for the task
        task_deadline: task.task_deadline,
        task_priority_flag: task.priority_flag,
        missed_deadline: task.missed_deadline,
        tasksheet_date: today,
      });
      await tasksheet.save(); // Save the tasksheet
    }

    // Insert into Subtasksheet
    const subtasksheet = new Subtasksheet({
      tasksheet_id: tasksheet._id, // Reference to the tasksheet created above
      task_id,
      subtask_id,
      Subtask_status: subtask.status,
      task_deadline: subtask.sub_task_deadline,
      task_priority_flag: subtask.priority_flag,
      missed_deadline: subtask.missed_deadline,
    });

    await subtasksheet.save(); // Save the subtasksheet

    return res.status(200).json({ message: 'Subtask data added to Subtasksheet successfully.' });
  } catch (error) {
    console.error('Error handling subtask status:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});




//Get tasksheets
router.get('/tasksheets', authenticateToken, async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both start_date and end_date query parameters.',
    });
  }

  try {
    const tasksheets = await Tasksheet.aggregate([
      {
        $match: {
          tasksheet_date: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task_id',
          foreignField: '_id',
          as: 'Task',
        },
      },
      {
        $unwind: {
          path: '$Task',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'subtasksheets',
          localField: 'Task._id',
          foreignField: 'task_id',
          as: 'Task.Subtasksheets',
        },
      },
      {
        $lookup: {
          from: 'subtasks',
          localField: 'Task.Subtasksheets.subtask_id',
          foreignField: '_id',
          as: 'Task.Subtasksheets.Subtask',
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'Task.project_id',
          foreignField: '_id',
          as: 'Task.project',
        },
      },
      {
        $unwind: {
          path: '$Task.project',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'Task.project.brand_id',
          foreignField: '_id',
          as: 'Task.project.brand',
        },
      },
      {
        $unwind: {
          path: '$Task.project.brand',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'tasksheet_user_id',
          foreignField: '_id',
          as: 'User',
        },
      },
      {
        $unwind: {
          path: '$User',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'profileimages',
          localField: 'User.profile_image_id',
          foreignField: '_id',
          as: 'User.profileImage',
        },
      },
      {
        $unwind: {
          path: '$User.profileImage',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          'User._id': 1,
          tasksheet_date: 1,
        },
      },
    ]);

  
    
    if (!tasksheets.length) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No tasksheets found within the given date range.',
      });
    }

    const groupedData = {};
    for (const tasksheet of tasksheets) {
      const user = tasksheet.User; // Save User object in a variable
      if (!user) {
        continue; // If User is undefined, skip this tasksheet
      }

      const userId = user._id ? user._id.toString() : null; // Ensure user._id exists before calling .toString()
      if (!userId) {
        continue; // If _id is missing or null, skip this tasksheet
      }

      const dateKey = tasksheet.tasksheet_date.toISOString().split('T')[0];

      if (!groupedData[userId]) {
        groupedData[userId] = {
          userDetails: {
            user_id: user._id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            profileImage: user.profileImage?.image_url || null,
          },
          missedDeadlineCounts: {
            missedTrueCount: 0,
            missedFalseCount: 0,
          },
          tasksheets: {},
        };
      }

      groupedData[userId].missedDeadlineCounts.missedTrueCount += tasksheet.missed_deadline ? 1 : 0;
      groupedData[userId].missedDeadlineCounts.missedFalseCount += tasksheet.missed_deadline ? 0 : 1;

      if (!groupedData[userId].tasksheets[dateKey]) {
        groupedData[userId].tasksheets[dateKey] = [];
      }

      groupedData[userId].tasksheets[dateKey].push({
        ...tasksheet,
        project: {
          project_id: tasksheet.Task.project?._id || null,
          project_name: tasksheet.Task.project?.project_name || null,
          brand: tasksheet.Task.project?.brand || null,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: groupedData,
    });
  } catch (error) {
    console.error('Error fetching tasksheets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasksheets',
      error: error.message,
    });
  }
});




// router.get('/tasksheets', authenticateToken, async (req, res) => {
//     const { start_date, end_date } = req.query;
//     if (!start_date || !end_date) return res.status(400).json({ success: false, message: 'Start/end date required' });

//     try {
//         const pipeline = [
//             { $match: { 
//                 tasksheet_date: { 
//                     $gte: new Date(start_date), 
//                     $lte: new Date(end_date) 
//                 } 
//             }},
//             { $lookup: {
//                 from: 'users',
//                 localField: 'user_id',
//                 foreignField: '_id',
//                 as: 'User',
//                 pipeline: [{ $lookup: {
//                     from: 'profileimages',
//                     localField: 'profileImage',
//                     foreignField: '_id',
//                     as: 'profileImage'
//                 }}]
//             }},

//             { $unwind: '$User' },

//             { $lookup: {
//                 from: 'tasks',
//                 localField: 'task_id',
//                 foreignField: '_id',
//                 as: 'Task',
//                 pipeline: [{ $lookup: {
//                     from: 'subtasksheets',
//                     localField: '_id',
//                     foreignField: 'task_id',
//                     as: 'Subtasksheets',
//                     pipeline: [{ $lookup: {
//                         from: 'subtasks',
//                         localField: 'subtask_id',
//                         foreignField: '_id',
//                         as: 'Subtask'
//                     }}]
//                 }},
//                 { $lookup: {
//                     from: 'projects',
//                     localField: 'project_id',
//                     foreignField: '_id',
//                     as: 'project',
//                     pipeline: [{ $lookup: {
//                         from: 'brands',
//                         localField: 'brand_id',
//                         foreignField: '_id',
//                         as: 'brand'
//                     }}]
//                 }}
//             ]},

//             { $unwind: '$Task' },

//             { $group: {
//                 _id: { 
//                     userId: '$User._id', 
//                     date: '$tasksheet_date' 
//                 },
//                 userDetails: { $first: {
//                     user_id: '$User._id',
//                     name: { $concat: ['$User.first_name', ' ', '$User.last_name'] },
//                     email: '$User.email',
//                     profileImage: { $arrayElemAt: ['$User.profileImage.image_url', 0] }
//                 }},
//                 tasksheets: { $push: '$$ROOT' },
//                 missedTrueCount: { $sum: { $cond: ['$missed_deadline', 1, 0] } },
//                 missedFalseCount: { $sum: { $cond: ['$missed_deadline', 0, 1] } }
//             }},
//             { $group: {
//                 _id: '$_id.userId',
//                 userDetails: { $first: '$userDetails' },
//                 missedDeadlineCounts: { $first: {
//                     missedTrueCount: '$missedTrueCount',
//                     missedFalseCount: '$missedFalseCount'
//                 }},
//                 tasksheets: { $push: {
//                     date: '$_id.date',
//                     entries: '$tasksheets'
//                 }}
//             }},
//             { $project: {
//                 _id: 0,
//                 'userDetails.user_id': 1,
//                 'userDetails.name': 1,
//                 'userDetails.email': 1,
//                 'userDetails.profileImage': 1,
//                 'missedDeadlineCounts.missedTrueCount': 1,
//                 'missedDeadlineCounts.missedFalseCount': 1,
//                 tasksheets: {
//                     $arrayToObject: {
//                         $map: {
//                             input: '$tasksheets',
//                             as: 't',
//                             in: { 
//                                 k: { $dateToString: { format: '%Y-%m-%d', date: '$$t.date' } }, 
//                                 v: '$$t.entries' 
//                             }
//                         }
//                     }
//                 }
//             }},
//             { $sort: { 'userDetails.user_id': 1 } }
//         ];

//         const result = await Tasksheet.aggregate(pipeline);
        
//         if (!result.length) return res.status(200).json({ success: true, data: null });
        
//         const formattedData = result.reduce((acc, curr) => {
//             acc[curr.userDetails.user_id] = curr;
//             return acc;
//         }, {});

//         res.status(200).json({ success: true, data: formattedData });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'Server error', error: error.message });
//     }
// });






//Get tasksheets
router.get('/tasksheets/user/:tasksheet_user_id', authenticateToken, async (req, res) => {
  const { tasksheet_user_id } = req.params;
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both start_date and end_date query parameters.',
    });
  }

  try {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const tasksheets = await Tasksheet.aggregate([
      {
        $match: {
          tasksheet_user_id: new mongoose.Types.ObjectId(tasksheet_user_id),
          tasksheet_date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'tasks',  // Ensure collection name 'tasks' is correct (lowercase)
          localField: 'task_id', 
          foreignField: '_id',  // Ensure correct field for reference
          as: 'Task',
        },
      },
      {
        $unwind: {
          path: '$Task',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'subtasksheets',  // Correct collection name
          localField: 'Task._id',
          foreignField: 'task_id',
          as: 'Task.Subtasksheets',
        },
      },
      {
        $unwind: {
          path: '$Task.Subtasksheets',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'subtasks',  // Correct collection name
          localField: 'Task.Subtasksheets.subtask_id',
          foreignField: '_id',
          as: 'Task.Subtasksheets.Subtask',
        },
      },
      {
        $lookup: {
          from: 'projects',  // Correct collection name
          localField: 'Task.project_id',  // Ensure correct field for reference
          foreignField: '_id',
          as: 'Task.project',
        },
      },
      {
        $unwind: {
          path: '$Task.project',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'brands',  // Correct collection name
          localField: 'Task.project.brand_id',
          foreignField: '_id',
          as: 'Task.project.brand',
        },
      },
      {
        $unwind: {
          path: '$Task.project.brand',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',  // Correct collection name
          localField: 'tasksheet_user_id',
          foreignField: '_id',
          as: 'User',
        },
      },
      {
        $unwind: {
          path: '$User',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'profileimages',  // Correct collection name
          localField: 'User.profileImage',
          foreignField: '_id',
          as: 'User.profileImage',
        },
      },
      {
        $project: {
          'User.password': 0,
          'User.profileImage.password': 0, // Exclude sensitive fields like password
        },
      },
      {
        $sort: { tasksheet_date: 1 },
      },
    ]);

    if (!tasksheets || tasksheets.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No tasksheets found within the given date range.',
      });
    }
    res.status(200).json({
      success: true,
      data: tasksheets,
    });
  } catch (error) {
    // console.error('Error fetching tasksheets for user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasksheets for user',
      error: error.message,
    });
  }
});






module.exports = router;

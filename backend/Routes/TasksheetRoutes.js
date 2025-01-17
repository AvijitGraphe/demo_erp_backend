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

// Endpoint to update Tasksheet when task status changes
router.post('/update-tasksheet', authenticateToken, async (req, res) => {
  const { task_id, status } = req.body;
  console.log("log the task_id and status ", task_id, status);
  try {
    const task = await Tasks.findById(task_id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    // Get the current date in the format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    console.log("log the task fetched from DB ", task);
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
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Aggregation pipeline for Tasksheets with populated data
    const tasksheets = await Tasksheet.aggregate([
      {
        $match: {
          tasksheet_date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'tasks', // Assuming Tasks collection name is 'tasks'
          localField: 'task_id',
          foreignField: '_id',
          as: 'task',
        },
      },
      {
        $unwind: { path: '$task', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'subtasksheets', // Assuming Subtasksheet collection name is 'subtasksheets'
          localField: '_id',
          foreignField: 'tasksheet_id',
          as: 'subtasksheets',
        },
      },
      {
        $lookup: {
          from: 'projects', // Assuming Projects collection name is 'projects'
          localField: 'task.project_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $unwind: { path: '$project', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'brands', // Assuming Brand collection name is 'brands'
          localField: 'project.brand_id',
          foreignField: '_id',
          as: 'brand',
        },
      },
      {
        $unwind: { path: '$brand', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'users', // Assuming Users collection name is 'users'
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true }, // This ensures user field exists or is null
      },
      {
        $lookup: {
          from: 'profileimages', // Assuming ProfileImage collection name is 'profileimages'
          localField: 'user.profile_image_id',
          foreignField: '_id',
          as: 'profileImage',
        },
      },
      {
        $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true }, // Ensures profileImage exists or is null
      },
      {
        $project: {
          _id: 1,
          tasksheet_date: 1,
          missed_deadline: 1,
          task: 1,
          user: 1,
          profileImage: { image_url: 1 },
          project: {
            project_id: '$project._id',
            project_name: '$project.project_name',
            brand: '$brand',
          },
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

    // Group tasksheets by user_id and date
    const groupedData = {};
    for (const tasksheet of tasksheets) {
      const user = tasksheet.user; // Ensure user exists
      if (!user) {
        continue; // Skip tasksheets that have no associated user
      }

      const userId = user._id.toString();
      const dateKey = tasksheet.tasksheet_date.toISOString().split('T')[0]; // Use date without time

      if (!groupedData[userId]) {
        groupedData[userId] = {
          userDetails: {
            user_id: user._id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            profileImage: tasksheet.profileImage?.image_url || null,
          },
          missedDeadlineCounts: {
            missedTrueCount: 0,
            missedFalseCount: 0,
          },
          tasksheets: {},
        };
      }

      // Increment missed deadlines counts
      groupedData[userId].missedDeadlineCounts.missedTrueCount += tasksheet.missed_deadline ? 1 : 0;
      groupedData[userId].missedDeadlineCounts.missedFalseCount += tasksheet.missed_deadline ? 0 : 1;

      if (!groupedData[userId].tasksheets[dateKey]) {
        groupedData[userId].tasksheets[dateKey] = [];
      }

      // Push the tasksheet data with project details
      groupedData[userId].tasksheets[dateKey].push({
        ...tasksheet,
        project: {
          project_id: tasksheet.project?.project_id || null,
          project_name: tasksheet.project?.project_name || null,
          brand: tasksheet.project?.brand || null,
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
    const tasksheets = await Tasksheet.aggregate([
      {
        $match: {
          tasksheet_user_id: new mongoose.Types.ObjectId(tasksheet_user_id),
          tasksheet_date: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
        },
      },
      {
        $lookup: {
          from: 'tasks', // Ensure collection name matches your schema
          localField: 'task_id',
          foreignField: '_id',
          as: 'Task',
        },
      },
      {
        $unwind: '$Task',
      },
      {
        $lookup: {
          from: 'subtasksheets', // Ensure collection name matches your schema
          localField: 'Task._id',
          foreignField: 'task_id',
          as: 'Subtasksheets',
        },
      },
      {
        $lookup: {
          from: 'subtasks', // Ensure collection name matches your schema
          localField: 'Subtasksheets.subtask_id',
          foreignField: '_id',
          as: 'Subtasks',
        },
      },
      {
        $lookup: {
          from: 'projects', // Ensure collection name matches your schema
          localField: 'Task.project_id',
          foreignField: '_id',
          as: 'Project',
        },
      },
      {
        $lookup: {
          from: 'brands', // Ensure collection name matches your schema
          localField: 'Project.brand_id',
          foreignField: '_id',
          as: 'Brand',
        },
      },
      {
        $lookup: {
          from: 'users', // Ensure collection name matches your schema
          localField: 'tasksheet_user_id',
          foreignField: '_id',
          as: 'User',
        },
      },
      {
        $unwind: '$User',
      },
      {
        $lookup: {
          from: 'profileimages', // Assuming ProfileImage collection
          localField: 'User.profileImage_id',
          foreignField: '_id',
          as: 'ProfileImage',
        },
      },
      {
        $unwind: {
          path: '$ProfileImage',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { tasksheet_date: 1 }, // Sort by tasksheet_date ascending
      },
    ]);

    if (!tasksheets.length) {
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
    console.error('Error fetching tasksheets for user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasksheets for user',
      error: error.message,
    });
  }
});







module.exports = router;

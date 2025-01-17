const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Projects = require('../Models/Projects');
const Brand = require('../Models/Brand');
const Tasks = require('../Models/Tasks');
const Subtask = require('../Models/Subtask');
const ProjectUserRole = require('../Models/ProjectUserRole');
const UserTaskPositions = require('../Models/UserTaskPositions');
const ProfileImage = require('../Models/ProfileImage');
const TaskStatusLogger = require('../Models/Taskstatuslogger');
const { authenticateToken } = require('../middleware/authMiddleware');

const mongoose = require('mongoose');


// GET /monthly-report
// Fetch monthly report for a brand and project
router.get('/fetch-monthly-report', authenticateToken, async (req, res) => {
    const { brandId, projectId, month } = req.query;
    if (!brandId || !projectId || !month) {
        return res.status(400).json({ error: 'brandId, projectId, and month are required' });
    }
    try {
        // Step 1: Fetch Brand Data
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
      
        // Step 2: Fetch Project Data
        const project = await Projects.find({
            brand_id: brand._id,   
            _id: projectId,              
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // console.log(project)
        // Step 3: Fetch Lead Details
        const lead = await User.aggregate([
            { $match: { _id: project[0].lead_id } },  // Match the lead by its ID
            {
              $lookup: {
                from: 'profileimages',  // The collection name for ProfileImage (default plural form)
                localField: '_id',       // Field in User that will match ProfileImage.user_id
                foreignField: 'user_id', // Field in ProfileImage that will match User._id
                as: 'profileImage',      // The alias for the joined data
              }
            },
            {
              $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true }  // Unwind the profileImage array if it's there
            },
            {
              $project: { 
                first_name: 1, 
                last_name: 1, 
                'profileImage.image_url': 1  // Select the image_url from the profileImage object
              }
            }
        ]);
          
        //Step 4: Fetch Member Details
        const members = await User.aggregate([
            {
              $match: {
                _id: { $in: project[0].member_id }  // Match the users whose IDs are in the project.member_id array
              }
            },
            {
              $lookup: {
                from: 'profileimages',   // The collection name for ProfileImage (default plural form)
                localField: '_id',       // Field in User that will match ProfileImage.user_id
                foreignField: 'user_id', // Field in ProfileImage that will match User._id
                as: 'profileImage',      // Alias for the joined profile image data
              }
            },
            {
              $unwind: {
                path: '$profileImage',       // Unwind profileImage array
                preserveNullAndEmptyArrays: true  // Preserve null if no profile image
              }
            },
            {
              $project: {
                first_name: 1,          // Include first_name
                last_name: 1,           // Include last_name
                'profileImage.image_url': 1  // Include the image_url from profileImage
              }
            }
          ]);
        
        // Step 5: Fetch Task Data
    const tasks = await Tasks.aggregate([
        {
            $match: {
                project_id: project.project_id,
                $expr: {
                    $eq: [{ $month: "$task_startdate" }, month], // Match the tasks by the month of task_startdate
                },
            },
        },
        {
            $lookup: {
                from: 'users', // The collection name for User (default plural form)
                localField: 'task_user_id', // Field in Tasks that matches User._id
                foreignField: '_id', // Field in User that matches task_user_id
                as: 'assignee', // Alias for the joined data
            },
        },
        {
            $unwind: {
                path: '$assignee', // Unwind the assignee array
                preserveNullAndEmptyArrays: true, // Keep tasks with no assignee
            },
        },
        {
            $lookup: {
                from: 'profileimages', // The collection name for ProfileImage (default plural form)
                localField: 'assignee._id', // Field in assignee that matches ProfileImage.user_id
                foreignField: 'user_id', // Field in ProfileImage that matches assignee._id
                as: 'assignee.profileImage', // Alias for the joined profile image data
            },
        },
        {
            $unwind: {
                path: '$assignee.profileImage', // Unwind the profileImage array for assignee
                preserveNullAndEmptyArrays: true, // Keep assignees without profile image
            },
        },
        {
            $project: {
                _id: 1,
                task_id: 1,
                task_name: 1,
                task_deadline: 1,
                status: 1,
                missed_deadline: 1,
                assignee: {
                    first_name: 1,
                    last_name: 1,
                    profile_image: {
                        image_url: 1, // Only include image_url from the profileImage object
                    },
                },
                priority_flag: 1, // Assuming there is a priority_flag in tasks
            },
        },
    ]);

    // Step 6: Priority Tasks and Statistics
    const priorityTasks = tasks.filter(task => task.priority_flag === 'Priority');
    const priorityTaskDetails = priorityTasks.map(task => ({
        task_id: task.task_id,
        task_name: task.task_name,
        deadline: task.task_deadline,
        status: task.status,
        missed_deadline: task.missed_deadline,
        assignee: task.assignee
            ? {
                first_name: task.assignee.first_name,
                last_name: task.assignee.last_name,
                profile_image: task.assignee.profile_image?.image_url || null,
            }
            : null, // If no assignee
    }));

    const taskCountByStatus = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {});

    const missedDeadlineCount = tasks.filter(task => task.missed_deadline).length;

    // Step 7: Task Logs with User Details
    const taskLogs = await TaskStatusLogger.aggregate([
        {
            $match: {
                task_id: { $in: tasks.map(task => task.task_id) },
            },
        },
        {
            $lookup: {
                from: 'tasks', // The collection name for Task (default plural form)
                localField: 'task_id', // Field in TaskStatusLogger that matches Tasks._id
                foreignField: '_id', // Field in Tasks that matches task_id
                as: 'task', // Alias for the joined task data
            },
        },
        {
            $unwind: {
                path: '$task', // Unwind the task array
            },
        },
        {
            $lookup: {
                from: 'users', // The collection name for User
                localField: 'user_id', // Field in TaskStatusLogger that matches User._id
                foreignField: '_id', // Field in User that matches user_id
                as: 'user', // Alias for the joined user data
            },
        },
        {
            $unwind: {
                path: '$user', // Unwind the user array
            },
        },
        {
            $lookup: {
                from: 'profileimages', // The collection name for ProfileImage
                localField: 'user._id', // Field in user that matches ProfileImage.user_id
                foreignField: 'user_id', // Field in ProfileImage that matches user._id
                as: 'user.profileImage', // Alias for the joined profile image data
            },
        },
        {
            $unwind: {
                path: '$user.profileImage', // Unwind the profileImage array
                preserveNullAndEmptyArrays: true, // Keep users without profile images
            },
        },
        {
            $project: {
                task_id: 1,
                'task.task_name': 1,
                'task.task_description': 1,
                'user.first_name': 1,
                'user.last_name': 1,
                'user.profileImage.image_url': 1, // Only include the image_url from profileImage
            },
        },
    ]);

    // Step 8: Response
    return res.json({
        brand,
        project: {
            ...project, // No need for .toJSON() here
            lead,
            members,
        },
        taskStatistics: {
            totalTasks: tasks.length,
            taskCountByStatus,
            missedDeadlineCount,
            priorityTasks: {
                count: priorityTasks.length,
                details: priorityTaskDetails,
            },
        },
        taskLogs,
    });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
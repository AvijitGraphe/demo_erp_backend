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
    // Step 1: Validate Request Parameters
    if (!brandId || !projectId || !month) {
        return res.status(400).json({ error: 'brand_name, project_name, and month are required' });
    }


    try {
        // Step 2: Fetch Brand Data
        const brand = await Brand.findById(new mongoose.Types.ObjectId(brandId));
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        // Step 3: Fetch Project Data
        const project = await Projects.findOne({
            _id: new mongoose.Types.ObjectId(projectId),
            brand_id: new mongoose.Types.ObjectId(brand._id),
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Step 4: Fetch Lead Details
        const lead = await User.findOne({
            _id: new mongoose.Types.ObjectId(project.lead_id),
        }).select('first_name last_name profileImage');


        // Step 5: Fetch Member Details
        const members = await User.find({
            _id: { $in: project.member_id.map(id => new mongoose.Types.ObjectId(id)) },
        }).select('first_name last_name profileImage');

        // Step 6: Fetch Task Data for the Given Month Using $expr and $month
        const tasks = await Tasks.aggregate([
            {
                $match: {
                    project_id: new mongoose.Types.ObjectId(project._id),
                    $expr: {
                        $eq: [
                            { $month: "$task_startdate" },   // Get month from task_startdate
                            parseInt(month),                  // Convert 'month' query to integer
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: 'users', // 'users' is the collection name for the User model in MongoDB
                    localField: 'task_user_id', // Corrected field name to task_user_id
                    foreignField: '_id',        // This is the field in the 'users' collection that corresponds to task_user_id
                    as: 'assigneeDetails',      // The result will be in a new field called 'assigneeDetails'
                },
            },
            {
                $unwind: '$assigneeDetails', // Unwind the array returned by $lookup, since there will only be one assignee
            },
            {
                $project: {
                    _id: 1,
                    task_name: 1,
                    task_deadline: 1,
                    status: 1,
                    missed_deadline: 1,
                    assignee: {
                        first_name: '$assigneeDetails.first_name',
                        last_name: '$assigneeDetails.last_name',
                        profileImage: '$assigneeDetails.profileImage',
                    },
                },
            },
        ]);
        


        // Step 7: Priority Tasks and Statistics
        const priorityTasks = tasks.filter(task => task.priority_flag === 'Priority');
        const priorityTaskDetails = priorityTasks.map(task => ({
            task_id: task._id,
            task_name: task.task_name,
            deadline: task.task_deadline,
            status: task.status,
            missed_deadline: task.missed_deadline,
            assignee: task.assignee
                ? {
                    first_name: task.assignee.first_name,
                    last_name: task.assignee.last_name,
                    profile_image: task.assignee.profileImage?.image_url || null,
                }
                : null,
        }));

        const taskCountByStatus = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});

        const missedDeadlineCount = tasks.filter(task => task.missed_deadline).length;

        // Step 8: Fetch Task Logs with User Details
        const taskLogs = await TaskStatusLogger.aggregate([
            {
                $match: {
                    task_id: { $in: tasks.map(task => new mongoose.Types.ObjectId(task._id)) },
                },
            },
            {
                $lookup: {
                    from: 'tasks',
                    localField: 'task_id',
                    foreignField: '_id',
                    as: 'task',
                },
            },
            {
                $unwind: '$task',
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'task_user_id',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: '$userDetails',
            },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'userDetails.profileImage',
                    foreignField: '_id',
                    as: 'userDetails.profileImageDetails',
                },
            },
            {
                $unwind: {
                    path: '$userDetails.profileImageDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    task_id: 1,
                    time_stamp: 1, 
                    status_initial: 1,
                    status_final: 1,
                    task:{
                        task_name: '$task.task_name',
                        task_description: '$task.task_description',
                    },
                    user: {
                        first_name: '$userDetails.first_name',
                        last_name: '$userDetails.last_name',
                        profileImage: '$userDetails.profileImageDetails.image_url',
                    },
                },
            },
        ]);
        // Step 9: Response
        return res.json({
            brand,
            project: {
                ...project.toObject(),
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
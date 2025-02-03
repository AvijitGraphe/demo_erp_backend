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
    const brandObjId = new mongoose.Types.ObjectId(brandId);
    const projectObjId = new mongoose.Types.ObjectId(projectId);
    try {
        const result = await Projects.aggregate([
            { $match: { _id: projectObjId, brand_id: brandObjId } },
            {
                $lookup: {
                    from: "brands",
                    localField: "brand_id",
                    foreignField: "_id",
                    as: "brand"
                }
            },
            { $unwind: "$brand" },
            {
                $lookup: {
                    from: "users",
                    localField: "lead_id",
                    foreignField: "_id",
                    as: "project.lead",
                    pipeline: [
                        {
                            $lookup: {
                                from: "profileimages",
                                localField: "profileImage",
                                foreignField: "_id",
                                as: "profileImage"
                            }
                        },
                        { $unwind: { path: "$profileImage", preserveNullAndEmptyArrays: true } },
                        { $project: { first_name: 1, last_name: 1, profileImage: 1 } }
                    ]
                }
            },
            { $unwind: { path: "$project.lead", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "member_id",
                    foreignField: "_id",
                    as: "project.members",
                    pipeline: [
                        {
                            $lookup: {
                                from: "profileimages",
                                localField: "profileImage", 
                                foreignField: "_id",
                                as: "profileImage"
                            }
                        },
                        { $unwind: { path: "$profileImage", preserveNullAndEmptyArrays: true } },
                        { $project: { first_name: 1, last_name: 1, profileImage: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "tasks",
                    let: { projectId: "$_id" },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { $eq: ["$project_id", "$$projectId"] },
                                $expr: { $eq: [{ $month: "$task_startdate" }, parseInt(month)] }
                            } 
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "task_user_id",
                                foreignField: "_id",
                                as: "assignee",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "profileimages",
                                            localField: "profileImage",
                                            foreignField: "_id",
                                            as: "profileImage"
                                        }
                                    },
                                    { $unwind: { path: "$profileImage", preserveNullAndEmptyArrays: true } },
                                    { $project: { first_name: 1, last_name: 1, profileImage: 1 } }
                                ]
                            }
                        },
                        { $unwind: { path: "$assignee", preserveNullAndEmptyArrays: true } }
                    ],
                    as: "tasks"
                }
            },
            {
                $lookup: {
                    from: "taskstatusloggers",
                    let: { taskIds: "$tasks._id" },
                    pipeline: [
                        { $match: { $expr: { $in: ["$task_id", "$$taskIds"] } } },
                        {
                            $lookup: {
                                from: "tasks",
                                localField: "task_id",
                                foreignField: "_id",
                                as: "task",
                                pipeline: [{ $project: { task_name: 1, task_description: 1 } }]
                            }
                        },
                        { $unwind: "$task" },
                        {
                            $lookup: {
                                from: "users",
                                localField: "task_user_id",
                                foreignField: "_id",
                                as: "user",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "profileimages",
                                            localField: "profileImage",
                                            foreignField: "_id",
                                            as: "profileImage"
                                        }
                                    },
                                    { $unwind: { path: "$profileImage", preserveNullAndEmptyArrays: true } },
                                    { $project: { first_name: 1, last_name: 1, profileImage: 1 } }
                                ]
                            }
                        },
                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }
                    ],
                    as: "taskLogs"
                }
            },
            {
                $project: {
                    brand: {
                        brand_id: "$brand._id",
                        brand_name: "$brand.brand_name",
                        createdAt: "$brand.createdAt",
                        updatedAt: "$brand.updatedAt"
                    },
                    project: {
                        project_id: "$_id",
                        project_name: "$project_name",
                        lead: 1,
                        members: 1, 
                        createdAt: "$createdAt",
                        updatedAt: 1,
                        member: '$project.member',
                        
                    },
                    taskStatistics: {
                        totalTasks: { $size: "$tasks" },
                        taskCountByStatus: {
                            $arrayToObject: {
                                $map: {
                                    input: "$tasks",
                                    as: "t",
                                    in: { k: "$$t.status", v: { $sum: 1 } }
                                }
                            }
                        },
                        missedDeadlineCount: {
                            $sum: {
                                $map: {
                                    input: "$tasks",
                                    as: "t",
                                    in: { $cond: [{ $eq: ["$$t.missed_deadline", true] }, 1, 0] }
                                }
                            }
                        },
                        priorityTasks: {
                            count: {
                                $size: {
                                    $filter: {
                                        input: "$tasks",
                                        cond: { $eq: ["$$this.priority_flag", "Priority"] }
                                    }
                                }
                            },
                            details: {
                                $map: {
                                    input: {
                                        $filter: {
                                            input: "$tasks",
                                            cond: { $eq: ["$$this.priority_flag", "Priority"] }
                                        }
                                    },
                                    as: "pt",
                                    in: {
                                        task_id: "$$pt._id",
                                        task_name: "$$pt.task_name",
                                        deadline: "$$pt.task_deadline",
                                        status: "$$pt.status",
                                        missed_deadline: "$$pt.missed_deadline",
                                        assignee: "$$pt.assignee"
                                    }
                                }
                            }
                        }
                    },
                    taskLogs: 1
                }
            }
        ]);

        if (result.length === 0) return res.status(404).json({ error: "Project not found" });
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
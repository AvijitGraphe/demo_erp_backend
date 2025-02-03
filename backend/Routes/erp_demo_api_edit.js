
// /############################### All Projects###################

//projectRoutes.js(routes)

// Fetch Projects by User API with Pagination and Filters
router.get('/projects/user/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;                                                                                              
    const { brand_name, end_date } = req.query;
    const userId = new mongoose.Types.ObjectId(user_id);

    try {
        const user = await User.findById(userId).select('user_type');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const pipeline = [];
        const privilegedRoles = ['Founder', 'Admin', 'SuperAdmin', 'HumanResource', 'Department_Head', 'Task_manager'];

        if (!privilegedRoles.includes(user.user_type)) {
            pipeline.push({
                $match: {
                    $expr: {
                        $or: [
                            { $eq: ["$lead_id", userId] },
                            { $in: [userId, { $ifNull: ["$member_id", []] }] }
                        ]
                    }
                }
            });
        }

        if (brand_name) {
            pipeline.push({
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand',
                    pipeline: [
                        { $match: { brand_name: { $regex: brand_name, $options: 'i' } } },
                        { $project: { brand_name: 1 } }
                    ]
                }
            });
            pipeline.push({
                $match: { 'brand.0': { $exists: true } } // Ensure only projects with matching brand are returned
            });
        } else {
            pipeline.push({
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand',
                    pipeline: [{ $project: { brand_name: 1 } }]
                }
            });
        }

        pipeline.push(
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lead_id',
                    foreignField: '_id',
                    as: 'lead',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'profileimages',
                                localField: 'profileImage',
                                foreignField: '_id',
                                as: 'profileImage',
                                pipeline: [{ $project: { image_url: 1 } }]
                            }
                        },
                        { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
                        { $project: { user_id: '$_id', first_name: 1, last_name: 1, profileImage: 1 } }
                    ]
                }
            },
            { $unwind: { path: '$lead', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'member_id',
                    foreignField: '_id',
                    as: 'members',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'profileimages',
                                localField: 'profileImage',
                                foreignField: '_id',
                                as: 'profileImage',
                                pipeline: [{ $project: { image_url: 1 } }]
                            }
                        },
                        { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
                        { $project: { user_id: '$_id', first_name: 1, last_name: 1, profileImage: 1 } }
                    ]
                }
            }
        );

        if (end_date) {
            pipeline.push({ $match: { end_date: { $lte: new Date(end_date) } } });
        }

        pipeline.push({
            $project: {
                _id: 0,
                project_id: '$_id',
                project_name: 1,
                priority: 1,
                createdAt: 1,
                updatedAt: 1,
                creator_designation: 1,
                creator_name: 1,
                employee_name: 1,
                status: 1,
                end_date: 1,
                brand: 1,
                lead: 1,
                members: 1
            }
        });

        const projects = await Projects.aggregate(pipeline);
        res.status(200).json({ message: 'Projects fetched successfully', projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});







//projectRoutes.js(routes)

//*---------project scearch by brand name ------------------*/
router.get('/projects-by-brand', authenticateToken, async (req, res) => {
    const { brand_name } = req.query;

    try {
        if (!brand_name) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        const projects = await Projects.aggregate([
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand'
                }
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
            { $match: { 'brand.brand_name': { $regex: new RegExp(brand_name, 'i') } } },
            {
                $project: {
                    _id: 0, // Exclude the default _id
                    project_id: '$_id', // Rename _id to project_id
                    project_name: 1,
                    brand: {
                        brand_id: '$brand._id',
                        brand_name: '$brand.brand_name',
                        createdAt: '$brand.createdAt',
                        updatedAt: '$brand.updatedAt'
                    },
                    brand_id: '$brand._id'
                }
            }
        ]);

        if (projects.length === 0) {
            return res.status(404).json({ message: 'No projects found for the specified brand' });
        }
        res.status(200).json({
            message: 'Projects fetched successfully',
            projects,
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



//projectRoutes.js(routes)
//fetchspecifictask
router.get('/fetchspecifictask/:taskId', authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Tasks.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(taskId) } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'project'
                }
            },
            { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'project.brand'
                }
            },
            { $unwind: { path: '$project.brand', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'task_user_id',
                    foreignField: '_id',
                    as: 'assignee'
                }
            },
            { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'subtasks',
                    localField: '_id',
                    foreignField: 'task_id',
                    as: 'subtasks'
                }
            },
            {
                $addFields: {
                    subtasks: { $ifNull: ["$subtasks", []] }
                }
            },
            {
                $lookup: {
                    from: 'projectuserroles',
                    localField: 'subtasks.project_role_id',
                    foreignField: '_id',
                    as: 'projectRole'
                }
            },
            {
                $addFields: {
                    'subtasks.projectRole': { $arrayElemAt: ["$projectRole", 0] }
                }
            },
            {
                $addFields: {
                    task_id: "$_id",
                    project_id: "$project._id",
                    subtasks: {
                        $map: {
                            input: "$subtasks",
                            as: "subtask",
                            in: {
                                $mergeObjects: [
                                    "$$subtask",
                                    { subtask_id: "$$subtask._id" }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    task_id: 1,
                    task_name: 1,
                    task_startdate: 1,
                    task_deadline: 1,
                    task_user_id: 1,
                    project_id: 1,
                    updatedAt:1,
                    status:1,
                    priority:1,
                    task_description:1,
                    'project.project_name': 1,
                    'project.project_id': "$project._id",
                    'project.brand.brand_name': 1,
                    'assignee.first_name': 1,
                    'assignee.last_name': 1,
                    'assignee.email': 1,
                    'assignee.profileImage.image_url': 1,
                    subtasks: {
                        subtask_id: 1,
                        subtask_name: 1,
                        sub_task_description: 1,
                        status: 1,
                        priority: 1,
                        sub_task_startdate: 1,
                        sub_task_deadline: 1,
                        missed_deadline: 1,
                        project_role_id: 1,
                        projectRole: {
                            _id: 1,
                            project_role_name: 1
                        }
                    }
                }
            }
        ]);

        if (!task || task.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const taskData = task[0];
        taskData.subtasks = taskData.subtasks.map(subtask => {
            if (subtask.projectRole && subtask.project_role_id === subtask.projectRole._id.toString()) {
                return {
                    ...subtask,
                    projectRole: subtask.projectRole
                };
            } else {
                return subtask;
            }
        });

        res.status(200).json(taskData);
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});







//monthlyReportRoutes.js(routes)
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











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
const UserTaskLimits = require('../Models/UserTaskLimits');
const moment = require('moment');
const { authenticateToken } = require('../middleware/authMiddleware');



const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;


// Helper function to calculate total time in days
function calculateTotalTime(start_date, end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Include both start and end dates as whole days
    const timeDifference = Math.abs(endDate - startDate) + 1 * 24 * 60 * 60 * 1000; // Adding one day in milliseconds
    const totalDays = Math.ceil(timeDifference / (24 * 60 * 60 * 1000)); // Convert milliseconds to days

    return totalDays;
}


//fetch all users --------------------------/
router.get('/fetch-all-users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({
            user_type: { $in: ['Department_Head', 'Employee', 'Social_Media_Manager', 'Task_manager'] }
        }, 'user_id first_name last_name email user_type');
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  




// router.get('/fetch-all-task-users', authenticateToken, async (req, res) => {
//     try {
//         const { user_id, start_date } = req.query;
//         if (!start_date) {
//             return res.status(400).json({ message: "start_date is required." });
//         }
//         const dayStart = new Date(start_date);
//         dayStart.setHours(0, 0, 0, 0);
//         const dayEnd = new Date(start_date);
//         dayEnd.setHours(23, 59, 59, 999);
//         const userCondition = {
//             user_type: { $in: ['Department_Head', 'Employee', 'Social_Media_Manager', 'Task_manager'] }
//         };

//         if (user_id) {
//             userCondition._id = new ObjectId(user_id);
//         }

//         const users = await User.aggregate([
//             { $match: userCondition },
//             { 
//                 $lookup: {
//                     from: 'usertasklimits',
//                     localField: '_id',
//                     foreignField: 'user_id',
//                     as: 'taskLimit'
//                 }
//             },
//             { 
//                 $lookup: {
//                     from: 'profileimages',
//                     localField: '_id',
//                     foreignField: 'user_id',
//                     as: 'profileImage'
//                 }
//             },
//             { 
//                 $project: {
//                     user_id: 1,
//                     first_name: 1,
//                     last_name: 1,
//                     email: 1,
//                     user_type: 1,
//                     taskLimit: { $arrayElemAt: ['$taskLimit.max_tasks_per_day', 0] },
//                     profileImage: { $arrayElemAt: ['$profileImage.image_url', 0] }
//                 }
//             }
//         ]);
//         // Fetch tasks for the specified date and group 
//         const tasksToday = await Tasks.aggregate([
//             { 
//                 $match: {
//                     status: { $in: ['Todo', 'InProgress', 'InChanges'] }, // Include Todo, InProgress, and InChanges
//                     task_startdate: { $gte: dayStart, $lte: dayEnd }
//                 }
//             },
//             { 
//                 $group: {
//                     _id: '$task_user_id', // Group by user
//                     taskCount: { $sum: 1 } // Count the number of tasks
//                 }
//             }
//         ]);

//         // Map task counts by user_id for easy access
//         const taskCountMap = {};
//         tasksToday.forEach(task => {
//             taskCountMap[task._id.toString()] = task.taskCount;
//         });

//         // Build the response by merging user data with task counts and limits
//         const response = users.map(user => {


//             const userId = user._id.toString();
//             const taskLimit = user.taskLimit || 0;
//             const taskCount = taskCountMap[userId] || 0;
//             const remainingTasks = taskLimit - taskCount;

//             return {
//                 user_id: userId,
//                 first_name: user.first_name,
//                 last_name: user.last_name,
//                 email: user.email,
//                 user_type: user.user_type,
//                 max_tasks_per_day: taskLimit,
//                 tasks_today: taskCount,
//                 remaining_tasks: remainingTasks > 0 ? remainingTasks : 0, // Ensure non-negative value
//                 limit_exceeded: taskCount >= taskLimit,
//                 profile_image: user.profileImage || null // Include profile image URL
//             };
//         });


//         console.log("log the data response",response)
//         res.status(200).json(response);
//     } catch (error) {
//         console.error('Error fetching all users with task details:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });






// Add Project API

router.get('/fetch-all-task-users', authenticateToken, async (req, res) => {
    try {
        const { user_id, start_date } = req.query;

        if (!start_date) {
            return res.status(400).json({ message: "start_date is required." });
        }

        const dayStart = new Date(start_date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(start_date);
        dayEnd.setHours(23, 59, 59, 999);

        const userCondition = {
            user_type: { $in: ['Department_Head', 'Employee', 'Social_Media_Manager', 'Task_manager'] }
        };

        if (user_id) {
            userCondition._id = new mongoose.Types.ObjectId(user_id); 
        }
        const users = await User.aggregate([
            { $match: userCondition },
            {
                $lookup: {
                    from: 'usertasklimits',
                    localField: '_id', // Reference User _id
                    foreignField: 'user_id', // Match with user_id in UserTaskLimits
                    as: 'taskLimit',
                },
            },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: '_id', // Reference User _id
                    foreignField: 'user_id', // Match with user_id in ProfileImages
                    as: 'profileImage',
                },
            },
            { $unwind: { path: '$taskLimit', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    user_id: 1,
                    first_name: 1,
                    last_name: 1,
                    email: 1,
                    user_type: 1,
                    taskLimit: { max_tasks_per_day: 1 },
                    profileImage: { image_url: 1 },
                },
            },
        ]);

        console.log("log the data is now", users)

        const tasksToday = await Tasks.aggregate([
            { $match: { 
                status: { $in: ['Todo', 'InProgress', 'InChanges'] },
                task_startdate: { $gte: dayStart, $lte: dayEnd }
            }},
            {
                $group: {
                    _id: '$task_user_id',
                    taskCount: { $sum: 1 },
                },
            },
        ]);

        console.log("tasksToday ", tasksToday);
        
        const taskCountMap = {};
        tasksToday.forEach(task => {
            taskCountMap[task._id] = task.taskCount;
        });

        const response = users.map(user => {
            const userId = user._id;
            // Default task limit to 5 if no task limit is found
            const taskLimit = user.taskLimit?.max_tasks_per_day || 5;
            const taskCount = taskCountMap[userId] || 0;
            const remainingTasks = taskLimit - taskCount;

            return {
                user_id: userId,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                user_type: user.user_type,
                max_tasks_per_day: taskLimit,
                tasks_today: taskCount,
                remaining_tasks: remainingTasks > 0 ? remainingTasks : 0,
                limit_exceeded: taskCount >= taskLimit,
                profile_image: user.profileImage?.image_url || null,
            };
        });

        console.log("response++++", response);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching all users with task details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});







router.post('/add-project', authenticateToken, async (req, res) => {
    const {
        project_name,
        brand_id,
        start_date,
        end_date,
        description,
        priority,
        lead_id,
        project_files,
        member_id,
    } = req.body;

    try {
        // Calculate total time (Implement this function if necessary)
        const total_time = calculateTotalTime(start_date, end_date);
  

        // Create a new project
        const newProject = new Projects({
            project_name,
            brand_id,
            start_date,
            end_date,
            total_time,
            description,
            priority,
            lead_id,
            project_files,
            member_id,
        });

        // Save the project (without session)
        await newProject.save();
        const brand = await Brand.findById(brand_id);
        if (brand) {
            await brand.save();
        }
        res.status(201).json({
            message: 'Project created successfully',
            project: newProject,
        });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Edit Project API
router.put('/edit-project/:project_id', authenticateToken, async (req, res) => {
    const { project_id } = req.params; // Get project ID from URL parameters
    const {
        project_name,
        brand_id,
        start_date,
        end_date,
        description,
        priority,
        lead_id,
        project_files, // Single file URL
        member_id,      // Array of member user IDs
    } = req.body;

    try {
        // Find the project by ID
        const project = await Projects.findById(project_id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Dynamically update only the fields that are provided
        const updates = {};
        if (project_name !== undefined) updates.project_name = project_name;
        if (brand_id !== undefined) updates.brand_id = brand_id;
        if (start_date !== undefined) updates.start_date = start_date;
        if (end_date !== undefined) updates.end_date = end_date;
        if (description !== undefined) updates.description = description;
        if (priority !== undefined) updates.priority = priority;
        if (lead_id !== undefined) updates.lead_id = lead_id;
        if (project_files !== undefined) updates.project_files = project_files;
        if (member_id !== undefined) updates.member_id = member_id;

        // Update total time if dates are provided
        if (start_date && end_date) {
            updates.total_time = calculateTotalTime(start_date, end_date);
        }

        // Update the project with the dynamically built `updates` object
        await project.updateOne(updates);

        // Optionally, update the brand document if needed
        if (brand_id) {
            const brand = await Brand.findById(brand_id);
            if (brand) {
                // Perform any necessary updates to the brand here (e.g., adding the project to the brand)
                await brand.save();
            }
        }

        res.status(200).json({
            message: 'Project updated successfully',
            project,
        });
    } catch (error) {
        console.error('Error editing project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Fetch All Projects API with Pagination and Filters
router.get('/all-projects', authenticateToken, async (req, res) => {
    const { page = 1, limit = 10, brand_name, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    try {
        const filterConditions = {};
        // Filter by end_date range
        if (start_date && end_date) {
            filterConditions.end_date = { $gte: new Date(start_date), $lte: new Date(end_date) };
        } else if (end_date) {
            filterConditions.end_date = { $lte: new Date(end_date) };
        }
        // Filter by brand_name (case-insensitive match)
        if (brand_name) {
            filterConditions['brand.brand_name'] = { $regex: brand_name, $options: 'i' };
        }
        // Fetch projects with filters and pagination
        const projects = await Projects.aggregate([
            { $match: filterConditions },
            {
                $lookup: {
                    from: 'brands', // Assuming 'brands' collection name
                    localField: 'brand_id', // Assuming Projects have a 'brand_id' field
                    foreignField: '_id', // Assuming Brands have an '_id' field
                    as: 'brand',
                },
            },
            {
                $unwind: { path: '$brand', preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: 'users', // Assuming 'users' collection name
                    localField: 'lead_id', // Assuming Projects have a 'lead_id' field
                    foreignField: '_id', // Assuming Users have an '_id' field
                    as: 'lead',
                },
            },
            {
                $unwind: { path: '$lead', preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: 'profileimages', // Assuming 'profileimages' collection name
                    localField: 'lead.profile_image_id', // Assuming Users have a 'profile_image_id' field
                    foreignField: '_id',
                    as: 'lead.profileImage',
                },
            },
            {
                $project: {
                    'lead.profileImage': { $arrayElemAt: ['$lead.profileImage', 0] },
                    brand_name: '$brand.brand_name',
                    brand_id: '$brand._id',
                    lead: {
                        user_id: '$lead._id',
                        first_name: '$lead.first_name',
                        last_name: '$lead.last_name',
                        profile_image: '$lead.profileImage.image_url',
                    },
                    project_id: 1,
                    end_date: 1,
                    member_id: 1,
                },
            },
            { $skip: offset },
            { $limit: parseInt(limit, 10) },
        ]);

        // Fetch member details for each project
        const memberIds = projects.reduce((acc, project) => {
            if (Array.isArray(project.member_id)) {
                return acc.concat(project.member_id);
            }
            return acc;
        }, []);

        const uniqueMemberIds = [...new Set(memberIds)]; 

        const members = await User.find({ '_id': { $in: uniqueMemberIds } })
            .select('user_id first_name last_name')
            .populate('profileImage', 'image_url');

        // Enrich the project data with member details
        const enrichedProjects = projects.map((project) => {
            const membersForProject = members.filter((member) =>
                project.member_id.includes(member._id.toString())
            );
            return { ...project, members: membersForProject };
        });

        // Total count for pagination
        const total = await Projects.countDocuments(filterConditions);
        res.status(200).json({
            message: 'Projects fetched successfully',
            projects: enrichedProjects,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


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





//*-----------------------------------------------Api to fetch specific project by id --------------------------------------*//

// Fetch Project by ID API
router.get('/projects/:project_id', authenticateToken, async (req, res) => {
    const { project_id } = req.params;

    try {
        // Use aggregation to fetch the project details and populate related data
        const project = await Projects.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(project_id) } },  // Match project by ID
            {
                $lookup: {
                    from: 'brands',  // Join with 'brands' collection
                    localField: 'brand_id',  // Field in Project referring to brand
                    foreignField: '_id',  // Field in Brand to match
                    as: 'brand',  // Alias for the populated brand
                },
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } }, // Unwind the brand array

            {
                $lookup: {
                    from: 'users',  // Join with 'users' collection for the lead
                    localField: 'lead_id',  // Field in Project referring to lead
                    foreignField: '_id',  // Field in User to match
                    as: 'lead',  // Alias for the populated lead
                },
            },
            { $unwind: { path: '$lead', preserveNullAndEmptyArrays: true } }, // Unwind the lead array

            {
                $lookup: {
                    from: 'profileimages',  // Join with 'profileimages' collection
                    localField: 'lead.profile_image_id',  // Field in User referring to profile image
                    foreignField: '_id',  // Field in ProfileImage to match
                    as: 'lead.profileImage',
                },
            },
            { $unwind: { path: '$lead.profileImage', preserveNullAndEmptyArrays: true } },  // Unwind the profile image array

            {
                $lookup: {
                    from: 'users',  // Join with 'users' collection for project members
                    localField: 'member_id',  // Field in Project referring to member
                    foreignField: '_id',  // Field in User to match
                    as: 'members',  // Alias for the populated members
                },
            },
            {
                $project: {
                    _id: 1,  // Include project ID
                    project_name: 1,  // Include project name
                    description: 1,  // Include description
                    status: 1,  // Include status
                    priority: 1,  // Include priority
                    start_date: 1,  // Include start date
                    end_date: 1,  // Include end date
                    brand: { brand_name: 1 },  // Include brand name
                    lead: { user_id: 1, first_name: 1, last_name: 1, profile_image: '$lead.profileImage.image_url' },  // Include lead info
                    members: { user_id: 1, first_name: 1, last_name: 1, profile_image: { $arrayElemAt: ['$members.profileImage.image_url', 0] } },  // Include members info and profile image
                },
            },
        ]);

        // If no project was found, return 404
        if (!project || project.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Return the enriched project data
        res.status(200).json({
            message: 'Project fetched successfully',
            project: project[0],  // Since we used aggregation, it's wrapped in an array
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});






//*---------project scearch by brand name ------------------*/
router.get('/projects-by-brand', authenticateToken, async (req, res) => {
    const { brand_name } = req.query;


    try {
        if (!brand_name) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        // Use aggregation to find projects associated with the given brand_name
        const projects = await Projects.aggregate([
            {
                $lookup: {
                    from: 'brands',          // The collection to join with
                    localField: 'brand_id',   // Field in Projects collection to join on
                    foreignField: '_id',      // Field in Brands collection to join on
                    as: 'brand'              // The name of the field to store the joined data
                }
            },
            {
                $unwind: { 
                    path: '$brand',            
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $match: {
                    'brand.brand_name': { $regex: new RegExp(brand_name, 'i') } 
                }
            },
            {
                $project: {
                    _id: 1,
                    project_name: 1,
                    brand: 1  
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





/*--------------------------------------------UserRole APIs--------------------------------------------*/

// Add or Edit ProjectUserRole
router.post('/project-user-role', authenticateToken, async (req, res) => {
    const { id, project_role_name, description } = req.body;

    try {
        if (id) {
            // Find the role to update
            const role = await ProjectUserRole.findById(id);
            if (!role) {
                return res.status(404).json({ error: 'Role not found' });
            }

            // Update the role details
            role.project_role_name = project_role_name || role.project_role_name;
            role.description = description || role.description;

            // Save the updated role
            await role.save();

            return res.status(200).json({ message: 'Role updated successfully', role });
        } else {
            // Create a new role if no ID is provided
            const newRole = new ProjectUserRole({ project_role_name, description });
            await newRole.save();

            return res.status(201).json({ message: 'Role created successfully', newRole });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error adding or updating project user role' });
    }
});




// View all ProjectUserRoles
router.get('/viewproject-user-role', authenticateToken, async (req, res) => {
    try {
        // Fetch all project user roles from MongoDB
        const rollog = await ProjectUserRole.find();  // Using Mongoose's find() method
        const roles = rollog.map(role => ({
            project_role_id: role._id,  // Rename _id to project_role_id
            project_role_name: role.project_role_name,
            __v: role.__v
        }));
        res.status(200).json(roles);  // Send the roles as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving project user roles' });
    }
});


//*-----------------------------------------------Branch APIs--------------------------------------------*/

// Add or Edit Branch
// CREATE or UPDATE: Add a new Brand if it doesn't exist, or update if it does
router.post('/AddeditBrands', authenticateToken, async (req, res) => {
    const { brand_id, brand_name } = req.body;
    try {
        if (brand_id) {
            // Update the existing brand if `brand_id` is provided
            const updatedBrand = await Brand.findByIdAndUpdate(
                brand_id,
                { brand_name },
                { new: true, runValidators: true }
            );

            if (updatedBrand) {
                return res.status(200).json(updatedBrand); // Return updated brand
            } else {
                return res.status(404).json({ error: 'Brand not found or not updated' });
            }
        } else {
            // Create a new brand if `brand_id` is not provided
            const brand = new Brand({ brand_name });
            await brand.save();

            return res.status(201).json(brand); // Return newly created brand
        }
    } catch (error) {
        res.status(500).json({ error: 'Error adding or updating brand', details: error.message });
    }
});



// READ: Get all Brands
router.get('/fetchallbrands', authenticateToken, async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands); 
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve brands', details: error.message });
    }
});




//*--------------task Routes---------------------*//
router.post('/add-tasks', authenticateToken, async (req, res) => {
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: "Tasks must be a non-empty array." });
    }
    const addedTasks = [];
    try {
        for (const task of tasks) {
            const {
                user_id,
                project_id,
                brand_id,
                task_name,
                task_description,
                task_startdate,
                task_deadline,
                task_type,
                priority
            } = task;

            const startDate = new Date(task_startdate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(task_startdate);
            endDate.setHours(23, 59, 59, 999);

            let userTaskLimit = await UserTaskLimits.findOne({ user_id: user_id });
            if (!userTaskLimit) {
                userTaskLimit = new UserTaskLimits({
                    user_id,
                    max_tasks_per_day: 5
                });
                await userTaskLimit.save();
            }
            const taskLimit = userTaskLimit.max_tasks_per_day;

            const taskCount = await Tasks.countDocuments({
                task_user_id: user_id,
                status: { $in: ['Todo', 'InProgress', 'InChanges'] },
                task_startdate: { $gte: startDate, $lte: endDate },
            });

            if (taskCount >= taskLimit) {
                continue;
            }

            const newTask = new Tasks({
                project_id,
                brand_id,
                task_user_id: user_id,
                task_name,
                task_description,
                task_startdate,
                task_deadline,
                task_type,
                priority,
                status: 'Todo',
            });
            await newTask.save();

            const usersToNotify = await User.find({
                user_type: { $in: ['Founder', 'Admin', 'SuperAdmin', 'HumanResource', 'Department_Head', 'Task_manager'] },
                _id: { $ne: user_id },
            });

            const userIds = new Set(usersToNotify.map(user => user._id));
            userIds.add(user_id);

            for (const id of userIds) {
                const maxPosition = await UserTaskPositions.findOne({
                    user_id: id,
                    column: 'Todo',
                }).sort({ position: -1 });

                const position = (maxPosition?.position || 0) + 1;

                const newTaskPosition = new UserTaskPositions({
                    user_id: id,
                    task_id: newTask._id,
                    column: 'Todo',
                    position,
                });

                await newTaskPosition.save();
            }

            addedTasks.push(newTask);
        }

        res.status(201).json({
            message: 'Tasks added successfully.',
            tasks: addedTasks,
        });
    } catch (error) {
        console.error('Error adding tasks:', error);
        res.status(500).json({ error: 'Error adding tasks', details: error.message });
    }
});







//*Usdate Task Status API --------------------------------------------------*//

// Update Task Status Route with Transaction Support
router.put('/update-task-status', authenticateToken, async (req, res) => {
    const { task_id, new_column, new_position, user_id } = req.body;

    if (!task_id || !new_column || new_position === undefined || !user_id) {
        return res.status(400).json({ error: 'Missing required fields: task_id, new_column, new_position, user_id' });
    }

    try {
        // Step 1: Fetch the task
        const task = await Tasks.findById(task_id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Prevent moving tasks back to Todo or updating completed tasks
        if ((task.status !== 'Todo' && new_column === 'Todo') || task.status === 'Completed') {
            return res.status(400).json({
                error: `Invalid status update: ${task.status}`,
            });
        }

        // Prevent moving from InReview to InProgress
        if (task.status === 'InReview' && new_column === 'InProgress') {
            return res.status(400).json({
                error: 'Invalid status update: Tasks cannot move from InReview to InProgress.',
            });
        }

        // Save the initial status for logging
        const initialStatus = task.status;

        // Update the task's status
        task.status = new_column;
        await task.save();

        // Step 2: Update positions for the current user
        const currentPosition = await UserTaskPositions.findOne({ task_id, user_id });

        // Reorder tasks in the current column for the current user
        if (currentPosition && currentPosition.column !== new_column) {
            await UserTaskPositions.updateMany(
                { column: currentPosition.column, position: { $gt: currentPosition.position }, user_id },
                { $inc: { position: -1 } }
            );
        }

        // Reorder tasks in the new column for the current user
        await UserTaskPositions.updateMany(
            { column: new_column, user_id, position: { $gte: new_position } },
            { $inc: { position: 1 } }
        );

        // Update the current user's position and column
        if (currentPosition) {
            currentPosition.column = new_column;
            currentPosition.position = new_position;
            await currentPosition.save();
        } else {
            const newTaskPosition = new UserTaskPositions({
                task_id,
                user_id,
                column: new_column,
                position: new_position,
            });
            await newTaskPosition.save();
        }

        // Step 3: Update positions for other users sharing the task
        const otherUsers = await UserTaskPositions.find({
            task_id,
            user_id: { $ne: user_id },
        });

        for (const otherUser of otherUsers) {
            const maxPosition = await UserTaskPositions.findOne({
                column: new_column,
                user_id: otherUser.user_id,
            }).sort({ position: -1 });

            const position = (maxPosition ? maxPosition.position : 0) + 1;

            await UserTaskPositions.updateOne(
                { task_id, user_id: otherUser.user_id },
                { $set: { column: new_column, position } }
            );
        }

        // Step 4: Log the status change in TaskStatusLogger
        const user = await User.findById(user_id);
        const username = user ? `${user.first_name} ${user.last_name}` : 'Unknown';

        const newStatusLog = new TaskStatusLogger({
            task_id,
            task_user_id: user_id,
            username,
            status_initial: initialStatus,
            status_final: new_column,
            missed_deadline: task.due_date && new Date() > task.due_date,
            time_stamp: new Date(),
        });

        await newStatusLog.save();

        res.status(200).json({
            message: 'Task status and positions updated successfully.',
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update task status and positions',
            details: error.message,
        });
    }
});




//* ---------------------task deadline change -----------------------*//
router.put('/update-task-deadline', authenticateToken, async (req, res) => {
    const { task_id, new_deadline } = req.body;

    if (!task_id || !new_deadline) {
        return res.status(400).json({ error: 'Missing required fields: task_id, new_deadline' });
    }

    try {
        // Step 1: Find the task by ID
        const task = await Tasks.findById(task_id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Step 2: Update the task deadline
        task.task_deadline = new_deadline;

        // Save the updated task
        await task.save();

        res.status(200).json({
            message: 'Task deadline updated successfully',
            task: {
                task_id: task_id,
                new_deadline: new_deadline
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update task deadline',
            details: error.message
        });
    }
});


//fetch  all data





//get the all routes
router.get('/tasks/kanban', authenticateToken, async (req, res) => {
    try {
        const { user_id, brand_id, task_type, start_date, end_date } = req.query;

        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Build dynamic filter for MongoDB
        const filter = { user_id };
        if (brand_id) {
            filter['task.project.brand_id'] = brand_id;
        }
        if (task_type) {
            filter['task.task_type'] = task_type;
        }
        if (start_date || end_date) {
        filter['task.task_startdate'] = filter['task.task_startdate'] || {};
        if (start_date) {
            filter['task.task_startdate'].$gte = new Date(`${start_date}T00:00:00`);
        }
        if (end_date) {
            filter['task.task_startdate'].$lte = new Date(`${end_date}T23:59:59`);
        }
        }
        
        // Fetch tasks with aggregation pipeline
        const userTasks = await UserTaskPositions.aggregate([
            { 
                $match: { 
                    user_id: new mongoose.Types.ObjectId(filter.user_id)
                } 
            },
            {
              $lookup: {
                from: 'tasks',
                localField: 'task_id',
                foreignField: '_id',
                as: 'task',
              },
            },
            { $unwind: '$task' },
        
            {
              $match: {
                'task.task_startdate': {
                  '$gte': new Date(filter['task.task_startdate'].$gte),
                  '$lte': new Date(filter['task.task_startdate'].$lte)
                }
              }
            },
            // The rest of your lookup stages
            {
              $lookup: {
                from: 'projects',
                localField: 'task.project_id',
                foreignField: '_id',
                as: 'task.project',
              },
            },
            { $unwind: { path: '$task.project', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'brands',
                localField: 'task.project.brand_id',
                foreignField: '_id',
                as: 'task.project.brand',
              },
            },
            { $unwind: { path: '$task.project.brand', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'users',
                localField: 'task.assignee_id',
                foreignField: '_id',
                as: 'task.assignee',
              },
            },
            { $unwind: { path: '$task.assignee', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'profileimages',
                localField: 'task.assignee.profile_image_id',
                foreignField: '_id',
                as: 'task.assignee.profileImage',
              },
            },
            { $unwind: { path: '$task.assignee.profileImage', preserveNullAndEmptyArrays: true } },
            
            {
              $project: {
                task_id: '$task._id',
                task_name: '$task.task_name',
                status: '$task.status',
                priority: '$task.priority',
                priority_flag: '$task.priority_flag',
                missed_deadline: '$task.missed_deadline',
                task_description: '$task.task_description',
                position: 1,
                task_deadline: '$task.task_deadline',
                assignee_name: {
                  $concat: [
                    { $ifNull: ['$task.assignee.first_name', 'N/A'] },
                    ' ',
                    { $ifNull: ['$task.assignee.last_name', ''] },
                  ],
                },
                assignee_email: '$task.assignee.email',
                profile_image: '$task.assignee.profileImage.image_url',
                project_name: '$task.project.project_name',
                brand_name: '$task.project.brand.brand_name',
                column: 1,
              },
            },
            
            { $sort: { column: 1, 'task.priority_flag': -1, position: 1 } },
        ]);
        
        if (!userTasks || userTasks.length === 0) {
            return res.status(200).json({
                message: "No tasks found for the user's Kanban board",
                data: {
                    Todo: [],
                    InProgress: [],
                    InReview: [],
                    InChanges: [],
                    Completed: [],
                },
            });
        }

        // Structure tasks into Kanban board format
        const kanbanBoard = {
            Todo: [],
            InProgress: [],
            InReview: [],
            InChanges: [],
            Completed: [],
        };

        userTasks.forEach((task) => {
            const taskData = {
                task_id: task.task_id,
                task_name: task.task_name || 'N/A',
                status: task.status || 'N/A',
                priority: task.priority || 'N/A',
                priority_flag: task.priority_flag || 'No-Priority',
                missed_deadline: task.missed_deadline || false,
                task_description: task.task_description || 'N/A',
                position: task.position,
                end_date: task.task_deadline || 'N/A',
                assignee_name: task.assignee_name.trim(),
                assignee_email: task.assignee_email || 'N/A',
                profile_image: task.profile_image || null,
                project_name: task.project_name || 'N/A',
                brand_name: task.brand_name || 'N/A',
            };

            if (kanbanBoard[task.column]) {
                kanbanBoard[task.column].push(taskData);
            }
        });

        Object.keys(kanbanBoard).forEach((column) => {
            kanbanBoard[column].sort((a, b) => {
                const priorityOrder = b.priority_flag.localeCompare(a.priority_flag);
                return priorityOrder !== 0 ? priorityOrder : a.position - b.position;
            });
        });
        res.status(200).json({
            message: "Tasks fetched successfully for the user's Kanban board",
            data: kanbanBoard,
        });
    } catch (error) {
        console.error('Error fetching tasks for Kanban board:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});







router.put('/update-task-deadline', authenticateToken, async (req, res) => {
    const { task_id, new_deadline } = req.body;

    if (!task_id || !new_deadline) {
        return res.status(400).json({ error: 'Missing required fields: task_id, new_deadline' });
    }

    const session = await mongoose.startSession(); // Start a session for the transaction
    session.startTransaction(); // Begin the transaction

    try {
        // Find the task by ID
        const task = await Task.findOne({ _id: task_id }).session(session);
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update the task deadline
        task.task_deadline = new_deadline;
        await task.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession(); // End the session

        res.status(200).json({
            message: 'Task deadline updated successfully',
            task: {
                task_id: task_id,
                new_deadline: new_deadline
            }
        });
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession(); // End the session

        res.status(500).json({
            error: 'Failed to update task deadline',
            details: error.message
        });
    } finally {
        // Ensure transaction is closed
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession(); // End the session
    }
});

// *-----------------------Fetch Specific Task by ID -----------------------*/




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
                    localField: 'project.brand_id',
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












//Fetch Edit Task
router.get('/fetchtaskforedit/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await Tasks.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'No task found for the given task ID' });
        }
        // Modify the response to replace _id with task_id
        const taskData = {
            ...task.toObject(),
            task_id: task._id,
        };
        delete taskData._id;
        res.status(200).json(taskData);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


//Fetch the subtask Edit
router.get('/fetchsubtaskforedit/:subtask_id', async(req, res) =>{
    const { subtask_id } = req.params;
    console.log("log the fetchsubtaskforedit", subtask_id)
    try {
        const subtask = await Subtask.findById(subtask_id);
        if (!subtask || subtask.length === 0) {
            return res.status(404).json({ message: 'No subtask found' });
        }
        res.status(200).json(subtask);
    } catch (error) {
        console.error('Error fetching subtask:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})



//subtasks
router.put('/subtasks/:subtask_id/status', authenticateToken, async (req, res) => {
    const { subtask_id } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }
    try {
        const subtask = await Subtask.findById(subtask_id);
        if (!subtask) {
            return res.status(404).json({ message: 'Subtask not found' });
        }
        subtask.status = status;
        await subtask.save();
        res.status(200).json({ message: 'Subtask status updated successfully', subtask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update subtask status', error: error.message });
    }
});




//*------------Duplicate Task API------------------*//
router.post('/duplicate-task', authenticateToken, async (req, res) => {
    const {
        task_id,         
        task_startdate,  
        task_deadline,  
        task_user_id    
    } = req.body;
    try {
        // Step 1: Fetch the original task by ID
        const originalTask = await Tasks.findById(task_id);
        if (!originalTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // Step 2: Create a duplicate of the task with user-provided details
        const duplicatedTask = new Tasks({
            project_id: originalTask.project_id,
            brand_id: originalTask.brand_id,
            task_user_id, 
            task_name: `${originalTask.task_name} (Copy)`,
            task_description: originalTask.task_description,
            task_startdate, 
            task_deadline,  
            task_type: originalTask.task_type,
            priority: originalTask.priority,
            status: 'Todo' 
        });
        await duplicatedTask.save(); 
        // Step 3: Fetch all users who should have access to the task
        const users = await User.find({
            user_type: { $in: ['Founder', 'Admin', 'SuperAdmin', 'HumanResource', 'Department_Head', 'Task_manager'] }
        });
        // Convert user list to a set to avoid duplicates
        const userIds = new Set(users.map(user => user._id));
        // Ensure the task_user_id is included in the list
        userIds.add(task_user_id);
        // Step 4: Add task positions for each user
        for (const id of userIds) {
            // Fetch all existing positions in the 'Todo' column for the current user
            const existingPositions = await UserTaskPositions.find({
                user_id: id,
                column: 'Todo'
            }).sort({ position: 1 });
            let position = 1; // Start with position 1
            if (existingPositions.length > 0) {
                // Find the first gap in the sequence of positions
                const positionSet = new Set(existingPositions.map(pos => pos.position));
                while (positionSet.has(position)) {
                    position++;
                }
            }
            // Create a new task position for the user
            const userTaskPosition = new UserTaskPositions({
                user_id: id,
                task_id: duplicatedTask._id,
                column: 'Todo', // Default column is 'Todo'
                position
            });
            await userTaskPosition.save(); 
        }
        res.status(201).json({
            message: 'Task duplicated successfully.',
            task: duplicatedTask
        });
    } catch (error) {
        res.status(500).json({ error: 'Error duplicating task', details: error.message });
    }
});


//*--------------------Edit Task -----------*//
// PUT /api/tasks/:task_id
router.put('/edit-task/:task_id', authenticateToken, async (req, res) => {
    const { task_id } = req.params;
    const {
        task_name,
        task_description,
        task_startdate,
        task_deadline,
        task_user_id,
        missed_deadline,
        status,
        priority,
        is_active,
        on_hold,
        task_type,
        priority_flag
    } = req.body;

    try {
        // Find the task by ID
        const task = await Tasks.findById(task_id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update the task with the provided data
        task.task_name = task_name || task.task_name;
        task.task_description = task_description || task.task_description;
        task.task_startdate = task_startdate || task.task_startdate;
        task.task_deadline = task_deadline || task.task_deadline;
        task.task_user_id = task_user_id || task.task_user_id;
        task.missed_deadline = missed_deadline !== undefined ? missed_deadline : task.missed_deadline;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.is_active = is_active !== undefined ? is_active : task.is_active;
        task.on_hold = on_hold !== undefined ? on_hold : task.on_hold;
        task.task_type = task_type || task.task_type;
        task.priority_flag = priority_flag || task.priority_flag;

        // Save the updated task
        await task.save();

        res.status(200).json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
});


//*--------Subtask Add Edit Delete Api ----------------*//
// POST /api/subtasks
router.post('/subtask_add', authenticateToken, async (req, res) => {
    const {
        subtask_name,
        task_id,
        project_id,
        brand_id,
        project_role_id,
        sub_task_description,
        sub_task_startdate,
        sub_task_deadline,
        sub_task_user_id,
        missed_deadline,
        status,
        priority,
        is_active,
        on_hold,
        priority_flag
    } = req.body;
    try {
        // Create a new subtask
        const newSubtask = new Subtask({
            subtask_name,
            task_id,
            project_id,
            brand_id,
            project_role_id,
            sub_task_description,
            sub_task_startdate,
            sub_task_deadline,
            sub_task_user_id,
            missed_deadline,
            status,
            priority,
            is_active,
            on_hold,
            priority_flag
        });
        // Save the new subtask to the database
        await newSubtask.save();
        res.status(201).json({
            message: 'Subtask created successfully',
            subtask: newSubtask
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to create subtask',
            error: error.message
        });
    }
});




//*---------------------Subtask Status Change-------------------*//
// PUT /api/subtasks/:subtask_id/status
router.put('/subtask_edit/:subtask_id',authenticateToken, async (req, res) => {
    const { subtask_id } = req.params;
    const {
        subtask_name,
        sub_task_description,
        sub_task_startdate,
        sub_task_deadline,
        sub_task_user_id,
        missed_deadline,
        status,
        priority,
        is_active,
        on_hold,
        priority_flag
    } = req.body;
    try {
        // Find and update the subtask by ID
        const updatedSubtask = await Subtask.findByIdAndUpdate(
            subtask_id,
            {
                subtask_name,
                sub_task_description,
                sub_task_startdate,
                sub_task_deadline,
                sub_task_user_id,
                missed_deadline,
                status,
                priority,
                is_active,
                on_hold,
                priority_flag
            },
            { new: true } 
        );
        // If the subtask is not found
        if (!updatedSubtask) {
            return res.status(404).json({ message: 'Subtask not found' });
        }
        res.status(200).json({ message: 'Subtask updated successfully', subtask: updatedSubtask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update subtask', error: error.message });
    }
});




//*----------------task log Status------------*//
router.get('/task-logs/:task_id', authenticateToken, async (req, res) => {
    const { task_id } = req.params;
    if (!task_id) {
        return res.status(400).json({ error: 'Task ID is required.' });
    }
    try {
        // Aggregate task logs with user and profile image information
        const taskLogs = await TaskStatusLogger.aggregate([
            { 
                $match: { task_id:new mongoose.Types.ObjectId(task_id) } // Match the task_id
            },
            { 
                $sort: { time_stamp: -1 } 
            },
            {
                $lookup: {
                    from: 'users', // Assuming users collection is called 'users'
                    localField: 'task_user_id', // Reference field in TaskStatusLogger
                    foreignField: '_id', // Reference field in User collection
                    as: 'user' // Output field to store user data
                }
            },
            { 
                $unwind: { path: '$user', preserveNullAndEmptyArrays: true } 
            },
            {
                $lookup: {
                    from: 'profileimages', // Assuming profile images collection is 'profileimages'
                    localField: 'user.profileImage', // Reference field in User
                    foreignField: '_id', // Reference field in ProfileImage collection
                    as: 'user.profileImage' // Output field to store profile image
                }
            },
            { 
                $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } 
            },
            {
                $project: {
                    time_stamp: 1,
                    status_initial: 1,
                    status_final: 1,
                    task_user_id: 1,
                    user:1,
                    profile_image_url: '$profileImage.image_url', 
                    missed_deadline: 1
                }
            }
        ]);

        // console.log("log the data tasklogs", taskLogs)
        res.status(200).json({
            message: 'Task logs retrieved successfully.',
            task_id,
            logs: taskLogs || [],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to fetch task logs.',
            details: error.message,
        });
    }
});




//fetch all task specific to a project ---------*//
// Fetch tasks by project_id, include user and
router.get('/fetch-project-all-tasks',authenticateToken, async (req, res) => {
    try {
        const { project_id } = req.query;

        // Validate project_id
        if (!project_id) {
            return res.status(400).json({ message: 'Project ID is required.' });
        }

        const tasksAggregation = await Tasks.aggregate([
            {
                $match: {
                    project_id:new mongoose.Types.ObjectId(project_id), // Ensure project_id is treated as ObjectId
                }
            },
            {
                $lookup: {
                    from: 'users', // Collection name for the User model
                    localField: 'task_user_id', // Field in Tasks referencing User
                    foreignField: '_id', // Field in User model
                    as: 'assignee' // Output array for the user data
                }
            },
            {
                $unwind: {
                    path: '$assignee',
                    preserveNullAndEmptyArrays: true // Keep tasks even if no user is assigned
                }
            },
            {
                $lookup: {
                    from: 'images', // Assuming profile images are in a separate collection
                    localField: 'assignee.profileImage', // Field in User referencing profileImage
                    foreignField: '_id', // Field in Images collection
                    as: 'assignee.profileImageData'
                }
            },
            {
                $unwind: {
                    path: '$assignee.profileImageData',
                    preserveNullAndEmptyArrays: true // Keep tasks even if no profileImage is found
                }
            },
            {
                $group: {
                    _id: '$status', // Group tasks by their status
                    tasks: { $push: '$$ROOT' }, // Include all task data in the group
                    count: { $sum: 1 } 
                }
            },
            {
                $sort: { _id: 1 } 
            }
        ]);

        res.status(200).json({
            message: 'Tasks fetched successfully',
            tasksAggregation
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
});



// Fetch tasks for the current week with priority flag "Priority"
router.get('/tasks/weekly-priority', authenticateToken, async (req, res) => {
    try {
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();

        const tasks = await Tasks.aggregate([
            {
                $match: {
                    task_startdate: { $gte: startOfWeek, $lte: endOfWeek },
                    priority_flag: 'Priority',
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'project.brand_id',
                    foreignField: '_id',
                    as: 'project.brand',
                },
            },
            { $unwind: { path: '$project.brand', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'project.lead_id',
                    foreignField: '_id',
                    as: 'project.lead',
                },
            },
            { $unwind: { path: '$project.lead', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'project.lead.profileImage',
                    foreignField: '_id',
                    as: 'project.lead.profileImage',
                },
            },
            { $unwind: { path: '$project.lead.profileImage', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'task_user_id',
                    foreignField: '_id',
                    as: 'assignee',
                },
            },
            { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'assignee.profileImage',
                    foreignField: '_id',
                    as: 'assignee.profileImage',
                },
            },
            { $unwind: { path: '$assignee.profileImage', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    task_name: 1,
                    task_description: 1,
                    task_startdate: 1,
                    task_deadline: 1,
                    priority_flag: 1,
                    status: 1,
                    missed_deadline:1,
                    'project.project_id': 1,
                    'project.project_name': 1,
                    'project.lead_id': 1,
                    'project.brand.brand_id': 1,
                    'project.brand.brand_name': 1,
                    'project.lead.user_id': 1,
                    'project.lead.first_name': 1,
                    'project.lead.last_name': 1,
                    'project.lead.profileImage.image_url': 1,
                    'assignee.user_id': 1,
                    'assignee.first_name': 1,
                    'assignee.last_name': 1,
                    'assignee.profileImage.image_url': 1,
                },
            },
        ]);
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        console.error('Error fetching weekly priority tasks:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching tasks.' });
    }
});



//Get categorized tasks for a specific user
router.get('/tasks/categorized/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;
    try {
        // Define start and end of the week
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();

        // Define start and end of today
        const today = moment().startOf('day').toDate();
        const endOfToday = moment().endOf('day').toDate();

        // Fetch tasks for the user and categorize them
        const tasks = await Tasks.aggregate([
            {
                $match: {
                    task_user_id: new mongoose.Types.ObjectId(user_id),
                    is_active: true,
                },
            },
            {
                $lookup: {
                    from: 'projects', // MongoDB collection name for Projects
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            {
                $unwind: {
                    path: '$project',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'brands', // MongoDB collection name for Brands
                    localField: 'project.brand_id',
                    foreignField: '_id',
                    as: 'project.brand',
                },
            },
            {
                $unwind: {
                    path: '$project.brand',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'users', // MongoDB collection name for Users
                    localField: 'task_user_id',
                    foreignField: '_id',
                    as: 'assignee',
                },
            },
            {
                $unwind: {
                    path: '$assignee',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'profileimages', // MongoDB collection name for ProfileImages
                    localField: 'assignee.profileImage',
                    foreignField: '_id',
                    as: 'assignee.profileImage',
                },
            },
            {
                $unwind: {
                    path: '$assignee.profileImage',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'users', // MongoDB collection name for Users (for the lead)
                    localField: 'project.lead_id',
                    foreignField: '_id',
                    as: 'project.lead',
                },
            },
            {
                $unwind: {
                    path: '$project.lead',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'profileimages', // MongoDB collection name for ProfileImages
                    localField: 'project.lead.profileImage',
                    foreignField: '_id',
                    as: 'project.lead.profileImage',
                },
            },
            {
                $unwind: {
                    path: '$project.lead.profileImage',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    task_startdate: 1,
                    task_name: 1,
                    status: 1, 
                    priority_flag: 1,
                    task_deadline: 1,
                    missed_deadline: 1,
                    task_user_id: 1,
                    'project.project_name': 1,
                    'project.brand.brand_name': 1,
                    'assignee.first_name': 1,
                    'assignee.last_name': 1,
                    'assignee.profileImage.image_url': 1,
                    'project.lead.first_name': 1,
                    'project.lead.last_name': 1,
                    'project.lead.profileImage.image_url': 1,
                },
            },
        ]);
        
        // Categorize tasks
        const categorizedTasks = {
            today_tasks: tasks.filter(
                (task) =>
                    moment(task.task_startdate).isBetween(today, endOfToday, null, '[]') &&
                    task.task_status === 'Todo'
            ),
            pending_tasks: tasks.filter(
                (task) =>
                    moment(task.task_startdate).isBetween(startOfWeek, endOfWeek, null, '[]') &&
                    ['InProgress', 'InReview', 'InChanges'].includes(task.status)
            ),
            urgent_tasks: tasks.filter(
                (task) =>
                    task.priority_flag === 'Priority' &&
                    moment(task.task_startdate).isBetween(startOfWeek, endOfWeek, null, '[]')
            ),
            missed_deadlines: tasks.filter(
                (task) =>
                    task.missed_deadline === true &&
                    moment(task.task_startdate).isBetween(startOfWeek, endOfWeek, null, '[]')
            ),
        };

        console.log("log the data ok , categorizedTasks", categorizedTasks)
        res.status(200).json({ success: true, data: categorizedTasks });
    } catch (error) {
        console.error('Error fetching categorized tasks:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching tasks.' });
    }
});










//dashboard task summary --------------/
// Fetch task summary for the current month
router.get('/brand-task-summary', authenticateToken, async (req, res) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const tasks = await Tasks.aggregate([
            {
                $match: {
                    task_startdate: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand_id',
                    foreignField: '_id',
                    as: 'brand',
                },
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    status: 1,
                    brand_id: 1,
                    missed_deadline: 1,
                    'brand.brand_name': 1,
                },
            },
        ]);

        const allStatuses = ['Todo', 'InProgress', 'InReview', 'InChanges', 'Completed'];
        const summary = {};

        tasks.forEach((task) => {
            const brandName = task.brand.brand_name;
            const status = task.status;
            const missedDeadline = task.missed_deadline;

            if (!summary[brandName]) {
                summary[brandName] = {
                    totalTasks: 0,
                    missedDeadlines: 0,
                };
                allStatuses.forEach((status) => {
                    summary[brandName][status] = 0;
                });
            }

            summary[brandName][status]++;
            summary[brandName].totalTasks++;
            if (missedDeadline) {
                summary[brandName].missedDeadlines++;
            }
        });

        for (const brandName in summary) {
            allStatuses.forEach((status) => {
                if (!summary[brandName][status]) {
                    summary[brandName][status] = 0;
                }
            });
        }
        res.json({ summary });
    } catch (error) {
        console.error('Error fetching task summary:', error);
        res.status(500).json({ error: 'An error occurred while fetching task summary.' });
    }
});



//Get user-task-summary
router.get('/user-task-summary', authenticateToken, async (req, res) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const tasks = await Tasks.aggregate([
            {
                $match: {
                    task_startdate: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'task_user_id',
                    foreignField: '_id',
                    as: 'assignee',
                },
            },
            { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'assignee.profileImage',
                    foreignField: '_id',
                    as: 'assignee.profileImage',
                },
            },
            { $unwind: { path: '$assignee.profileImage', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    status: 1,
                    task_user_id: 1,
                    missed_deadline: 1,
                    'assignee.first_name': 1,
                    'assignee.last_name': 1,
                    'assignee.profileImage.image_url': 1,
                },
            },
        ]);

        const allStatuses = ['Todo', 'InProgress', 'InReview', 'InChanges', 'Completed'];
        const summary = {};

        tasks.forEach((task) => {
            const user = task.assignee;
            if (!user) return;

            const userName = `${user.first_name} ${user.last_name}`;
            const profileImage = user.profileImage ? user.profileImage.image_url : null;
            const status = task.status;
            const missedDeadline = task.missed_deadline;

            if (!summary[userName]) {
                summary[userName] = {
                    onTimeTasks: 0,
                    missedDeadlines: 0,
                    profileImage,
                };
                allStatuses.forEach((status) => {
                    summary[userName][status] = 0;
                });
            }

            summary[userName][status]++;
            if (!missedDeadline) {
                summary[userName].onTimeTasks++;
            } else {
                summary[userName].missedDeadlines++;
            }
        });

        for (const userName in summary) {
            allStatuses.forEach((status) => {
                if (!summary[userName][status]) {
                    summary[userName][status] = 0;
                }
            });
        }
        res.json({ summary });
    } catch (error) {
        console.error('Error fetching task summary:', error);
        res.status(500).json({ error: 'An error occurred while fetching task summary.' });
    }
});



//Get specific-user-task-summary
router.get('/specific-user-task-summary', authenticateToken, async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const aggregationPipeline = [
            {
                $match: {
                    task_user_id:new mongoose.Types.ObjectId(user_id),
                    task_startdate: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $lookup: {
                    from: 'users', // Assuming assignee collection is 'users'
                    localField: 'assignee',
                    foreignField: '_id',
                    as: 'assigneeDetails',
                },
            },
            {
                $unwind: {
                    path: '$assigneeDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'profileImages', // Assuming profile images collection is 'profileImages'
                    localField: 'assigneeDetails.profileImage',
                    foreignField: '_id',
                    as: 'profileImageDetails',
                },
            },
            {
                $unwind: {
                    path: '$profileImageDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: null,
                    userName: { $first: { $concat: ['$assigneeDetails.first_name', ' ', '$assigneeDetails.last_name'] } },
                    profileImage: { $first: '$profileImageDetails.image_url' },
                    onTimeTasks: {
                        $sum: { $cond: [{ $eq: ['$missed_deadline', false] }, 1, 0] },
                    },
                    missedDeadlines: {
                        $sum: { $cond: [{ $eq: ['$missed_deadline', true] }, 1, 0] },
                    },
                    taskCounts: {
                        $push: '$status',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    userName: 1,
                    profileImage: 1,
                    onTimeTasks: 1,
                    missedDeadlines: 1,
                    taskCounts: 1,
                },
            },
        ];

        const aggregationResult = await Tasks.aggregate(aggregationPipeline);

        if (aggregationResult.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this user in the specified period.' });
        }

        // Prepare the final summary structure
        const summary = aggregationResult[0];

        // Prepare task status counts
        const allStatuses = ['Todo', 'InProgress', 'InReview', 'InChanges', 'Completed'];
        allStatuses.forEach((status) => {
            summary[status] = summary.taskCounts.filter((taskStatus) => taskStatus === status).length;
        });

        // Remove taskCounts from final summary
        delete summary.taskCounts;
        res.json({ summary });
    } catch (error) {
        console.error('Error fetching task summary:', error);
        res.status(500).json({ error: 'An error occurred while fetching task summary.' });
    }
});




module.exports = router;

const express = require('express');
const User = require('../Models/User'); 
const Role = require('../Models/Role');
const UserDetails = require('../Models/UserDetails'); 
const JoiningDate = require('../Models/JoiningDate');
const UserTime = require('../Models/Usertime'); 
const ProfileImage = require('../Models/ProfileImage');
const Overtime = require('../Models/Overtime');
const Attendance = require('../Models/Attendance');
const moment = require('moment');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();
const LeaveBalance = require('../Models/LeaveBalance');
const Tasks = require('../Models/Tasks');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

router.get('/Employee-report-attendance', authenticateToken, async (req, res) => {
    const { userId, month, year } = req.query;
    if (!userId || !month || !year) {
        return res.status(400).json({ message: 'userId, month, and year are required' });
    }
    try {
        // Parse month and year, and calculate the correct start and end dates
        const startDate = moment(`${year}-${month}-01`).startOf('month').toDate();  // Convert to Date object
        const endDate = moment(startDate).endOf('month').toDate();  // Convert to Date object
        const isCurrentMonth = moment().isSame(moment(startDate), 'month');

        console.log("log the data", startDate, endDate, isCurrentMonth);

        // Fetch user details including profile image, role, attendances, and overtime
        const userDetails = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            // Lookup profile image
            {
                $lookup: {
                    from: 'profileimages',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'profileImage',
                },
            },
            { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
            // Lookup role
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role_id',
                    foreignField: '_id',
                    as: 'role',
                },
            },
            { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
            // Lookup user joining date
            {
                $lookup: {
                    from: 'joiningdates',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'joiningDates',
                },
            },
            { $unwind: { path: '$joiningDates', preserveNullAndEmptyArrays: true } },
            // Lookup user times
            {
                $lookup: {
                    from: 'usertimes',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'userTimes',
                },
            },
            // Lookup attendance records
            {
                $lookup: {
                    from: 'attendances',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'attendances',
                    pipeline: [
                        { $match: { date: { $gte: startDate, $lte: endDate } } },
                    ],
                },
            },
            // Lookup overtime records
            {
                $lookup: {
                    from: 'overtimes',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'overtimes',
                    pipeline: [
                        { $match: { overtime_date: { $gte: startDate, $lte: endDate }, status: 'Approved' } },
                    ],
                },
            },
        ]);
        if (!userDetails.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userDetails[0]; // Since we expect only one user, take the first result
        const { attendances, userTimes, overtimes, joiningDates } = user;
        const startTime = userTimes?.[0]?.start_time || '09:00:00'; // Default to 09:00 if no start time

        // Calculate statistics
        const totalDaysInMonth = moment(startDate).daysInMonth();
        const weekdays = [...Array(totalDaysInMonth).keys()].map((i) =>
            moment(startDate).add(i, 'days')
        );
        const workingDays = weekdays.filter(
            (date) => ![0, 6].includes(date.day()) // Exclude weekends (Sunday: 0, Saturday: 6)
        );

        const totalPresentDays = attendances.length;
        const totalAbsentDays =
            isCurrentMonth
                ? workingDays.filter((date) => date.isBefore(moment()) && !attendances.some((att) => att.date === date.format('YYYY-MM-DD'))).length
                : workingDays.length - totalPresentDays;

        const lateDays = attendances.filter(
            (attendance) => moment(attendance.start_time, 'HH:mm:ss').isAfter(moment(startTime, 'HH:mm:ss')) // Ensure correct time comparison
        ).map((attendance) => attendance.date);

        const totalLateCount = lateDays.length;

        // Calculate total overtime in hours
        const totalOvertimeMinutes = overtimes?.reduce((sum, overtime) => sum + overtime.total_time, 0) || 0;
        const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(2); // Convert minutes to hours
        res.status(200).json({
            userDetails: {
                ...user,
                joining_date: joiningDates?.joining_date, 
            },
            totalDaysInMonth,
            totalPresentDays,
            totalAbsentDays,
            totalLateCount,
            lateDays, // Include late days in the response
            totalOvertimeHours, // Include total overtime in hours
        });

    } catch (error) {
        console.error(`Error fetching user details: ${error.message}`);
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
});







router.get('/fetch-user-leave-balances/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params; // Get user_id from params
    const { month, year } = req.query; // Get month and year from query params

    // Check if month and year are provided
    if (!month || !year) {
        return res.status(400).json({
            success: false,
            message: "Month and year query parameters are required.",
        });
    }

    try {
        // Convert user_id to ObjectId using `new ObjectId()` for proper instantiation
        const userObjectId = new ObjectId(user_id);

        // Aggregation pipeline to fetch leave balances and join with leaveType
        const leaveBalances = await LeaveBalance.aggregate([
            {
                $match: { user_id: userObjectId },  // Match the user_id as ObjectId
            },
            {
                $lookup: {
                    from: 'leavetypes',  // The name of the collection you're joining with
                    localField: 'leave_type_id',  // The field in LeaveBalance that holds the reference
                    foreignField: '_id',  // The field in LeaveType that you're matching against
                    as: 'leaveTypeDetails',  // Alias for the populated field
                },
            },
            {
                $unwind: {
                    path: '$leaveTypeDetails',  // Unwind the array to get a single object for leaveType
                    preserveNullAndEmptyArrays: true,  // Preserve LeaveBalance documents with no leaveType
                },
            },
            {
                $project: {
                    LeaveType: { $ifNull: ['$leaveTypeDetails.name', 'Unknown'] },  // Get leave type name or 'Unknown'
                    Total: { $ifNull: ['$total_days', 0] },  // Total leave balance
                    Earned: { $ifNull: ['$earned_days', 0] },  // Earned leave (if applicable)
                },
            },
        ]);

        if (!leaveBalances || leaveBalances.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No leave balances found for the specified user.',
            });
        }

        // Send the leave balances response
        res.status(200).json({
            success: true,
            data: leaveBalances,
        });
    } catch (error) {
        console.error('Error fetching leave balance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave balances.',
            error: error.message,
        });
    }
});





// Month name mapping
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

router.get('/fetch-task-stats/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;
    const { month, year } = req.query;
    if (!month || !year) {
        return res.status(400).json({
            success: false,
            message: "Month and year query parameters are required.",
        });
    }
    try {
        // Start and end dates for the selected month and year
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        // Fetch task count by status for the given month, year, and user
        const taskCountsByStatus = await Tasks.aggregate([
            {
                $match: {
                    task_user_id: user_id,
                    task_startdate: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: '$status',
                    statusCount: { $sum: 1 }, // Count tasks by status
                },
            },
        ]);
        // Fetch missed and on-time task counts for the given month
        const missedAndOnTimeCounts = await Tasks.aggregate([
            {
                $match: {
                    task_user_id: user_id,
                    task_startdate: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: null,
                    missedCount: {
                        $sum: { $cond: [{ $eq: ['$missed_deadline', true] }, 1, 0] },
                    },
                    onTimeCount: {
                        $sum: { $cond: [{ $eq: ['$missed_deadline', false] }, 1, 0] },
                    },
                },
            },
        ]);

        // Fetch tasks with project and brand details that missed their deadlines using $lookup
        const missedDeadlineTasks = await Tasks.aggregate([
            {
                $match: {
                    task_user_id: user_id,
                    task_startdate: { $gte: startDate, $lte: endDate },
                    missed_deadline: true,
                },
            },
            // Lookup the project information
            {
                $lookup: {
                    from: 'projects', // The name of the collection you're joining with (make sure this is the correct name)
                    localField: 'project', // The field in Tasks that references the project
                    foreignField: '_id', // The _id field in the Project collection
                    as: 'project_details',
                },
            },
            {
                $unwind: '$project_details', // Unwind the project details to get the actual data
            },
            // Lookup the brand information
            {
                $lookup: {
                    from: 'brands', // The name of the collection you're joining with (make sure this is the correct name)
                    localField: 'project_details.brand', // The field in project_details that references the brand
                    foreignField: '_id', // The _id field in the Brand collection
                    as: 'brand_details',
                },
            },
            {
                $unwind: '$brand_details', // Unwind the brand details to get the actual data
            },
        ]);

        // Fetch all tasks of the year for the given user, grouped by month
        const tasksByMonth = await Tasks.aggregate([
            {
                $match: {
                    task_user_id: user_id,
                    task_startdate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) },
                },
            },
            {
                $group: {
                    _id: { $month: '$task_startdate' },
                    totalTasks: { $sum: 1 },
                    successfulTasks: {
                        $sum: {
                            $cond: [{ $eq: ['$missed_deadline', false] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        // Calculate yearly totals for conversion rate
        const yearlyTotals = tasksByMonth.reduce(
            (acc, monthData) => {
                acc.totalTasks += monthData.totalTasks;
                acc.successfulTasks += monthData.successfulTasks;
                return acc;
            },
            { totalTasks: 0, successfulTasks: 0 }
        );

        // Yearly conversion rate
        const yearlyConversionRate = yearlyTotals.totalTasks > 0
            ? ((yearlyTotals.successfulTasks / yearlyTotals.totalTasks) * 100).toFixed(2)
            : '0.00';

        // Map month numbers to names and calculate monthly conversion rates
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const conversionRates = tasksByMonth.map((monthData) => {
            const monthIndex = monthData._id - 1; // MongoDB months are 1-based, but JS months are 0-based
            if (monthIndex < 0 || monthIndex > 11) {
                throw new Error(`Invalid month index ${monthIndex}`);
            }

            const monthName = monthNames[monthIndex];
            return {
                month: monthName,
                totalTasks: monthData.totalTasks,
                successfulTasks: monthData.successfulTasks,
                conversionRate: monthData.totalTasks > 0
                    ? ((monthData.successfulTasks / monthData.totalTasks) * 100).toFixed(2)
                    : '0.00',
            };
        });

        res.status(200).json({
            success: true,
            data: {
                taskCountsByStatus,           // Includes counts grouped by task status
                missedAndOnTimeCounts: missedAndOnTimeCounts[0], // Missed and on-time counts
                yearlyConversionRate,         // Yearly conversion rate
                monthlyConversionRates: conversionRates, // Monthly conversion rates
                missedDeadlineTasks,          // Tasks that missed their deadlines (with populated project and brand)
            },
        });
    } catch (error) {
        console.error('Error fetching task statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task statistics.',
            error: error.message,
        });
    }
});





// Fetch users for the report
router.get('/fetch-report-users', authenticateToken, async (req, res) => {
    const { search } = req.query;
    const userTypes = ['Department_Head', 'Employee', 'Social_Media_Manager', 'Task_manager'];
    try {
        // Build the filter for users
        let filter = {
            user_type: { $in: userTypes },
            Is_active: true,
        };


        console.log(search, filter);    
        if (search) {
            filter.$or = [
                { first_name: { $regex: search, $options: 'i' } }, 
                { last_name: { $regex: search, $options: 'i' } },
            ];
        }
        // Fetch users from MongoDB
        const users = await User.find(filter)
            .select('first_name last_name')  
            .lean();

        console.log(users);

        const formattedUsers = users.map(user => ({
            user_id: user._id,
            username: `${user.first_name} ${user.last_name}`,
        }));
        res.status(200).json({ success: true, data: formattedUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users.', error: error.message });
    }
});



// Task stats monthly
router.get('/task-stats/monthly/:userId', async (req, res) => {
    const { userId } = req.params;
    const currentYear = new Date().getFullYear();

    try {
        // Define start and end dates for the current year
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);

        // Helper function to map data into months
        const mapDataToMonths = (data) => {
            const monthData = Array(12).fill(0);
            data.forEach((entry) => {
                const monthIndex = entry._id.month - 1; // MongoDB month starts from 1
                monthData[monthIndex] = entry.total;
            });
            return monthData;
        };

        // Fetch all tasks for the user for the current year
        const allTasks = await Tasks.aggregate([
            {
                $match: {
                    task_user_id: userId,
                    createdAt: { $gte: startOfYear, $lte: endOfYear },
                },
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    total: { $sum: 1 },
                },
            },
        ]);

        // Fetch completed tasks for the user for the current year
        const completedTasks = await Tasks.aggregate([
            {
                $match: {
                    task_user_id: userId,
                    status: 'Completed',
                    createdAt: { $gte: startOfYear, $lte: endOfYear },
                },
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    completed: { $sum: 1 },
                },
            },
        ]);

        // Fetch missed deadline tasks for the user for the current year
        const missedDeadlineTasks = await Tasks.aggregate([
            {
                $match: {
                    task_user_id: userId,
                    missed_deadline: true,
                    createdAt: { $gte: startOfYear, $lte: endOfYear },
                },
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    missed_deadlines: { $sum: 1 },
                },
            },
        ]);

        // Map aggregated data into months
        const totalTasksByMonth = mapDataToMonths(allTasks);
        const completedTasksByMonth = mapDataToMonths(completedTasks);
        const missedDeadlineTasksByMonth = mapDataToMonths(missedDeadlineTasks);

        // Month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Build response
        const response = monthNames.map((month, index) => ({
            month,
            total_tasks: totalTasksByMonth[index],
            completed_tasks: completedTasksByMonth[index],
            missed_deadline_tasks: missedDeadlineTasksByMonth[index],
        }));

        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});



///employee dashboard attendance 
router.get('/dashboard-Employee-report-attendance', authenticateToken, async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = endDate.toISOString();

        const totalDaysInMonth = endDate.getDate();

        const aggregationPipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'profileImage',
                    foreignField: '_id',
                    as: 'profileImageDetails',
                },
            },
            { $unwind: { path: '$profileImageDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleDetails',
                },
            },
            { $unwind: { path: '$roleDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'usertimes',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'userTimes',
                },
            },
            { $unwind: { path: '$userTimes', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'joiningdates',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'joiningDates',
                },
            },
            { $unwind: { path: '$joiningDates', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'attendances',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'attendances',
                    pipeline: [
                        { $match: { date: { $gte: formattedStartDate, $lte: formattedEndDate } } },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'overtimes',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'overtimes',
                    pipeline: [
                        { $match: { ovetime_date: { $gte: startDate, $lte: endDate }, status: 'Approved' } },
                    ],
                },
            },
            {
                $project: {
                    profileImageUrl: { $arrayElemAt: ['$profileImageDetails.image_url', 0] },
                    roleName: { $arrayElemAt: ['$roleDetails.role_name', 0] },
                    attendances: 1,
                    userTimes: 1,
                    overtimes: 1,
                },
            },
            {
                $addFields: {
                    totalDaysInMonth: { $literal: new Date(year, month + 1, 0).getDate() },
                    weekdays: {
                        $map: {
                            input: { $range: [1, { $add: [{ $dayOfMonth: endDate }, 1] }] },  // 1 to last day
                            as: 'day',
                            in: { $dateFromParts: { year, month, day: '$$day' } },
                        },
                    },
                    workingDays: {
                        $filter: {
                            input: { $range: [1, { $add: [{ $dayOfMonth: endDate }, 1] }] },  // Same range for working days
                            as: 'day',
                            cond: {
                                $not: {
                                    $in: [{ $dayOfWeek: { $dateFromParts: { year, month, day: '$$day' } } }, [1, 7]], // Exclude weekends
                                },
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    totalPresentDays: { $size: '$attendances' },
                    totalAbsentDays: {
                        $size: {
                            $filter: {
                                input: '$workingDays',
                                as: 'day',
                                cond: {
                                    $not: {
                                        $in: [
                                            { $dateToString: { format: '%Y-%m-%d', date: { $dateFromParts: { year, month, day: '$$day' } } } },
                                            { $map: { input: '$attendances', as: 'attendance', in: { $dateToString: { format: '%Y-%m-%d', date: '$$attendance.date' } } } },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                    lateDays: {
                        $map: {
                            input: '$attendances',
                            as: 'attendance',
                            in: {
                                $cond: [
                                    { $gt: ['$attendances.start_time', { $ifNull: ['$userTimes.start_time', '09:00:00'] }] },
                                    '$$attendance.date',
                                    null,
                                ],
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    totalLateCount: { $size: '$lateDays' },
                    totalOvertimeMinutes: {
                        $sum: {
                            $map: {
                                input: '$overtimes.total_time',
                                as: 'overtime',
                                in: { $toDouble: { $ifNull: ['$$overtime', 0] } }
                            }
                        }
                    },
                    totalOvertimeHours: {
                        $divide: [
                            { $sum: {
                                $map: {
                                    input: '$overtimes.total_time',
                                    as: 'overtime',
                                    in: { $toDouble: { $ifNull: ['$$overtime', 0] } }
                                }
                            }},
                            60
                        ]
                    },
                },
            },
            {
                $project: {
                    totalOvertimeHours: { $round: ['$totalOvertimeHours', 2] },
                    totalDaysInMonth: 1,
                    totalPresentDays: 1,
                    totalAbsentDays: 1,
                    totalLateCount: 1,
                    lateDays: 1,
                },
            },
        ];
        const result = await User.aggregate(aggregationPipeline);
        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(result[0]);
    } catch (error) {
        console.error(`Error fetching user details: ${error.message}`);
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
});







module.exports = router; 
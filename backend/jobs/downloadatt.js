const cron = require('node-cron');
const { Op } = require('sequelize');
const { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format, addMonths, subDays } = require('date-fns');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveBalance = require('../models/LeaveBalance');
const Department = require('../models/Department');
const Verification = require('../models/Verification');

const createMonthlyReport = async (selectedMonth) => {
    try {
        // Calculate the date range for the selected month
        const startDate = startOfMonth(new Date(`${selectedMonth}-01`));
        const endDate = endOfMonth(new Date(`${selectedMonth}-01`));
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        // Ensure weekends spilling over into the next month are handled
        const nextMonthStartDate = startOfMonth(addMonths(startDate, 1));
        const nextMonthFirstWeekendDays = [nextMonthStartDate, subDays(nextMonthStartDate, 1)]
            .filter(day => isWeekend(day));

        console.log(`Date Range: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
        
        // Fetch all verified user_ids from the Verification table where status is true (or 1)
        const verifiedUsers = await Verification.findAll({
            where: {
                status: true
            },
            attributes: ['user_id']
        });

        const verifiedUserIds = verifiedUsers.map(user => user.user_id);

        // Fetch users who are in the verified list and have user_type 'HR' or 'Employee'
        const users = await User.findAll({
            where: {
                user_id: {
                    [Op.in]: verifiedUserIds
                },
                user_type: {
                    [Op.in]: ['HR', 'Employee']
                },
                is_active: true
            },
            include: [
                { model: LeaveBalance, as: 'leaveBalance' },
                { model: Department, as: 'departmentDetails' }
            ]
        });

        const attendanceReport = [];
        const leaveBalanceReport = [];

        for (const user of users) {
            const userId = user.user_id;
            const userName = user.name;
            const departmentName = user.departmentDetails.name;

            console.log(`\nProcessing user: ${userName} (ID: ${userId}) from Department: ${departmentName}`);

            // Fetch attendance records for the selected month
            const attendances = await Attendance.findAll({
                where: {
                    user_id: userId,
                    date: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                attributes: ['date']
            });

            // Extract attendance dates
            const attendanceDates = attendances.map(attendance => format(attendance.date, 'yyyy-MM-dd'));

            // Count the total number of days in the month
            const totalDaysInMonth = allDays.length;

            // Count the total number of present days
            const totalPresentDays = attendanceDates.length;

            // Calculate initial absent days count based on total days in the month
            let absentDaysCount = totalDaysInMonth - totalPresentDays;

            // Calculate the number of Fridays in the month
            const allFridays = allDays.filter(day => day.getDay() === 5);

            const fridaysWithAttendance = allFridays.filter(friday =>
                attendanceDates.includes(format(friday, 'yyyy-MM-dd'))
            );

            // Subtract the number of Saturdays and Sundays from the absent days count
            const totalWeekends = allDays.filter(day => isWeekend(day)).length;

            absentDaysCount -= totalWeekends;

            // Subtract weekends that spill over into the next month
            absentDaysCount -= nextMonthFirstWeekendDays.length;

            // Add 2 to the absent count for each Friday with no attendance
            const missedFridays = allFridays.length - fridaysWithAttendance.length;

            absentDaysCount += missedFridays * 2;

            // Prepare attendance report entry
            attendanceReport.push({
                name: userName,
                department: departmentName,
                attendanceCount: totalPresentDays,
                absentDaysCount: absentDaysCount
            });

            // Prepare leave balance report entry
            if (user.leaveBalance) {
                leaveBalanceReport.push({
                    name: userName,
                    department: departmentName,
                    sick_leave_balance: user.leaveBalance.sick_leave_balance,
                    casual_leave_balance: user.leaveBalance.casual_leave_balance,
                    bereavement_leave_balance: user.leaveBalance.bereavement_leave_balance,
                    unpaid_leave_balance: user.leaveBalance.unpaid_leave_balance
                });
            } else {
                leaveBalanceReport.push({
                    name: userName,
                    department: departmentName,
                    sick_leave_balance: 0,
                    casual_leave_balance: 0,
                    bereavement_leave_balance: 0,
                    unpaid_leave_balance: 0
                });
            }
        }

        return { attendanceReport, leaveBalanceReport };
    } catch (error) {
        console.error('Error generating monthly report:', error);
        throw new Error('Error generating monthly report');
    }
};

module.exports = {
    createMonthlyReport
};

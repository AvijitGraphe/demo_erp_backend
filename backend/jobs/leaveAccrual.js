const cron = require('node-cron');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../Models/User');
const LeaveRequest = require('../models/Dleav');
const { calculateAccruedLeaves } = require('../utils/calculateAccruedLeaves');
const LeaveAdjustment = require('../models/LeaveAdjustment');
const fs = require('fs');


// Function to calculate used leaves
const calculateUsedLeaves = async (userId, leaveType) => {
  try {
    const leaveRequests = await LeaveRequest.findAll({
      where: {
        user_id: userId,
        leave_name: leaveType,
        status: 'Approved'
      }
    });

    const totalUsedLeaves = leaveRequests.reduce((sum, request) => sum + request.total_days, 0);
    return totalUsedLeaves;
  } catch (error) {
    console.error(`Error calculating used leaves for user ${userId}:`, error);
    return 0;
  }
};

// Function to calculate adjustments
const calculateLeaveAdjustments = async (userId, leaveType) => {
  try {
    const adjustments = await LeaveAdjustment.findAll({
      where: {
        user_id: userId,
        leave_type: leaveType
      }
    });

    const totalAdjustments = adjustments.reduce((sum, adjustment) => sum + adjustment.adjustment_value, 0);
    return totalAdjustments;
  } catch (error) {
    console.error(`Error calculating leave adjustments for user ${userId}:`, error);
    return 0;
  }
};

// Function to update leave balances
const updateLeaveBalances = async () => {
  try {
    const users = await User.findAll();

    for (const user of users) {
      const leaveBalance = await LeaveBalance.findOne({ where: { user_id: user.user_id } });

      if (leaveBalance) {
        const sickLeaveAccrued = calculateAccruedLeaves(user.joining_date, 'Sick Leave');
        const casualLeaveAccrued = calculateAccruedLeaves(user.joining_date, 'Casual Leave');

        const sickLeaveUsed = await calculateUsedLeaves(user.user_id, 'Sick Leave');
        const casualLeaveUsed = await calculateUsedLeaves(user.user_id, 'Casual Leave');

        const sickLeaveAdjustments = await calculateLeaveAdjustments(user.user_id, 'Sick Leave');
        const casualLeaveAdjustments = await calculateLeaveAdjustments(user.user_id, 'Casual Leave');

        leaveBalance.sick_leave_balance = Math.max(0, sickLeaveAccrued - sickLeaveUsed - sickLeaveAdjustments);
        leaveBalance.casual_leave_balance = Math.max(0, casualLeaveAccrued - casualLeaveUsed - casualLeaveAdjustments);

        await leaveBalance.save();
      }
    }

    fs.appendFileSync('cron.log', `${new Date().toISOString()} - Leave balances updated successfully\n`);
  } catch (error) {
    console.error('Error updating leave balances:', error);
    fs.appendFileSync('cron.log', `${new Date().toISOString()} - Error updating leave balances: ${error}\n`);
  }
};

// Schedule the job to run every 8AM 
cron.schedule('0 8 * * *', () => {
  console.log('Cron job initiated');
  fs.appendFileSync('cron.log', `${new Date().toISOString()} - Cron job initiated\n`);
  updateLeaveBalances();
});

module.exports = updateLeaveBalances;

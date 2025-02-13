const cron = require('node-cron');
const mongoose = require('mongoose');
const LeaveBalance = require('../Models/LeaveBalance'); // Adjust path to your Mongoose models
const JoiningDate = require('../Models/JoiningDate');
const LeaveType = require('../Models/LeaveType');
const LeaveRequest = require('../Models/LeaveRequest');
const User = require('../Models/User');

const LeaveBalanceAdjuster = () => {
  // Define the cron job to run monthly
  cron.schedule('0 0 1 * *', async () => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch all leave balances for leave types with monthly accrual
      const leaveBalances = await LeaveBalance.find({
        'leaveType.accrual_type': 'MonthlyAquired',
      })
        .populate({
          path: 'leaveType',
          match: { accrual_type: 'MonthlyAquired' },
        })
        .populate({
          path: 'user',
          populate: {
            path: 'joiningDates',
          },
        })
        .session(session);

      const now = new Date();

      for (const leaveBalance of leaveBalances) {
        const { user, total_days, arrear_days } = leaveBalance;

        // Ensure JoiningDate is available for the user
        const joiningDate = user?.joiningDates?.[0]?.joining_date;
        if (!joiningDate) {
          console.warn(`No joining date found for user_id: ${user._id}`);
          continue;
        }

        // Calculate months of service
        const joiningDateObj = new Date(joiningDate);
        const monthsOfService =
          (now.getFullYear() - joiningDateObj.getFullYear()) * 12 +
          now.getMonth() -
          joiningDateObj.getMonth();

        if (monthsOfService < 0) {
          console.warn(`Joining date is in the future for user_id: ${user._id}`);
          continue;
        }

        // Calculate earned days
        const earnedDays = Math.floor(monthsOfService * (total_days / 12)) - arrear_days;

        // Fetch pending and approved leave requests for the user
        const leaveRequests = await LeaveRequest.find({
          user_id: user._id,
          Status: { $in: ['Pending', 'Approved'] },
        })
          .select('Total_days')
          .session(session);

        // Sum the total days for pending and approved leave requests
        const leaveDaysTaken = leaveRequests.reduce((sum, req) => sum + req.Total_days, 0);

        // Subtract leaveDaysTaken from earnedDays
        const adjustedEarnedDays = Math.max(0, earnedDays - leaveDaysTaken);

        // Update the leave balance record
        leaveBalance.earned_days = adjustedEarnedDays;
        await leaveBalance.save({ session });

        console.log(
          `Updated earned_days for user_id: ${user._id}, leave_balance_id: ${leaveBalance._id}, leave_days_taken: ${leaveDaysTaken}`
        );
      }

      // Commit the transaction after all updates
      await session.commitTransaction();
      console.log('Monthly leave accrual calculation completed successfully.');
    } catch (error) {
      // Rollback the transaction in case of an error
      await session.abortTransaction();
      console.error('Error during leave accrual calculation:', error);
    } finally {
      session.endSession();
    }
  });
};

module.exports = LeaveBalanceAdjuster;
const LeaveRequest = require('../models/Dleav');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { calculateAccruedLeaves } = require('../utils/calculateAccruedLeaves'); // Assuming this function is defined in utils

const approveLeaveRequest = async (leaveRequestId) => {
  const leaveRequest = await LeaveRequest.findByPk(leaveRequestId);
  if (!leaveRequest) throw new Error('Leave request not found');

  // Assuming leave balance checks and updates are already handled elsewhere

  leaveRequest.status = 'Approved';
  await leaveRequest.save();
};


const validateLeaveRequest = async (userId, leaveType, requestedDays) => {
  if (requestedDays < 0) {
    throw new Error('Invalid');
  }

  const leaveBalance = await LeaveBalance.findOne({ where: { user_id: userId } });
  if (!leaveBalance) throw new Error('Leave balance not found');

  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  switch (leaveType) {
    case 'Sick Leave':
      if (leaveBalance.sick_leave_balance < requestedDays) {
        throw new Error('Insufficient sick leave balance');
      }
      leaveBalance.sick_leave_balance -= requestedDays;
      break;
    case 'Casual Leave':
      if (leaveBalance.casual_leave_balance < requestedDays) {
        throw new Error('Insufficient casual leave balance');
      }
      leaveBalance.casual_leave_balance -= requestedDays;
      break;
    case 'Bereavement Leave':
      if (leaveBalance.bereavement_leave_balance < requestedDays) {
        throw new Error('Insufficient bereavement leave balance');
      }
      leaveBalance.bereavement_leave_balance -= requestedDays;
      break;
    case 'Unpaid Leave':
      if (leaveBalance.unpaid_leave_balance < requestedDays) {
        throw new Error('Insufficient unpaid leave balance');
      }
      leaveBalance.unpaid_leave_balance -= requestedDays;
      break;
    default:
      throw new Error('Invalid leave type');
  }

  await leaveBalance.save();
};

const rejectLeaveRequest = async (leaveRequestId) => {
  const leaveRequest = await LeaveRequest.findByPk(leaveRequestId);
  if (!leaveRequest) throw new Error('Leave request not found');

  const leaveBalance = await LeaveBalance.findOne({ where: { user_id: leaveRequest.user_id } });
  if (!leaveBalance) throw new Error('Leave balance not found');

  switch (leaveRequest.leave_name) {
    case 'Sick Leave':
      leaveBalance.sick_leave_balance += leaveRequest.total_days;
      break;
    case 'Casual Leave':
      leaveBalance.casual_leave_balance += leaveRequest.total_days;
      break;
    case 'Bereavement Leave':
      leaveBalance.bereavement_leave_balance += leaveRequest.total_days;
      break;
    case 'Unpaid Leave':
      leaveBalance.unpaid_leave_balance += leaveRequest.total_days;
      break;
    default:
      throw new Error('Invalid leave type');
  }

  await leaveBalance.save();
  leaveRequest.status = 'Rejected';
  await leaveRequest.save();
};


module.exports = { approveLeaveRequest, rejectLeaveRequest, validateLeaveRequest };

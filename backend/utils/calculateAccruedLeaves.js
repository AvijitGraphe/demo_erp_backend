const calculateAccruedLeaves = (joiningDate, leaveType) => {
  const currentDate = new Date();
  const joinDate = new Date(joiningDate);

  const monthsWorked = (currentDate.getFullYear() - joinDate.getFullYear()) * 12 + currentDate.getMonth() - joinDate.getMonth();

  switch (leaveType) {
    case 'Sick Leave':
      return monthsWorked * 0.66; // Adjusted accrual rate for Sick Leave
    case 'Casual Leave':
      return monthsWorked * 1; // Adjusted accrual rate for Casual Leave
    default:
      return 0;
  }
};

module.exports = { calculateAccruedLeaves };

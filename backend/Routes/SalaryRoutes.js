const express = require('express');
const router = express.Router();
const Salary = require('../Models/Salary'); // Assuming Salary model is defined in /models/Salary.js
const User = require('../Models/User');     // Assuming User model is defined in /models/User.js
const MonthlySalary = require('../Models/MonthlySalary');
const Attendance = require('../Models/Attendance');
const Overtime = require('../Models/Overtime');
const LeaveType = require('../Models/LeaveType');
const LeaveRequest = require('../Models/LeaveRequest');
const { authenticateToken } = require('../middleware/authMiddleware');

const mongoose = require('mongoose');

// Create or Update Salary API
router.post('/salary', authenticateToken, async (req, res) => {
  const {
    Salary_id,          // Primary key
    Salary_basis,       // Enum: 'Monthly', 'Weekly', 'Daily', 'Hourly'
    Salary_Amount,      // Decimal value for salary amount
    Payment_type,       // Enum: 'Bank_transfer', 'Check', 'Cash', 'Demand_draft'
    Ptax,               // Decimal value for professional tax
    user_id             // Foreign key for user
  } = req.body;

  try {
    // Ensure the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (Salary_id) {
      // Update existing salary record if Salary_id is provided
      const existingSalary = await Salary.findById(Salary_id);
      if (existingSalary) {
        // Update salary details
        existingSalary.Salary_basis = Salary_basis;
        existingSalary.Salary_Amount = Salary_Amount;
        existingSalary.Payment_type = Payment_type;
        existingSalary.Ptax = Ptax;
        existingSalary.user_id = user_id;

        await existingSalary.save();

        return res.status(200).json({
          message: 'Salary updated successfully',
          data: existingSalary,
        });
      } else {
        return res.status(404).json({ message: 'Salary record not found' });
      }
    } else {
      // Create a new salary record if Salary_id is not provided
      const newSalary = new Salary({
        Salary_basis,
        Salary_Amount,
        Payment_type,
        Ptax,
        user_id,
      });

      await newSalary.save();

      return res.status(201).json({
        message: 'Salary created successfully',
        data: newSalary,
      });
    }
  } catch (error) {
    console.error('Error in salary create/update:', error.message);
    return res.status(500).json({
      error: 'Failed to process salary request',
      details: error.message,
    });
  }
});




// Fetch Salary Details by User ID
router.get('/salary/:user_id', authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  try {
    // Check if the user exists
    const user = await User.findById(user_id);

    if (!user) {
      // If user does not exist, return an empty response
      return res.status(200).json({
        message: 'No user found',
        data: {},
      });
    }

    // Fetch salary data for the given user_id
    const salaryData = await Salary.findOne({
      user_id: user_id,
    });

    // Return the salary data or an empty object if no record exists
    return res.status(200).json({
      message: 'Salary data fetched successfully',
      data: salaryData || {}, // If no salary record, return an empty object
    });
  } catch (error) {
    console.error('Error fetching salary data:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch salary data',
      details: error.message,
    });
  }
});




// Helper function to calculate total days in a month
const getTotalDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};



//generate-salaries
router.post('/generate-salaries', async (req, res) => {
  try {
    const { month, year, total_working_days, pf_percentage, esi_percentage, tds_percentage } = req.body;
    
    if (!month || !year || !total_working_days) {
      return res.status(400).json({
        error: "Month, year, total working days, and percentages for PF, ESI, and TDS are required."
      });
    }
    
    // Check if the provided month and year are the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear();

    if (Number(month) === currentMonth && Number(year) === currentYear) {
      return res.status(400).json({
        error: 'Salary slip can only be generated after the month has been completed.',
      });
    }

    const allowedUserTypes = [
      'HumanResource',
      'Accounts',
      'Department_Head',
      'Employee',
      'Social_Media_Manager',
      'Task_manager',
    ];
    
    const users = await User.aggregate([
      // Step 1: Match users based on their user_type and active status
      {
        $match: {
          user_type: { $in: allowedUserTypes },
          Is_active: true,
        }
      },
    
      // Step 2: Lookup salary details for each user
      {
        $lookup: {
          from: 'salaries', // The collection to join with
          localField: '_id', // The field from the User collection (reference to Salary)
          foreignField: 'user_id', // The field from the Salary collection that references the User
          as: 'salaries', // Alias for the populated field
        }
      },
    
      // Step 3: Optionally, you can filter or project the result here
      {
        $project: {
          _id: 1,  // Include the user_id
          user_type: 1, // Include the user_type
          Is_active: 1, // Include the Is_active status
          salaries: { $arrayElemAt: ['$salaries', 0] } // Get the first salary record if multiple salaries exist
        }
      }
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No eligible users found.' });
    }
    const generatedSalaries = [];
    for (const user of users) {
      const salaryDetails = user.salaries && user.salaries[0];
      if (!salaryDetails || !salaryDetails.Salary_Amount) {
        console.warn(`Skipping user ${user._id}: Invalid or missing salary details.`);
        continue;
      }
    
      // Convert Decimal128 to regular number for calculations
      const salaryAmountNumber = parseFloat(salaryDetails.Salary_Amount.toString());
      const ptaxAmountNumber = parseFloat(salaryDetails.Ptax.toString());
      const perDaySalary = salaryAmountNumber / total_working_days;
    
      // Calculate present and absent days
      const attendanceRecords = await Attendance.find({
        user_id: user._id,
        date: {
          $gte: new Date(`${year}-${month}-01`),
          $lte: new Date(`${year}-${month}-31`),
        }
      });
    
      const presentFullDays = attendanceRecords.filter(
        (record) => record.Attendance_status === 'Full-Day'
      ).length;
    
      const presentHalfDays = attendanceRecords.filter(
        (record) => record.Attendance_status === 'Half-Day'
      ).length;
    
      const presentDays = presentFullDays + presentHalfDays * 0.5;
      const absentDays = total_working_days - presentDays;
    
      // Fetch overtime records
      const overtimeRecords = await Overtime.find({
        user_id: user._id,
        ovetime_date: {
          $gte: new Date(`${year}-${month}-01`),
          $lte: new Date(`${year}-${month}-31`),
        },
        status: 'Approved'
      });
    
      const totalOvertimeMinutes = overtimeRecords.reduce((sum, overtime) => sum + overtime.total_time, 0) || 0;
      const totalOvertimeDays = (totalOvertimeMinutes / 540).toFixed(2); // 9 hours = 540 minutes
      const overtimeAmount = totalOvertimeDays * perDaySalary;
    
      // Fetch leave records
      const leaveCountsCurrentMonth = await LeaveRequest.find({
        user_id: user._id,
        Status: 'Approved',
      }).populate({
        path: 'leaveType',
        select: 'name salary_deduction',
      });
    
      let totalLeaveDeductions = 0;
      let totalLeaveAdditions = 0;
      let paidLeaveCount = 0;
      let unpaidLeaveCount = 0;
    
      for (const leave of leaveCountsCurrentMonth) {
        const leaveTaken = parseInt(leave.leaveTaken, 10) || 0;
        const salaryDeduction = leave.leaveType.salary_deduction;
    
        if (salaryDeduction) {
          // Deduction for unpaid leave
          totalLeaveDeductions += leaveTaken * perDaySalary;
          unpaidLeaveCount += leaveTaken;
        } else {
          // Addition for paid leave
          totalLeaveAdditions += leaveTaken * perDaySalary;
          paidLeaveCount += leaveTaken;
        }
      }
    
      // Deduct other deductions
      const deductions = {
        Ptax: ptaxAmountNumber,
      };
    
      // Update pay in hand
      let payInHand =
        presentDays * perDaySalary +
        totalLeaveAdditions +
        overtimeAmount -
        totalLeaveDeductions;
    
      // Calculate deductions based on percentages
      const Pf = (pf_percentage / 100) * salaryAmountNumber;
      const Esi = (esi_percentage / 100) * salaryAmountNumber;
      const TDS = (tds_percentage / 100) * salaryAmountNumber;
      const Ptax = parseFloat(deductions.Ptax) || 0;
      const totalDeductions = Pf + Esi + TDS + Ptax;
    
      const final_deductions = totalDeductions + totalLeaveDeductions;
      payInHand -= totalDeductions;
    
      // Ensure pay in hand is not negative
      if (payInHand < 0) {
        payInHand = 0;
      }
    
      try {
        // Create salary record
        const salaryRecord = await MonthlySalary.create({
          user_id: user._id,
          no_of_days: presentDays,
          total_working_days: total_working_days,
          date: new Date(`${year}-${month}-01`),
          month: `${year}-${month}`,
          Present_days: presentDays,
          Absent_days: absentDays,
          Total_days: total_working_days,
          Paid_leaves: paidLeaveCount,
          Unpaid_leaves: unpaidLeaveCount,
          Overtime: totalOvertimeDays,
          Added_Amount: overtimeAmount,
          Deducted_Amount: final_deductions,
          Pf,
          Esi,
          Ptax: Ptax,
          TDS,
          Advance: 0,
          Base_salary: salaryAmountNumber || 0,
          Pay_in_hand: payInHand,
          Generation_status: 'Estimated',
          SalaryStatus: 'Unpaid',
        });
    
        generatedSalaries.push(salaryRecord);
    
      } catch (error) {
        console.error(`Error creating salary record for user ${user._id}:`, error);
      }
    }
    return res.status(201).json({
      message: 'Salaries generated successfully.',
      data: generatedSalaries,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while generating salaries.' });
  }
});


module.exports = router;
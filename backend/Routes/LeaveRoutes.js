const express = require('express');
const LeaveType = require('../Models/LeaveType');
const Role = require('../Models/Role');
const LeaveBalance = require('../Models/LeaveBalance');
const User = require('../Models/User');
const LeaveRequest = require('../Models/LeaveRequest');
const ProfileImage = require('../Models/ProfileImage');
const JoiningDate = require('../Models/JoiningDate');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');






// API to add multiple leave types with transaction
router.post('/add-leave-types', authenticateToken, async (req, res) => {
    const { leaveTypes } = req.body;
    if (!Array.isArray(leaveTypes) || leaveTypes.length === 0) {
        return res.status(400).json({ message: 'Invalid input, provide an array of leave types.' });
    }
    try {
        const createdLeaveTypes = await Promise.all(
            leaveTypes.map(async (leaveType) => {
                const { name, description, total_days, Role_id, accrual_type, salary_deduction } = leaveType;

                if (!name || !Role_id || !accrual_type) {
                    throw new Error(`Missing required fields for leave type: ${JSON.stringify(leaveType)}`);
                }
                if (!['MonthlyAquired', 'YearlyAquired'].includes(accrual_type)) {
                    throw new Error(`Invalid accrual_type value for leave type: ${JSON.stringify(leaveType)}`);
                }
                const newLeaveType = await LeaveType.create(
                    {
                        name,
                        description,
                        total_days,
                        Role_id,
                        accrual_type,
                        salary_deduction: salary_deduction || false,
                    }
                );
                const users = await User.find({ Role_id : Role_id });
                await Promise.all(
                    users.map(async (user) => {
                        const existingLeaveBalance = await LeaveBalance.findOne({
                            user_id: user._id,
                            leave_type_id: newLeaveType._id,
                        });
                        if (!existingLeaveBalance) {
                            await LeaveBalance.create(
                                {
                                    user_id: user._id,
                                    leave_type_id: newLeaveType._id,
                                    name: newLeaveType.name,
                                    total_days: newLeaveType.total_days,
                                    earned_days: accrual_type === 'YearlyAquired' ? newLeaveType.total_days : 0,
                                    arrear_days: 0,
                                }
                            );
                        } else if (accrual_type === 'YearlyAquired') {
                            existingLeaveBalance.earned_days += newLeaveType.total_days;
                            await existingLeaveBalance.save();
                        }
                    })
                );
                return newLeaveType;
            })
        );
        res.status(201).json({
            message: 'Leave types added successfully!',
            leaveTypes: createdLeaveTypes,
        });
    } catch (error) {
        console.error('Error adding leave types:', error);
        res.status(500).json({ message: 'An error occurred while adding leave types.', error: error.message });
    }
});




// API to get all leave types with associated roles
router.get('/get-all-leave-types', authenticateToken, async (req, res) => {
    try {
        // const leaveTypes = await LeaveType.find()
        // .populate('Role_id', 'Role_id role_name');
        const leaveTypes = await LeaveType.find()
        .populate({
            path: 'Role_id',               
            select: 'Role_id role_name',     
            model: 'Role',                  
            options: {                   
                lean: true                  
            }
        })
        .exec();
        const result = leaveTypes.map(leaveType => ({
            ...leaveType.toObject(),
            role: leaveType.Role_id,
            Role_id: undefined
        }));
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching leave types with roles:', error);
        res.status(500).json({
            message: 'Failed to fetch leave types with roles.',
            error: error.message
        });
    }
});



// API to update a leave type
router.put('/update-leave-type/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // Leave type ID from URL
    const { name, description, total_days, Role_id, accrual_type, salary_deduction } = req.body;
    try {
        const leaveType = await LeaveType.findById(id);
        if (!leaveType) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found',
            });
        }
        // Validate accrual_type value
        if (accrual_type && !['MonthlyAquired', 'YearlyAquired'].includes(accrual_type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid accrual_type value: ${accrual_type}`,
            });
        }
        // Check if `accrual_type` is being updated and take necessary actions
        const wasYearlyAquired = leaveType.accrual_type === 'YearlyAquired';
        const isYearlyAquired = accrual_type === 'YearlyAquired';
        // Update leave type in MongoDB
        const updatedLeaveType = await LeaveType.findByIdAndUpdate(id, {
            name,
            description,
            total_days,
            Role_id,
            accrual_type,
            salary_deduction,
        }, { new: true });
        if (!updatedLeaveType) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update leave type',
            });
        }
        // Update LeaveBalance for associated users
        const leaveBalances = await LeaveBalance.find({ leave_type_id: id });
        await Promise.all(
            leaveBalances.map(async (leaveBalance) => {
                leaveBalance.name = name;
                leaveBalance.total_days = total_days;
                if (isYearlyAquired && !wasYearlyAquired) {
                    leaveBalance.earned_days = total_days;
                }
                // Save the updated LeaveBalance
                await leaveBalance.save();
            })
        );
        res.status(200).json({
            success: true,
            message: 'Leave type updated successfully',
            data: updatedLeaveType,
        });
    } catch (error) {
        console.error('Error updating leave type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update leave type',
            error: error.message,
        });
    }
});






// Fetch leave balance and leave type name by user_id
router.get('/fetch-leave-balances/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        // Fetch the user's role based on user_id
        const user = await User.findById(user_id).select('Role_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const roleId = user.Role_id;
        // Fetch applicable leave types for the user's role
        const leaveTypes = await LeaveType.find({ Role_id: roleId }).select('Leave_type_Id name accrual_type total_days');

        if (!leaveTypes.length) {
            return res.status(404).json({ message: 'No leave types found for the user\'s role.' });
        }
        // Fetch leave balances for the user
        const leaveBalances = await LeaveBalance.find({ user_id }).select('leave_balance_id leave_type_id earned_days');
        // Combine leave types with balances
        const leaveData = leaveTypes.map((leaveType) => {
            const userBalance = leaveBalances.find(
                (balance) => balance.leave_type_id.toString() === leaveType._id.toString()
            );
            return {
                leave_type_id: leaveType._id,
                name: leaveType.name,
                accrual_type: leaveType.accrual_type,
                total_days: userBalance ? userBalance.earned_days : 0,
            };
        });
        res.status(200).json(leaveData);
    } catch (error) {
        console.error('Error fetching leave balances:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});




// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});




//not update !!!!
router.post('/add-leave', authenticateToken, async (req, res) => {
    const { user_id, Leave_type_Id, dates, Total_days, reason } = req.body;

    try {
        // Fetch the user's details (name, email, etc.)
        const user = await User.findById(user_id).select('first_name last_name email');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch all existing leave requests for the user
        const existingLeaves = await LeaveRequest.find({ user_id });

        // Check for overlapping dates
        const requestedDatesSet = new Set(dates);
        for (const leave of existingLeaves) {
            const existingDates = JSON.parse(leave.dates); 
            const existingDatesSet = new Set(existingDates);
            for (const date of requestedDatesSet) {
                if (existingDatesSet.has(date)) {
                    return res.status(400).json({
                        success: false,
                        message: `You already have a leave request for one or more of the requested dates: ${date}.`,
                    });
                }
            }
        }

        // Fetch the leave type to validate
        const leaveType = await LeaveType.findById(Leave_type_Id);

        if (!leaveType) {
            return res.status(404).json({ success: false, message: 'Invalid leave type' });
        }
        // Fetch the leave balance
        const leaveBalance = await LeaveBalance.findOne({ user_id, leave_type_id: Leave_type_Id });
        if (!leaveBalance || leaveBalance.earned_days <= 0) {
            return res.status(400).json({ success: false, message: 'Insufficient leave balance for the selected leave type' });
        }

        // Check if requested days exceed the balance
        if (Total_days > leaveBalance.earned_days) {
            return res.status(400).json({
                success: false,
                message: `Requested leave days exceed available balance. You have ${leaveBalance.earned_days} day(s) remaining.`,
            });
        }

        // Deduct the leave days from the balance
        leaveBalance.earned_days -= Total_days;
        await leaveBalance.save();

        // Create the leave request
        const leaveRequest = new LeaveRequest({
            Leave_type_Id,
            user_id,
            dates: JSON.stringify(dates), // Convert dates to JSON
            Total_days,
            reason,
            Status: 'Pending', // Default status
        });
        await leaveRequest.save();

        // Fetch all admin, founder, and HR users
        const users = await User.find({
            user_type: { $in: ['Admin', 'HumanResource'] },
            Is_active: true,
        }).select('email first_name last_name');

        // Prepare email data
        const emailRecipients = users.map((user) => user.email).join(',');
        if(!emailRecipients){
            return res.status(400).json({
                success: false,
                message: 'No recipients Find',
            });
        }
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: emailRecipients,
            subject: 'New Leave Request Submitted',
            text: `A new leave request has been submitted.\n\nDetails:\n- Employee Name: ${user.first_name} ${user.last_name}\n- Email: ${user.email}\n- Leave Type: ${leaveType.name}\n- Dates: ${dates.join(', ')}\n- Total Days: ${Total_days}\n- Reason: ${reason}\n\nPlease review the request.`,
            html: `
                        <!DOCTYPE html>
                        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

                        <head>
                            <title></title>
                            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
                            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet" type="text/css"><!--<![endif]-->
                            <style>
                                * {
                                    box-sizing: border-box;
                                }

                                body {
                                    margin: 0;
                                    padding: 0;
                                }

                                a[x-apple-data-detectors] {
                                    color: inherit !important;
                                    text-decoration: inherit !important;
                                }

                                #MessageViewBody a {
                                    color: inherit;
                                    text-decoration: none;
                                }

                                p {
                                    line-height: inherit
                                }

                                .desktop_hide,
                                .desktop_hide table {
                                    mso-hide: all;
                                    display: none;
                                    max-height: 0px;
                                    overflow: hidden;
                                }

                                .image_block img+div {
                                    display: none;
                                }

                                sup,
                                sub {
                                    font-size: 75%;
                                    line-height: 0;
                                }

                                @media (max-width:660px) {
                                    .image_block div.fullWidth {
                                        max-width: 100% !important;
                                    }

                                    .mobile_hide {
                                        display: none;
                                    }

                                    .row-content {
                                        width: 100% !important;
                                    }

                                    .stack .column {
                                        width: 100%;
                                        display: block;
                                    }

                                    .mobile_hide {
                                        min-height: 0;
                                        max-height: 0;
                                        max-width: 0;
                                        overflow: hidden;
                                        font-size: 0px;
                                    }

                                    .desktop_hide,
                                    .desktop_hide table {
                                        display: table !important;
                                        max-height: none !important;
                                    }
                                }
                            </style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
                        </head>

                        <body class="body" style="background-color: #f8f8f9; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                            <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f8f8f9;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1aa19c;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1aa19c; color: #000000; width: 640px; margin: 0 auto;" width="640">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                            <table class="divider_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad">
                                                                                        <div class="alignment" align="center">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                <tr>
                                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0"><span style="word-break: break-word;">&#8202;</span></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            
                                            
                                            <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                            
                                                                            <table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-left:40px;padding-right:40px;width:100%;">
                                                                                        <div class="alignment" align="center" style="line-height:10px">
                                                                                            <div class="fullWidth" style="max-width: 130px;"><img src="https://ik.imagekit.io/blackboxv2/Graphe-logo/logo%20(1).png?updatedAt=1736238516981" style="display: block; height: auto; border: 0; width: 100%;" width="352" alt="I'm an image" title="I'm an image" height="auto"></div>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:20px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:18px;line-height:120%;text-align:center;mso-line-height-alt:36px;">
                                                                                            <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a; font-weight: 600;">New Leave Request Submitted</span></p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="divider_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-top:20px;">
                                                                                        <div class="alignment" align="center">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                <tr>
                                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0px solid #BBBBBB;"><span style="word-break: break-word;">&#8202;</span></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f3fafa; color: #000000; width: 640px; margin: 0 auto;" width="640">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-left: 30px solid #FFFFFF; border-right: 30px solid #FFFFFF; border-bottom: 30px solid #FFFFFF; vertical-align: top; border-top: 0px;">
                                                                            <table class="divider_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad">
                                                                                        <div class="alignment" align="center">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                <tr>
                                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0px"><span style="word-break: break-word;">&#8202;</span></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="divider_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-top:35px;">
                                                                                        <div class="alignment" align="center">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                <tr>
                                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0px solid #BBBBBB;"><span style="word-break: break-word;">&#8202;</span></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="image_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="width:100%;">
                                                                                        <div class="alignment" align="center" style="line-height:10px">
                                                                                            <div style="max-width: 72px;">
                                                                                                <img 
                                                                                                src="${user.profileImage?.image_url || 'https://ik.imagekit.io/blackboxv2/Graphe-logo/no_user.png?updatedAt=1736239102058'}" 
                                                                                                style="display: block; height: auto; border: 0; width: 100%;" 
                                                                                                width="72" 
                                                                                                alt="User Profile Image" 
                                                                                                title="User Profile Image"
                                                                                                >
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:15px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:18px;line-height:120%;text-align:center;mso-line-height-alt:21.599999999999998px;">
                                                                                            <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${user.first_name} ${user.last_name}</strong></span></p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-left:30px;padding-right:30px;padding-top:20px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:15px;line-height:150%;text-align:left;mso-line-height-alt:22.5px;">
                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Email: <span style="color: #000; margin-left: 6px;">${user.email}</span><br>
                                                                                            </p>
                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Leave Type: <span style="color: #000; margin-left: 6px;">${leaveType.name}</span><br>
                                                                                            </p>
                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Dates: <span style="color: #000; margin-left: 6px;">${dates.join(', ')}</span><br>
                                                                                            </p>
                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Total Days: <span style="color: #000; margin-left: 6px;">${Total_days}</span><br>
                                                                                            </p>
                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Reason : <span style="color: #000; margin-left: 6px;">${reason}</span><br>
                                                                                            </p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-left:30px;padding-right:30px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:14px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                                                                            <p style="margin: 0; word-break: break-word;">&nbsp;</p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-8" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-left:30px;padding-right:30px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:14px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                                                                            <p style="margin: 0; word-break: break-word;">&nbsp;</p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-9" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-bottom:40px;padding-left:30px;padding-right:30px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:15px;line-height:150%;text-align:left;mso-line-height-alt:22.5px;">
                                                                                            <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">Thank you,</span></p>
                                                                                            <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a; font-weight: 500;">${user.first_name} ${user.last_name}</span></p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table><!-- End -->
                        </body>

                        </html>
                    `,

        };
        // Send email
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            success: true,
            message: 'Leave request added successfully and notifications sent',
        });
    } catch (error) {
        console.error('Error adding leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add leave request',
            error: error.message,
        });
    }
});



//update the leave tyep 
router.put('/update-leave-type', authenticateToken, async (req, res) => {
    const { leave_request_id, new_leave_type_id } = req.body;
    try {
      // Fetch the leave request to be updated
      const leaveRequest = await LeaveRequest.findById(leave_request_id);
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found.' });
      }
  
      const oldLeaveTypeId = leaveRequest.Leave_type_Id;
      const oldTotalDays = leaveRequest.Total_days;
  
      // Adjust leave balance for the old leave type
      const oldLeaveBalance = await LeaveBalance.findOne({
        leave_type_id: oldLeaveTypeId,
        user_id: leaveRequest.user_id,
      });
  
      if (oldLeaveBalance) {
        oldLeaveBalance.earned_days += oldTotalDays; 
        await oldLeaveBalance.save(); 
      }
  
      // Fetch or validate the new leave type
      const newLeaveType = await LeaveType.findById(new_leave_type_id);
      if (!newLeaveType) {
        return res.status(400).json({ error: 'Invalid new leave type.' });
      }
  
      // Adjust leave balance for the new leave type
      const newLeaveBalance = await LeaveBalance.findOne({
        leave_type_id: new_leave_type_id,
        user_id: leaveRequest.user_id,
      });
  
      if (!newLeaveBalance || newLeaveBalance.earned_days < oldTotalDays) {
        return res.status(400).json({
          error: `Insufficient leave balance for the new leave type. You have ${newLeaveBalance?.earned_days || 0} day(s) remaining.`,
        });
      }
  
      newLeaveBalance.earned_days -= oldTotalDays;
      await newLeaveBalance.save();
  
      // Update the leave request with the new leave type
      leaveRequest.Leave_type_Id = new_leave_type_id;
      await leaveRequest.save(); 
  
      res.status(200).json({
        success: true,
        message: 'Leave type updated successfully.',
        leaveRequest,
      });
    } catch (error) {
      console.error('Error updating leave type:', error);
      res.status(400).json({ error: error.message });
    }
  });



//delete the leave 
router.delete('/delete-leave', authenticateToken, async (req, res) => {
    const { Leave_request_id, user_id } = req.body;
    try {
        // Fetch the leave request to be deleted
        const leaveRequest = await LeaveRequest.findOne({
            _id: Leave_request_id,
            user_id,
            Status: 'Pending',
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found or is not in Pending status',
            });
        }
        // Fetch leave type from the LeaveType collection
        const leaveType = await LeaveType.findById(leaveRequest.Leave_type_Id);
        if (!leaveType) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found for the leave request',
            });
        }
        // Fetch the user details
        const user = await User.findById(leaveRequest.user_id).select('first_name last_name email');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found for the leave request',
            });
        }

        // Fetch the user's profile image (if exists)
        const profileImage = await ProfileImage.findById(user.profileImage);
        
        // Restore the leave balance
        const leaveBalance = await LeaveBalance.findOne({
            leave_type_id: leaveRequest.Leave_type_Id,
            user_id,
        });
        
        if (leaveBalance) {
            leaveBalance.earned_days += leaveRequest.Total_days; // Refund leave days
            await leaveBalance.save();  // Save updated balance
        }

        // Delete the leave request
        await LeaveRequest.deleteOne({ _id: Leave_request_id });

        // Notify Admins, Founders, and HR
        const admins = await User.find({
            user_type: { $in: ['Admin', 'HumanResource'] },
            Is_active: true,
        }).select('email first_name last_name');

        if (admins.length > 0) {
            const adminEmails = admins.map(admin => admin.email).join(','); // Comma-separated list of emails
           
           
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: adminEmails,
                subject: 'Leave Request Deleted',
                text: `A leave request has been rescinded by ${user.first_name} ${user.last_name} (${user.email}).\n\nDetails:\n- Leave Type: ${leaveType.name}\n- Total Days: ${leaveRequest.Total_days}\n- Reason: ${leaveRequest.reason}\n\nPlease review the records.`,
                html: `
                <!DOCTYPE html>
                        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

                        <head>
                            <title></title>
                            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
                            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900" rel="stylesheet" type="text/css"><!--<![endif]-->
                            <style>
                                * {
                                    box-sizing: border-box;
                                }

                                body {
                                    margin: 0;
                                    padding: 0;
                                }

                                a[x-apple-data-detectors] {
                                    color: inherit !important;
                                    text-decoration: inherit !important;
                                }

                                #MessageViewBody a {
                                    color: inherit;
                                    text-decoration: none;
                                }

                                p {
                                    line-height: inherit
                                }

                                .desktop_hide,
                                .desktop_hide table {
                                    mso-hide: all;
                                    display: none;
                                    max-height: 0px;
                                    overflow: hidden;
                                }

                                .image_block img+div {
                                    display: none;
                                }

                                sup,
                                sub {
                                    font-size: 75%;
                                    line-height: 0;
                                }

                                @media (max-width:660px) {
                                    .image_block div.fullWidth {
                                        max-width: 100% !important;
                                    }

                                    .mobile_hide {
                                        display: none;
                                    }

                                    .row-content {
                                        width: 100% !important;
                                    }

                                    .stack .column {
                                        width: 100%;
                                        display: block;
                                    }

                                    .mobile_hide {
                                        min-height: 0;
                                        max-height: 0;
                                        max-width: 0;
                                        overflow: hidden;
                                        font-size: 0px;
                                    }

                                    .desktop_hide,
                                    .desktop_hide table {
                                        display: table !important;
                                        max-height: none !important;
                                    }
                                }
                            </style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
                        </head>

                        <body class="body" style="background-color: #f8f8f9; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
                            <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f8f8f9;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1aa19c;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1aa19c; color: #000000; width: 640px; margin: 0 auto;" width="640">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                            <table class="divider_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad">
                                                                                        <div class="alignment" align="center">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                <tr>
                                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0"><span style="word-break: break-word;">&#8202;</span></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            
                                            
                                            <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 640px; margin: 0 auto;" width="640">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                                            
                                                                            <table class="image_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-left:40px;padding-right:40px;width:100%;">
                                                                                        <div class="alignment" align="center" style="line-height:10px">
                                                                                            <div class="fullWidth" style="max-width: 130px;"><img src="https://ik.imagekit.io/blackboxv2/Graphe-logo/logo%20(1).png?updatedAt=1736238516981" style="display: block; height: auto; border: 0; width: 100%;" width="352" alt="I'm an image" title="I'm an image" height="auto"></div>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:20px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:18px;line-height:120%;text-align:center;mso-line-height-alt:36px;">
                                                                                            <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a; font-weight: 600;">A leave request has been rescinded</span></p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="divider_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-top:20px;">
                                                                                        <div class="alignment" align="center">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                <tr>
                                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0px solid #BBBBBB;"><span style="word-break: break-word;">&#8202;</span></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffeaf1; color: #000000; width: 640px; margin: 0 auto;" width="640">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; border-left: 30px solid #FFFFFF; border-right: 30px solid #FFFFFF; border-bottom: 30px solid #FFFFFF; vertical-align: top; border-top: 0px;">
                                                                            <table class="divider_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad">
                                                                                        <div class="alignment" align="center">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                <tr>
                                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0px"><span style="word-break: break-word;">&#8202;</span></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="divider_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-top:35px;">
                                                                                        <div class="alignment" align="center">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                                <tr>
                                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 0px solid #BBBBBB;"><span style="word-break: break-word;">&#8202;</span></td>
                                                                                                </tr>
                                                                                            </table>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="image_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="pad" style="width:100%;">
                                                                                        <div class="alignment" align="center" style="line-height:10px">
                                                                                            <div style="max-width: 72px;">
                                                                                                <img 
                                                                                                src="${user.profileImage?.image_url || 'https://ik.imagekit.io/blackboxv2/Graphe-logo/no_user.png?updatedAt=1736239102058'}" 
                                                                                                style="display: block; height: auto; border: 0; width: 100%;" 
                                                                                                width="72" 
                                                                                                alt="User Profile Image" 
                                                                                                title="User Profile Image"
                                                                                                >
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:15px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:18px;line-height:120%;text-align:center;mso-line-height-alt:21.599999999999998px;">
                                                                                            <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;"><strong>${user.first_name} ${user.last_name}</strong></span></p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-left:30px;padding-right:30px;padding-top:20px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:15px;line-height:150%;text-align:left;mso-line-height-alt:22.5px;">
                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Email: <span style="color: #000; margin-left: 6px;">${user.email}</span><br>
                                                                                            </p>
                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Leave Type: <span style="color: #000; margin-left: 6px;"> ${leaveType.name}</span><br>
                                                                                            </p>

                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Total Days: <span style="color: #000; margin-left: 6px;">${leaveRequest.Total_days}</span><br>
                                                                                            </p>
                                                                                            <p style="margin: 0 0 8px 0; word-break: break-word;"><span style="word-break: break-word; color: #717171; font-weight: 500;">
                                                                                                Reason : <span style="color: #000; margin-left: 6px;">${leaveRequest.reason}</span><br>
                                                                                            </p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-left:30px;padding-right:30px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:14px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                                                                            <p style="margin: 0; word-break: break-word;">&nbsp;</p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-8" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-left:30px;padding-right:30px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:14px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                                                                            <p style="margin: 0; word-break: break-word;">&nbsp;</p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                            <table class="paragraph_block block-9" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                                <tr>
                                                                                    <td class="pad" style="padding-bottom:40px;padding-left:30px;padding-right:30px;">
                                                                                        <div style="color:#555555;font-family:Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif;font-size:15px;line-height:150%;text-align:left;mso-line-height-alt:22.5px;">
                                                                                            <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a;">Thank you,</span></p>
                                                                                            <p style="margin: 0; word-break: break-word;"><span style="word-break: break-word; color: #2b303a; font-weight: 500;">${user.first_name} ${user.last_name}</span></p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table><!-- End -->
                        </body>

                        </html>
                       
                       `,
            };
            // Send email
            await transporter.sendMail(mailOptions);
        }
        res.status(200).json({
            success: true,
            message: 'Leave request deleted successfully and notifications sent to admins.',
        });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete leave request',
            error: error.message,
        });
    } 
});



//upadte the leave statsu
router.put('/update-leave-status', authenticateToken, async (req, res) => {
    const { Leave_request_id, Approved_By, Status, Comment } = req.body;
    // Validate the status
    if (!['Approved', 'Rejected'].includes(Status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status. Status must be 'Approved' or 'Rejected'.",
        });
    }
    try {
        // Fetch the leave request
        const leaveRequest = await LeaveRequest.findOne({
            _id: Leave_request_id,
            Status: 'Pending', 
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found or is not in Pending status',
            });
        }
        // Handle status change
        if (Status === 'Rejected') {
            // Restore leave balance
            const leaveBalance = await LeaveBalance.findOne({
                leave_type_id: leaveRequest.Leave_type_Id,
                user_id: leaveRequest.user_id,
            });

            if (leaveBalance) {
                leaveBalance.earned_days += leaveRequest.Total_days; // Refund the leave days
                await leaveBalance.save(); // Save the updated leave balance
            }
        }
        // Update the leave request with the new status, approved_by, and comment
        leaveRequest.Status = Status;
        leaveRequest.Approved_By = Approved_By || leaveRequest.Approved_By;
        leaveRequest.Comment = Comment || leaveRequest.Comment;
        await leaveRequest.save(); // Save the updated leave request
        res.status(200).json({
            success: true,
            message: `Leave request has been ${Status.toLowerCase()} successfully.`,
        });
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update leave status',
            error: error.message,
        });
    }
});



//leave-requests-by-status
router.get('/leave-requests-by-status', authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date, search_query } = req.query;
        const matchConditions = {};
        if (start_date && end_date) {
            matchConditions.updatedAt = {
                $gte: new Date(start_date),
                $lte: new Date(end_date),
            };
        }
        const userMatchConditions = {};
        if (search_query) {
            userMatchConditions.$or = [
                { first_name: { $regex: search_query, $options: 'i' } },
                { last_name: { $regex: search_query, $options: 'i' } },
            ];
        }
        const leaveRequests = await LeaveRequest.aggregate([
            {
                $match: matchConditions,
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'requestor',
                    pipeline: [
                        { $match: userMatchConditions },
                        { $project: { first_name: 1, last_name: 1, email: 1 } },
                        {
                            $lookup: {
                                from: 'profileimages',
                                localField: '_id',
                                foreignField: 'user_id',
                                as: 'profileImage',
                                pipeline: [{ $project: { image_url: 1 } }],
                            },
                        },
                        { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
                    ],
                },
            },
            {
                $addFields: {
                    'requestor.user_id': { $arrayElemAt: ['$requestor._id', 0] }, // Rename _id to user_id
                },
            },
            {
                $project: {
                    'requestor._id': 0, 
                },
            },
            {
                $lookup: {
                    from: 'leavetypes',
                    let: { leaveTypeId: { $toObjectId: "$Leave_type_Id" } },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { $eq: ["$_id", "$$leaveTypeId"] }
                            }
                        },
                        { 
                            $project: { 
                                _id: 1, 
                                name: 1, 
                                description: 1 
                            }
                        }
                    ],
                    as: 'leaveType',
                }
            },
            {
                $match: {
                    'requestor': { $ne: [] }  
                }
            },
            {
                $group: {
                    _id: '$Status',
                    requests: { $push: '$$ROOT' },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    requests: 1,
                },
            },
            {
                $sort: { status: 1 },
            },
        ]);

        const groupedRequests = {
            Pending: [],
            Approved: [],
            Rejected: [],
        };
        leaveRequests.forEach((group) => {
            groupedRequests[group.status] = group.requests.map((request) => {
                return {
                    ...request,
                    Leave_request_id: request._id,
                    _id: undefined, 
                };
            });
        });

        if (leaveRequests.length === 0) {
            return res.status(200).json({
                success: true,
                data: groupedRequests,
            });
        }
        
        res.status(200).json({
            success: true,
            data: groupedRequests,
        });
    } catch (error) {
        console.error('Error fetching leave requests by status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave requests',
            error: error.message,
        });
    }
});


//leave-requests/user/:user_id
router.get('/leave-requests/user/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;
    const { start_date, end_date } = req.query;

    try {
        const matchConditions = { user_id: new mongoose.Types.ObjectId(user_id) };
        
        if (start_date && end_date) {
            matchConditions.updatedAt = {
                $gte: new Date(start_date),
                $lte: new Date(end_date),
            };
        }

        const leaveRequests = await LeaveRequest.aggregate([
            { $match: matchConditions },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'requestor',
                    pipeline: [
                        { $project: { first_name: 1, last_name: 1, email: 1 } },
                    ],
                },
            },
            { $unwind: { path: '$requestor', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: 'requestor._id',
                    foreignField: 'user_id',
                    as: 'profileImage',
                    pipeline: [
                        { $project: { image_url: 1 } },
                    ],
                },
            },
            { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'approver',
                    foreignField: '_id',
                    as: 'approverDetails',
                    pipeline: [
                        { $project: { first_name: 1, last_name: 1, email: 1 } },
                    ],
                },
            },
            { $unwind: { path: '$approverDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'leavetypes',
                    localField: 'Leave_type_Id',
                    foreignField: '_id',
                    as: 'leaveType',
                    pipeline: [
                        { $project: { name: 1, description: 1 } },
                    ],
                },
            },
            { $unwind: { path: '$leaveType', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$Status',
                    requests: { $push: '$$ROOT' },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    requests: 1,
                },
            },
            { $sort: { status: 1 } },
        ]);

        const groupedRequests = {
            Pending: [],
            Approved: [],
            Rejected: [],
        };

        leaveRequests.forEach((group) => {
            groupedRequests[group.status] = group.requests;
        });
        res.status(200).json({
            success: true,
            data: groupedRequests,
        });
    } catch (error) {
        console.error('Error fetching leave requests for user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave requests',
            error: error.message,
        });
    }
});



//fetch-user-leave-balances/:user_id'
router.get('/fetch-user-leave-balances/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;
    try {
        const leaveBalances = await LeaveBalance.aggregate([
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                }
            },
            {
                $lookup: {
                    from: 'leavetypes', 
                    localField: 'Leave_type_Id',
                    foreignField: '_id',
                    as: 'leaveType',
                    pipeline: [
                        { 
                            $project: { 
                                _id: 1,
                                name: 1, 
                                accrual_type: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$leaveType',
                    preserveNullAndEmptyArrays: true 
                }
            }
        ]);

        // If no leave balances are found for the user
        if (!leaveBalances || leaveBalances.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No leave balances found for the specified user.',
            });
        }
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


//API to fetch all leave balances grouped by users
router.get('/fetch-all-leave-balances-for-adjustment', authenticateToken, async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $match: {
                    Is_active: true,
                    user_type: { $in: [
                        'HumanResource',
                        'Accounts',
                        'Department_Head',
                        'Employee',
                        'Social_Media_Manager',
                        'Task_manager',
                    ] },
                }
            },
            {
                $lookup: {
                    from: 'profileimages',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'profileImage',
                    pipeline: [
                        { $project: { image_url: 1 } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'joiningdates', 
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'joiningDates',
                    pipeline: [
                        { $project: { joining_date: 1 } }, 
                    ]
                }
            },
            {
                $lookup: {
                    from: 'leaveblances', 
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'leaveBalances',
                    pipeline: [
                        { 
                            $project: {
                                _id: 1,
                                total_days: 1,
                                earned_days: 1,
                                arrear_days: 1,
                                leave_type_id: 1  
                            }
                        },
                        {
                            $lookup: {
                                from: 'leavetypes',
                                localField: 'leave_type_id',
                                foreignField: '_id',
                                as: 'leaveType',
                                pipeline: [
                                    { $project: { name: 1 } }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                leaveType: { $arrayElemAt: ['$leaveType', 0] } 
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    profileImage: { $arrayElemAt: ['$profileImage', 0] },
                    joiningDate: { $arrayElemAt: ['$joiningDates', 0] }, 
                    leaveBalances: 1
                }
            },
            {
                $sort: { first_name: 1, last_name: 1 }
            }
        ]);
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users with leave balances:', error.message || error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave balances. Please try again later.',
        });
    }
});


//update-arrear-days
router.put('/update-arrear-days', authenticateToken, async (req, res) => {
    const { leave_balance_id, arrear_days } = req.body;
    if (!leave_balance_id || arrear_days === undefined) {
        return res.status(400).json({
            success: false,
            message: 'leave_balance_id and arrear_days are required.',
        });
    }
    try {
        // Find the LeaveBalance entry by leave_balance_id
        const leaveBalance = await LeaveBalance.findById(leave_balance_id);
        if (!leaveBalance) {
            return res.status(404).json({
                success: false,
                message: 'Leave balance not found.',
            });
        }
        // Update the arrear_days
        leaveBalance.arrear_days = arrear_days;
        await leaveBalance.save();
        return res.status(200).json({
            success: true,
            message: 'Arrear days updated successfully.',
            data: leaveBalance,
        });
    } catch (error) {
        console.error('Error updating arrear days:', error.message || error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update arrear days. Please try again later.',
        });
    }
});



//fetch all users 
router.get('/fetch-all-users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({
            user_type: {
                $in: ['HumanResource', 'Department_Head', 'Employee', 'Social_Media_Manager', 'Task_manager']
            }
        }, 'first_name last_name email user_type');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = router;
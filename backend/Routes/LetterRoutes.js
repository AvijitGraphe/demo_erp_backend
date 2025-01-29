
const express = require('express');
const multer = require('multer');
const ImageKit = require('imagekit');
const LetterTemplate = require('../Models/Letter_template');
const SendLetter = require('../Models/SendLetter'); // Adjust the path to your model
const ProfileImage = require('../Models/ProfileImage'); // Adjust the path as necessary
const User = require('../Models/User'); // Adjust the path as necessary
const { authenticateToken } = require('../middleware/authMiddleware');
const LetterSection = require('../Models/LetterSection');
const nodemailer = require('nodemailer');
const SendLetterSection = require('../Models/SendLetterSection');
const Role = require('../Models/Role');
const JoiningDate = require('../Models/JoiningDate');
const UserTime = require('../Models/Usertime');
const Resignation = require('../Models/Resignation');

const router = express.Router();

const mongoose = require('mongoose');

const imagekit = new ImageKit({
    publicKey: "public_UCxvoHx58ajkX85Q6oBFCP7pSuI=",
    privateKey: "private_ATOOFtW1RZ2IoJWSF41Jbu46lDM=",
    urlEndpoint: "https://ik.imagekit.io/blackboxv2",
});

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to delete the old image from ImageKit
async function deleteOldImage(fileId) {
    if (!fileId) return;
    try {
        await imagekit.deleteFile(fileId); // Deletes the old image using fileId
    } catch (error) {
        console.error('Error deleting old image:', error);
    }
}



const transporter = nodemailer.createTransport({
    name: process.env.MAIL_HOST,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, // Disable SSL
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});





router.post('/letter-template', authenticateToken, async (req, res) => {
    try {
        const {
            template_id, 
            template_name,
            template_subject,
            sections 
        } = req.body;

        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({ message: 'Sections are required and must be a non-empty array' });
        }
        if (template_id) {
            // Update existing template
            const existingTemplate = await LetterTemplate.findById(template_id);

            if (!existingTemplate) {
                return res.status(404).json({ message: 'Template not found' });
            }
            // Update template details
            existingTemplate.template_name = template_name;
            existingTemplate.template_subject = template_subject;
            await existingTemplate.save();
            // Remove existing sections for the template
            await LetterSection.deleteMany({ template_id });

            // Create new sections
            const newSections = sections.map(section => ({
                template_id: existingTemplate._id,
                section_heading: section.section_heading,
                section_body: section.section_body,
                section_order: section.section_order,
            }));

            await LetterSection.insertMany(newSections);
            return res.status(200).json({ message: 'Template updated successfully', template: existingTemplate });
        }
        // Create a new template
        const newTemplate = new LetterTemplate({
            template_name,
            template_subject,
        });
        await newTemplate.save();
        // Add sections for the new template
        const newSections = sections.map(section => ({
            template_id: newTemplate._id,
            section_heading: section.section_heading,
            section_body: section.section_body,
            section_order: section.section_order,
        }));
        await LetterSection.insertMany(newSections);
        return res.status(201).json({ message: 'Template created successfully', newTemplate });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});


router.get('/fetchallletters', authenticateToken, async (req, res) => {
    try {
        const templates = await LetterTemplate.find(
            {}, 
            'template_name template_subject createdAt updatedAt'
        );

        // Rename _id to template_id
        const formattedTemplates = templates.map(template => ({
            template_id: template._id,
            template_name: template.template_name,
            template_subject: template.template_subject,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        }));

        res.status(200).json(formattedTemplates);
    } catch (error) {
        console.error('Error fetching letter templates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});






// Duplicate a letter template
router.post('/duplicate-letter-template', authenticateToken, async (req, res) => {
    const { template_id } = req.body;
    console.log("template_id +++++", template_id);

    try {
        const existingTemplate = await LetterTemplate.aggregate([
            { $match: { _id:new mongoose.Types.ObjectId(template_id) } },
            {
                $lookup: {
                    from: 'lettersections', // Assuming the sections are stored in 'lettersections'
                    localField: '_id',
                    foreignField: 'template_id',
                    as: 'sections'
                }
            }
        ]);

        if (existingTemplate.length === 0) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const templateData = existingTemplate[0];
        const duplicatedTemplate = new LetterTemplate({
            template_name: `${templateData.template_name} copy`,
            template_subject: templateData.template_subject,
        });

        await duplicatedTemplate.save();

        const duplicatedSections = templateData.sections.map(section => ({
            template_id: duplicatedTemplate._id,
            section_heading: section.section_heading,
            section_body: section.section_body,
            section_order: section.section_order,
        }));

        await LetterSection.insertMany(duplicatedSections);

        return res.status(201).json({
            message: 'Template duplicated successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});





// Delete a letter template
router.delete('/letter-template-delete', authenticateToken, async (req, res) => {
    const { template_id } = req.body;

    try {
        const existingTemplate = await LetterTemplate.findById(template_id);

        if (!existingTemplate) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Delete associated sections
        await LetterSection.deleteMany({ template_id });

        // Delete the template
        await existingTemplate.deleteOne();

        return res.status(200).json({ message: 'Template and associated sections deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});





// Fetch a letter template by ID
router.get('/viewallletters/:template_id', authenticateToken, async (req, res) => {
    try {
        const { template_id } = req.params;

        const template = await LetterTemplate.aggregate([
            { $match: { _id:new mongoose.Types.ObjectId(template_id) } },
            {
                $lookup: {
                    from: 'lettersections',
                    localField: '_id',
                    foreignField: 'template_id',
                    as: 'sections'
                }
            },
            {
                $unwind: {
                    path: '$sections',
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $sort: { 'sections.section_order': 1 } 
            },
            {
                $group: {
                    _id: '$_id',
                    template_name: { $first: '$template_name' },
                    template_subject: { $first: '$template_subject' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    sections: { $push: '$sections' }
                }
            }
        ]);
        if (!template || template.length === 0) {
            return res.status(404).json({ message: 'Letter template not found' });
        }
        res.status(200).json({
            template_id: template[0]._id,
            template_name: template[0].template_name,
            template_subject: template[0].template_subject,
            createdAt: template[0].createdAt,
            updatedAt: template[0].updatedAt,
            sections: template[0].sections
        });
    } catch (error) {
        console.error('Error fetching letter template:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch all letter templates
router.get('/fetchalllettertemplates', authenticateToken, async (req, res) => {
    try {
        const templates = await LetterTemplate.find({}, 'template_name template_subject createdAt updatedAt');
        // Mapping the _id to template_id
        const formattedTemplates = templates.map(template => ({
            template_id: template._id,
            template_name: template.template_name,
            template_subject: template.template_subject,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        }));
        res.status(200).json(formattedTemplates);
    } catch (error) {
        console.error('Error fetching letter templates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// Add or edit SendLetter
router.post('/send-letter', authenticateToken, upload.single('signature'), async (req, res) => {
    try {
        const {
            send_letter_id, 
            template_id,
            user_email,
            employee_name,
            creator_name,
            creator_designation,
            sections, 
        } = req.body;

        const user_id = req.body.user_id === 'null' || req.body.user_id === undefined ? null : req.body.user_id;

        const parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;

        if (!template_id || !user_email || !employee_name || !creator_name || !creator_designation) {
            return res.status(400).json({ message: 'Required fields are missing.' });
        }

        let sendLetter;
        let uploadedSignature = null;

        if (send_letter_id) {
            // Editing an existing SendLetter
            sendLetter = await SendLetter.findById(send_letter_id);

            if (!sendLetter) {
                return res.status(404).json({ message: 'SendLetter not found.' });
            }

            // Handle signature update if a new file is uploaded
            if (req.file) {
                const { buffer, originalname } = req.file;

                await deleteOldImage(sendLetter.signature_file_id);

                uploadedSignature = await imagekit.upload({
                    file: buffer,
                    fileName: originalname,
                });

                sendLetter.signature_url = uploadedSignature.url;
                sendLetter.signature_file_id = uploadedSignature.fileId;
            }

            // Update SendLetter fields
            sendLetter.template_id = template_id;
            sendLetter.user_email = user_email;
            sendLetter.employee_name = employee_name;
            sendLetter.creator_name = creator_name;
            sendLetter.creator_designation = creator_designation;

            if (user_id) sendLetter.user_id = user_id;

            await sendLetter.save();

            // Update or replace sections
            await SendLetterSection.deleteMany({ send_letter_id: sendLetter._id });
            if (parsedSections && parsedSections.length > 0) {
                const sectionData = parsedSections.map((section) => ({
                    send_letter_id: sendLetter._id,
                    section_heading: section.heading,
                    section_body: section.body,
                    section_order: section.order,
                }));
                await SendLetterSection.insertMany(sectionData);
            }
        } else {
            // Creating a new SendLetter
            if (req.file) {
                const { buffer, originalname } = req.file;

                uploadedSignature = await imagekit.upload({
                    file: buffer,
                    fileName: originalname,
                });
            }

            const createData = {
                template_id,
                user_email,
                employee_name,
                creator_name,
                creator_designation,
                signature_url: uploadedSignature ? uploadedSignature.url : null,
                signature_file_id: uploadedSignature ? uploadedSignature.fileId : null,
                status: 'Generated',
                user_id,
            };

            sendLetter = new SendLetter(createData);
            await sendLetter.save();

            if (parsedSections && parsedSections.length > 0) {
                const sectionData = parsedSections.map((section) => ({
                    send_letter_id: sendLetter._id,
                    section_heading: section.heading,
                    section_body: section.body,
                    section_order: section.order,
                }));
                await SendLetterSection.insertMany(sectionData);
            }
        }

        res.status(200).json({
            message: send_letter_id ? 'SendLetter updated successfully!' : 'SendLetter created successfully!',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to process SendLetter.',
            error: error.message,
        });
    }
});




// Delete a SendLetter
router.delete('/send-letter/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        console.log("log the data", id);

        // Ensure that the id is converted to ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid SendLetter ID.' });
        }

        // Find the SendLetter by ObjectId
        const sendLetter = await SendLetter.findById(id);

        if (!sendLetter) {
            return res.status(404).json({ message: 'SendLetter not found.' });
        }

        if (sendLetter.status !== 'Generated') {
            return res.status(400).json({
                message: 'SendLetter cannot be deleted because its status is not "Generated".',
            });
        }

        if (sendLetter.signature_file_id) {
            try {
                await deleteOldImage(sendLetter.signature_file_id);
            } catch (error) {
                console.error('Error deleting signature from ImageKit:', error);
            }
        }

        // Delete all associated sections
        await SendLetterSection.deleteMany({ send_letter_id: id });

        // Remove the SendLetter using deleteOne()
        await SendLetter.deleteOne({ _id: id });

        res.status(200).json({
            message: 'SendLetter and associated data deleted successfully!',
        });
    } catch (error) {
        console.error('Error deleting SendLetter:', error);
        res.status(500).json({
            message: 'Failed to delete SendLetter.',
            error: error.message,
        });
    }
});






// Fetch all SendLetters grouped by unique employee_name
router.get('/fetch-send-letters', authenticateToken, async (req, res) => {
    try {
        const result = await SendLetter.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        {
                            $project: {
                                _id:1,
                                first_name: 1,
                                last_name: 1,
                                email: 1,
                                user_type: 1
                            }
                        },
                        {
                            $lookup: {
                                from: 'profileimages',
                                localField: 'profileImage',
                                foreignField: '_id',
                                as: 'profileImage',
                                pipeline: [{ $project: { image_url: 1 } }]
                            }
                        },
                        { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } }
                    ]
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'sendlettersections',
                    localField: '_id',
                    foreignField: 'send_letter_id',
                    as: 'send_letter_sections',
                    pipeline: [
                        { $sort: { section_order: 1 } },
                        {
                            $project: {
                                section_id: 1,
                                section_heading: 1,
                                section_body: 1,
                                section_order: 1
                            }
                        }
                    ]
                }
            },
            { $sort: { employee_name: 1 } },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $ifNull: ['$user', false] },
                            then: '$employee_name',
                            else: '$_id'
                        }
                    },
                    employee_name: { $first: '$employee_name' },
                    user: { $first: '$user' },
                    letters: { $push: '$$ROOT' }
                }
            },
            {
                $project: {
                    _id: 0,
                    employee_name: 1,
                    user: 1,
                    letters: {
                        $map: {
                            input: '$letters',
                            as: 'letter',
                            in: {
                                $mergeObjects: [
                                    '$$letter',
                                    {
                                        user: undefined,
                                        send_letter_sections: '$$letter.send_letter_sections'
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            { $sort: { employee_name: 1 } }
        ]);
        console.log("log the data ", result);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching send letters:', error);
        res.status(500).json({ error: 'Failed to fetch send letters' });
    }
});





// Fetch main user details without exposing the password
router.get('/Selected-user-details', authenticateToken, async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        const userDetails = await User.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'roles', // Assuming the collection name for Role is "roles"
                    localField: 'role', // Assuming the reference is by ObjectId
                    foreignField: '_id',
                    as: 'role'
                }
            },
            {
                $unwind: { path: '$role', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'usertimes', // Assuming the collection name for UserTime is "usertimes"
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'userTimes'
                }
            },
            {
                $lookup: {
                    from: 'joiningdates', // Assuming the collection name for JoiningDate is "joiningdates"
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'joiningDates'
                }
            },
            {
                $lookup: {
                    from: 'resignations', // Assuming the collection name for Resignation is "resignations"
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'resignations',
                    pipeline: [
                        {
                            $match: { status: 'Approved' }
                        },
                        {
                            $project: {
                                status: 1,
                                last_working_day: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    password: 0 // Exclude the password field
                }
            }
        ]);

        if (!userDetails || userDetails.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(userDetails[0]);
    } catch (error) {
        console.error(`Error fetching user details: ${error.message}`);
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
});

// Fetch all users
router.get('/fetch-all-users', authenticateToken, async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $match: {
                    user_type: { $in: ['Department_Head', 'Employee', 'Social_Media_Manager', 'Task_manager', 'Ex_employee', 'HumanResource'] }
                }
            },
            {
                $project: {
                    user_id: 1,
                    first_name: 1,
                    last_name: 1,
                    email: 1,
                    user_type: 1
                }
            }
        ]);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/letters/:userId
router.get('/lettersUsers/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const letters = await SendLetter.aggregate([
            {
                $match: { user_id:new mongoose.Types.ObjectId(userId), status: 'Confirmed' }
            },
            {
                $lookup: {
                    from: 'lettertemplates', // Assuming the collection name for LetterTemplate is "lettertemplates"
                    localField: 'template_id',
                    foreignField: '_id',
                    as: 'template_id'
                }
            },
            {
                $unwind: { path: '$template_id', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'sendlettersections', // Assuming the collection name for SendLetterSection is "sendlettersections"
                    localField: '_id',
                    foreignField: 'send_letter_id',
                    as: 'send_letter_sections'
                }
            },
            {
                $unwind: { path: '$send_letter_sections', preserveNullAndEmptyArrays: true }
            },
            {
                $sort: { 'send_letter_sections.section_order': 1 }
            },
            {
                $project: {
                    'template_id.template_name': 1,
                    'template_id.template_subject': 1,
                    'send_letter_sections.section_id': 1,
                    'send_letter_sections.section_heading': 1,
                    'send_letter_sections.section_body': 1,
                    'send_letter_sections.section_order': 1
                }
            }
        ]);

        res.status(200).json({ letters });
    } catch (error) {
        console.error('Error fetching letters:', error);
        return res.status(500).json({ error: 'An error occurred while fetching letters' });
    }
});






// POST /api/letters/:letterId/confirm
router.post('/sendletters/:letterId/confirm', authenticateToken, async (req, res) => {
    const { letterId } = req.params;

    try {
        // Aggregation to find the letter, related template, and sections
        const letter = await SendLetter.aggregate([
            { $match: { _id:new mongoose.Types.ObjectId(letterId) } },
            {
                $lookup: {
                    from: 'lettertemplates', // Assuming 'LetterTemplate' collection name
                    localField: 'template',
                    foreignField: '_id',
                    as: 'template',
                    pipeline: [
                        { $project: { template_name: 1, template_subject: 1 } }
                    ]
                }
            },
            {
                $unwind: { path: '$template', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'sendlettersections', // Assuming 'SendLetterSection' collection name
                    localField: 'send_letter_sections',
                    foreignField: '_id',
                    as: 'send_letter_sections',
                    pipeline: [
                        { $project: { section_heading: 1, section_body: 1, section_order: 1 } }
                    ]
                }
            },
            { $sort: { 'send_letter_sections.section_order': 1 } }
        ]);

        if (!letter || letter.length === 0) {
            return res.status(404).json({ error: 'Letter not found' });
        }

        // Extract letter details
        const letterData = letter[0];
        letterData.status = 'Confirmed';

        // Update the letter status
        await SendLetter.findByIdAndUpdate(letterId, { status: 'Confirmed' });

        // Generate section content
        const formattedDate = letterData.createdAt
        ? new Date(letterData.createdAt).toLocaleDateString('en-GB')
        : 'Invalid Date';

        console.log("logn the data letter  letter", letter)
         // E
         // mail content
         const mailOptions = {
            from:`"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: letter.user_email,
            subject: `Letter Subject: ${letter.template.template_subject}`,
            html: `
               <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Employment Letter</title>
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins&display=swap" rel="stylesheet">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
                        <table style="width: 100%; max-width: 680px; margin: 20px auto; padding: 0 15px; background-color: #ffffff; border: 0; border-collapse: collapse;" cellpadding="0" cellspacing="0">
                            <thead>
                                <tr>
                                    <td style="padding: 10px 15px; ">
                                        <span style="display: block; padding-bottom: 20px;">
                                            <img src="https://ik.imagekit.io/blackboxv2/Graphe-logo/logo%20(1).png?updatedAt=1736238516981" alt="brand-logo" style="width: 120px;">
                                        </span>
                                    </td>
                                    <td style="padding: 10px 15px; text-align: right; float: right;">
                                        
                                            <p style="width: 280px; margin: 0; font-size: 14px; font-weight: 400; line-height: 1.5;">
                                                Godrej Genesis Building, 11th Floor, EN-34, EN Block, Sector V, Bidhannagar, Kolkata, <br/> West Bengal 700105
                                            </p>
                                        
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding: 10px 15px; ">
                                        <strong style="margin-bottom: 10px; display: block; font-family: Helvetica, Arial, sans-serif;">To,</strong>
                                        <p style="font-size: 14px; font-weight: 400; line-height: 1.5; font-family: Helvetica, Arial, sans-serif; margin-bottom:8px;"><strong>${letter.employee_name}</strong>,</p>
                                        <p style="font-size: 12px; font-weight: 400; line-height: 1.5; font-family: Helvetica, Arial, sans-serif; margin-bottom:0px;"><strong>${letter.user_email}</strong>,</p>
                                    </td>
                                    <td style="padding: 10px 15px;  text-align: right; font-size: 14px; font-weight: 400; line-height: 1.5; font-family: Helvetica, Arial, sans-serif;">Date: <strong>${formattedDate}</strong></td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding: 10px 15px;  padding-top: 20px;">
                                    <p style="font-size: 14px; font-weight: 400; line-height: 1.5; font-family: Helvetica, Arial, sans-serif;">
                                        <strong style="display: inline-block; margin-right: 5px;">Subject:</strong>
                                        <strong style="padding: 0; font-weight: bold;">${letter.template.template_subject}</strong>
                                        </p>
                                    </td>
                                </tr> 
                                ${sectionsContent} <!-- Insert sections here -->
                                <tr>
                                    <td colspan="2" style="padding: 10px 15px;  padding-top: 0px;">
                                        <div>
                                            <p style="margin: 0; font-size: 14px; font-weight: 400; line-height: 1.5;">Thanking you</p>
                                            <span style="margin-top: 30px; margin-bottom: 10px; display: block;">
                                            ${letter.signature_url
                    ? `
                                                           <img src="${letter.signature_url}" alt="Signature" style="width: 110px; height: auto;"/>`
                    : ''
                }
                                            </span>
                                            <p style="margin: 0 0 30px 0; font-size: 14px; font-weight: 400; font-family: Helvetica, Arial, sans-serif;">${letter.creator_name}<span style="display: block;">${letter.creator_designation}</span></p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2" style="text-align: center; padding: 10px 15px;  background-color: #313030; font-size: 14px; color: #fff;">
                                        <small>193/1 2nd Floor, MAHATAMA GANDI ROAD, KOLKATA - 700007, India</small> <br/>
                                        <small>Email : <a href="mailto:Saurabh@thegraphe.com" style="color: #faea13; text-decoration: none;">Saurabh@thegraphe.com</a></small>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </body>
                    </html>
            `,
        };

         // Send email
         await transporter.sendMail(mailOptions);

         return res.status(200).json({ message: 'Letter status updated and email sent successfully' });
        // Send the response
        res.json({ message: 'Letter confirmed', sectionsContent, formattedDate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// POST /api/letters/:letterId/resend
router.post('/resendletters/:letterId/resend', authenticateToken, async (req, res) => {
    const { letterId } = req.params;
    try {
        // Aggregation to find the letter, related template, and sections
        const letter = await SendLetter.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(letterId) } },
            {
                $lookup: {
                    from: 'lettertemplates', 
                    localField: 'template',
                    foreignField: '_id',
                    as: 'template',
                    pipeline: [
                        { $project: { template_name: 1, template_subject: 1 } }
                    ]
                }
            },
            {
                $unwind: { path: '$template', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'sendlettersections',
                    localField: 'send_letter_sections',
                    foreignField: '_id',
                    as: 'send_letter_sections',
                    pipeline: [
                        { $project: { section_heading: 1, section_body: 1, section_order: 1 } }
                    ]
                }
            },
            { $sort: { 'send_letter_sections.section_order': 1 } }
        ]);

        if (!letter || letter.length === 0) {
            return res.status(404).json({ error: 'Letter not found' });
        }

        // Extract letter details
        const letterData = letter[0];

        // Generate section content
        const sectionsContent = letterData.send_letter_sections
            .map(
                (section) => `
          <tr>
               <td colspan="2" style="padding: 10px 15px 0 15px;">
                   <div>
                       <h6 style="margin: 0 0 10px 0; line-height: 1.5; font-size: 14px; font-family: Helvetica, Arial, sans-serif; font-weight: 600;">${section.section_heading}</h6>
                       <p style="margin: 0 0 0px 0; font-size: 14px; font-weight: 400; line-height: 24px; font-family: Helvetica, Arial, sans-serif;">
                           ${section.section_body}
                       </p>
                   </div>
               </td>
           </tr>
       `
            )
            .join('');
        
        const formattedDate = letterData.createdAt
            ? new Date(letterData.createdAt).toLocaleDateString('en-GB')
            : 'Invalid Date';

        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: letter.user_email,
            subject: `Letter Subject: ${letter.template.template_subject}`,
            html: `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Employment Letter</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins&display=swap" rel="stylesheet">
                </head>
                <body style="margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
                    <table style="width: 100%; max-width: 680px; margin: 20px auto; padding: 0 15px; background-color: #ffffff; border: 0; border-collapse: collapse;" cellpadding="0" cellspacing="0">
                        <thead>
                            <tr>
                                <td style="padding: 10px 15px; ">
                                    <span style="display: block; padding-bottom: 20px;">
                                        <img src="https://ik.imagekit.io/blackboxv2/Graphe-logo/logo%20(1).png?updatedAt=1736238516981" alt="brand-logo" style="width: 120px;">
                                    </span>
                                </td>
                                <td style="padding: 10px 15px; text-align: right; float: right;">
                                        
                                            <p style="width: 280px; margin: 0; font-size: 14px; font-weight: 400; line-height: 1.5;">
                                                Godrej Genesis Building, 11th Floor, EN-34, EN Block, Sector V, Bidhannagar, Kolkata, <br/> West Bengal 700105
                                            </p>
                                        
                                    </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px 15px; ">
                                    <strong style="margin-bottom: 10px; display: block; font-family: Helvetica, Arial, sans-serif;">To,</strong>
                                    <p style="font-size: 14px; font-weight: 400; line-height: 1.5; font-family: Helvetica, Arial, sans-serif; margin-bottom:8px;"><strong>${letter.employee_name}</strong>,</p>
                                    <p style="font-size: 12px; font-weight: 400; line-height: 1.5; font-family: Helvetica, Arial, sans-serif; margin-bottom:0px;"><strong>${letter.user_email}</strong>,</p>
                                </td>
                                <td style="padding: 10px 15px;  text-align: right; font-size: 14px; font-weight: 400; line-height: 1.5; font-family: Helvetica, Arial, sans-serif;">Date: <strong>${formattedDate}</strong></td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 10px 15px;  padding-top: 20px;">
                                <p style="font-size: 14px; font-weight: 400; line-height: 1.5; font-family: Helvetica, Arial, sans-serif;">
                                    <strong style="display: inline-block; margin-right: 5px;">Subject:</strong>
                                    <strong style="padding: 0; font-weight: bold;">${letter.template.template_subject}</strong>
                                    </p>
                                </td>
                            </tr> 
                            ${sectionsContent} <!-- Insert sections here -->
                            <tr>
                                <td colspan="2" style="padding: 10px 15px;  padding-top: 0px;">
                                    <div>
                                        <p style="margin: 0; font-size: 14px; font-weight: 400; line-height: 1.5;">Thanking you</p>
                                        <span style="margin-top: 30px; margin-bottom: 10px; display: block;">
                                        ${letter.signature_url
                    ? `
                                                        <img src="${letter.signature_url}" alt="Signature" style="width: 110px; height: auto;"/>`
                    : ''
                }
                                        </span>
                                        <p style="margin: 0 0 30px 0; font-size: 14px; font-weight: 400; font-family: Helvetica, Arial, sans-serif;">${letter.creator_name}<span style="display: block;">${letter.creator_designation}</span></p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="text-align: center; padding: 10px 15px;  background-color: #313030; font-size: 14px; color: #fff;">
                                    <small>193/1 2nd Floor, MAHATAMA GANDI ROAD, KOLKATA - 700007, India</small> <br/>
                                    <small>Email : <a href="mailto:Saurabh@thegraphe.com" style="color: #faea13; text-decoration: none;">Saurabh@thegraphe.com</a></small>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </body>
                </html>
        `,

        };    
        await transporter.sendMail(mailOptions);
        // Respond to the client
        return res.status(200).json({ message: 'Letter resent successfully' });
        } catch (error) {
            console.error('Error resending letter:', error);
    return res.status(500).json({ error: 'An error occurred while resending the letter' });
    }
    });

module.exports = router;

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
        // Fetch all letter templates, including only template_id and template_name
        const templates = await LetterTemplate.find({}, 'template_name template_subject createdAt updatedAt');

        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching letter templates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// Add or edit SendLetter
router.post('/send-letter', authenticateToken, async (req, res) => {
    let session;

    try {
        const {
            send_letter_id, // Optional for editing
            template_id,
            user_id,
            user_email,
            employee_name,
            joining_date,
            designation_offered,
            body,
            signature_url,
            creator_name,
            creator_designation,
        } = req.body;

        // Validate required fields for both create and edit
        if (!template_id || !user_email || !employee_name || !designation_offered || !body) {
            return res.status(400).json({ message: 'Required fields are missing.' });
        }

        // Start a session for the transaction
        session = await mongoose.startSession();
        session.startTransaction();

        let sendLetter;

        if (send_letter_id) {
            // Editing an existing SendLetter
            sendLetter = await SendLetter.findById(send_letter_id).session(session);

            if (!sendLetter) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'SendLetter not found.' });
            }

            // Update fields except for status
            sendLetter.template_id = template_id;
            sendLetter.user_id = user_id;
            sendLetter.user_email = user_email;
            sendLetter.employee_name = employee_name;
            sendLetter.joining_date = joining_date;
            sendLetter.designation_offered = designation_offered;
            sendLetter.body = body;
            sendLetter.signature_url = signature_url;

            await sendLetter.save({ session });
        } else {
            // Creating a new SendLetter
            sendLetter = new SendLetter({
                template_id,
                user_id,
                user_email,
                employee_name,
                joining_date,
                designation_offered,
                body,
                signature_url,
                creator_name,
                creator_designation,
                status: 'Generated', // Default status for new entries
            });

            await sendLetter.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();
        res.status(200).json({
            message: send_letter_id
                ? 'SendLetter updated successfully!'
                : 'SendLetter created successfully!',
            data: sendLetter,
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        if (session) await session.abortTransaction();
        console.error(error);
        res.status(500).json({
            message: 'Failed to process SendLetter.',
            error: error.message,
        });
    } finally {
        // Ensure the session is properly ended
        if (session) {
            session.endSession();
        }
    }
});




// Delete a SendLetter
router.delete('/send-letter/:id', authenticateToken, async (req, res) => {
    let session;

    try {
        const { id } = req.params;

        // Start a session for the transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Find the SendLetter by ID
        const sendLetter = await SendLetter.findById(id).session(session);

        if (!sendLetter) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'SendLetter not found.' });
        }

        // Check the status of the SendLetter
        if (sendLetter.status !== 'Generated') {
            await session.abortTransaction();
            return res.status(400).json({
                message: 'SendLetter cannot be deleted because its status is not "Generated".',
            });
        }

        // Delete the SendLetter
        await sendLetter.remove({ session });

        // Commit the transaction
        await session.commitTransaction();

        res.status(200).json({
            message: 'SendLetter deleted successfully!',
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        if (session) await session.abortTransaction();
        console.error('Error deleting SendLetter:', error);
        res.status(500).json({
            message: 'Failed to delete SendLetter.',
            error: error.message,
        });
    } finally {
        // Ensure the session is properly ended
        if (session) {
            session.endSession();
        }
    }
});




// Fetch all SendLetters grouped by unique employee_name
router.get('/fetch-send-letters', authenticateToken, async (req, res) => {
    try {
        // Fetch SendLetters with user details and profile images
        const sendLetters = await SendLetter.find()
            .populate({
                path: 'user', // Populate the 'user' field in SendLetter
                select: 'user_id first_name last_name email user_type', // Include specific user fields
                populate: {
                    path: 'profileImage', // Populate the 'profileImage' field in User
                    select: 'image_url', // Only include the URL of the profile image
                },
            })
            .sort({ employee_name: 1 }); // Order by employee_name in ascending order

        // Group by employee_name
        const groupedLetters = {};
        const noUserLetters = []; // To hold letters where user is not present

        sendLetters.forEach((letter) => {
            const employeeName = letter.employee_name;

            if (letter.user) {
                // If `user` exists, group by employee_name
                if (!groupedLetters[employeeName]) {
                    groupedLetters[employeeName] = {
                        employee_name: employeeName,
                        user: letter.user, // Set the user data for the group
                        letters: [],
                    };
                }

                // If a user is already set, skip overwriting it
                groupedLetters[employeeName].user = groupedLetters[employeeName].user || letter.user;

                groupedLetters[employeeName].letters.push(letter);
            } else {
                // If `user` does not exist, add it as an individual record
                noUserLetters.push({
                    employee_name: employeeName,
                    user: null, // No user data
                    letters: [letter],
                });
            }
        });

        // Combine grouped letters and no-user letters
        const result = [...Object.values(groupedLetters), ...noUserLetters];

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching send letters:', error);
        res.status(500).json({ error: 'Failed to fetch send letters' });
    }
});









module.exports = router;
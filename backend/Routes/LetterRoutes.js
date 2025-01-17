
const express = require('express');
const multer = require('multer');
const ImageKit = require('imagekit');
const LetterTemplate = require('../Models/Letter_template'); // Import LetterTemplate model and sequelize instance
const SendLetter = require('../Models/SendLetter'); // Adjust the path to your model
const ProfileImage = require('../Models/ProfileImage'); // Adjust the path as necessary
const User = require('../Models/User'); // Adjust the path as necessary
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();


const mongoose = require('mongoose');

// Initialize ImageKit
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


// Create or Update Letter Template with ImageKit fileId
router.post('/letter-template', authenticateToken, upload.single('signature_image'), async (req, res) => {
    let session;
    try {
        const {
            template_id, // If provided, it indicates an edit; if not, it's a new entry
            template_name,
            template_subject,
            template_body
        } = req.body;

        let signature_url = null;
        let signature_file_id = null; // To store ImageKit fileId for future deletions

        // Start a session for transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Check if a new signature image is provided
        if (req.file) {
            if (template_id) {
                const existingTemplate = await LetterTemplate.findById(template_id).session(session);
                if (existingTemplate && existingTemplate.signature_file_id) {
                    await deleteOldImage(existingTemplate.signature_file_id); // Delete old image using fileId
                }
            }

            // Convert the uploaded file to base64 for ImageKit
            const encodedImage = req.file.buffer.toString('base64');

            // Upload the new image to ImageKit
            const uploadResponse = await imagekit.upload({
                file: encodedImage,
                fileName: `${template_name}_signature`,
                folder: '/signature-documents',
            });

            signature_url = uploadResponse.url;
            signature_file_id = uploadResponse.fileId; // Store ImageKit fileId
        }

        if (template_id) {
            const template = await LetterTemplate.findById(template_id).session(session);
            if (!template) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'Template not found' });
            }

            // Update the template
            template.template_name = template_name;
            template.template_subject = template_subject;
            template.template_body = template_body;
            template.signature_url = signature_url || template.signature_url;
            template.signature_file_id = signature_file_id || template.signature_file_id;

            await template.save({ session });

            await session.commitTransaction();
            return res.status(200).json({ message: 'Template updated successfully', template });
        }

        // Create a new template
        const newTemplate = new LetterTemplate({
            template_name,
            template_subject,
            template_body,
            signature_url,
            signature_file_id,
        });

        await newTemplate.save({ session });
        await session.commitTransaction();
        return res.status(201).json({ message: 'Template created successfully', newTemplate });

    } catch (error) {
        // Rollback the transaction in case of an error
        if (session) await session.abortTransaction();
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        // Ensure the session is properly ended
        if (session) {
            session.endSession();
        }
    }
});




// Fetch all letter templates
router.get('/fetchallletters', authenticateToken, async (req, res) => {
    try {
        const templates = await LetterTemplate.find(
            {}, // Empty filter to fetch all documents
            'template_id template_name template_subject createdAt updatedAt' // Select specific fields
        );

        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching letter templates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Duplicate a letter template
router.post('/duplicate-letter-template', authenticateToken, async (req, res) => {
    const { template_id } = req.body;

    let session;

    try {
        // Start a session for transaction handling
        session = await LetterTemplate.startSession();
        session.startTransaction();

        // Find the existing template by template_id
        const existingTemplate = await LetterTemplate.findById(template_id).session(session);

        if (!existingTemplate) {
            await session.abortTransaction(); // Abort transaction if template not found
            return res.status(404).json({ message: 'Template not found' });
        }

        // Create a new duplicated template
        const duplicatedTemplate = new LetterTemplate({
            template_name: `${existingTemplate.template_name} copy`,
            template_subject: existingTemplate.template_subject,
            template_body: existingTemplate.template_body,
            signature_url: null, // Exclude signature details for the duplicated template
            signature_file_id: null,
        });

        await duplicatedTemplate.save({ session });

        // Commit the transaction
        await session.commitTransaction();

        return res.status(201).json({
            message: 'Template duplicated successfully',
            duplicatedTemplate,
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        if (session) await session.abortTransaction();
        console.error('Error duplicating template:', error);
        return res.status(500).json({ message: 'Failed to duplicate template' });
    } finally {
        // Ensure the session is properly ended
        if (session) {
            session.endSession();
        }
    }
});



// Delete a letter template
router.delete('/letter-template-delete', authenticateToken, async (req, res) => {
    const { template_id } = req.body;
    let session;

    try {
        // Start a session for transaction handling
        session = await LetterTemplate.startSession();
        session.startTransaction();

        // Find the existing template by template_id
        const existingTemplate = await LetterTemplate.findById(template_id).session(session);

        if (!existingTemplate) {
            await session.abortTransaction(); // Abort transaction if template not found
            return res.status(404).json({ message: 'Template not found' });
        }

        // Delete associated image if it exists
        if (existingTemplate.signature_file_id) {
            try {
                // Delete the image from ImageKit using the fileId
                await imagekit.deleteFile(existingTemplate.signature_file_id);
            } catch (imageError) {
                console.error('Error deleting image from ImageKit:', imageError);

                // Rollback transaction on ImageKit deletion error
                await session.abortTransaction();
                return res.status(500).json({ message: 'Error deleting image from ImageKit' });
            }
        }

        // Delete the template
        await existingTemplate.deleteOne({ session });

        // Commit the transaction
        await session.commitTransaction();

        return res.status(200).json({ message: 'Template and associated image deleted successfully' });
    } catch (error) {
        // Rollback the transaction in case of an error
        if (session) await session.abortTransaction();
        console.error('Error deleting letter template:', error);
        return res.status(500).json({ message: 'Failed to delete template' });
    } finally {
        // Ensure the session is properly ended
        if (session) {
            session.endSession();
        }
    }
});




// Fetch a letter template by ID
// View a single letter template by ID
router.get('/viewallletters/:template_id', authenticateToken, async (req, res) => {
    try {
        const { template_id } = req.params;

        // Find the letter template by its ID
        const template = await LetterTemplate.findById(template_id);

        if (!template) {
            return res.status(404).json({ message: 'Letter template not found' });
        }

        res.status(200).json(template);

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
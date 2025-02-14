const mongoose = require('mongoose');
const Projects = require('../Models/Projects');
const Notification = require('../Models/Notification');
const User = require('../Models/User');
const Brand = require('../Models/Brand');

const changeStream = Projects.watch([
    { $match: { operationType: 'insert' } }
]);

changeStream.on('change', async (change) => {
    const newProject = change.fullDocument;
    try {
        const brandDetails = await Brand.findById(newProject.brand_id);
        for (let memberId of newProject.member_id) {
            const user = await User.findById(memberId);
            if (user) {
                const notification = new Notification({
                    user_id: user._id,
                    notification_type: 'Project Assignment',
                    message: `Hi ${user.first_name} ${user.last_name}, You have been added to the project "${newProject.project_name}" as a Project Member for the brand "${brandDetails.brand_name}".`
                });
                await notification.save();
                console.log('Notification created successfully for user:', user.first_name);
            }
        }
    } catch (error) {
        console.error('Error creating notification:', error);
    }
});

process.on('SIGINT', () => {
    changeStream.close();
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit();
});
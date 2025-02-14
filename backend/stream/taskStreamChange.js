const mongoose = require('mongoose');
const Notification = require('../Models/Notification');
const User = require('../Models/User');
const Tasks = require('../Models/Tasks');

const taskStreamChange = Tasks.watch([
    { $match: { operationType: 'insert' } }
]);

taskStreamChange.on('change', async (change) => {
    const newTask = change.fullDocument;

    try {
        const user = await User.findById(newTask.task_user_id);
        if (user) {
            const deadline = new Date(newTask.task_deadline);
            const formattedDeadline = deadline.toISOString().split('T')[0];

            const notification = new Notification({
                user_id: user._id,
                notification_type: 'Task Assignment',
                message: `Hi ${user.first_name} ${user.last_name}, A task "${newTask.task_name}" has been assigned to you with a deadline of "${formattedDeadline}".`
            });

            await notification.save();
            console.log('Notification created successfully for user:', user.first_name);
        }
    } catch (error) {
        console.error('Error creating notification:', error);
    }
});

process.on('SIGINT', () => {
    taskStreamChange.close();
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit();
});

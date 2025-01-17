const cron = require('node-cron');
const { Op } = require('sequelize');
const Task = require('../models/Tasks'); // Adjust path if needed

const checkTaskDeadlines = () => {
    // Schedule a task to run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        try {
            const now = new Date();

            // Fetch tasks with status 'inProgress' or 'inReview' that haven't already missed the deadline
            const tasks = await Task.findAll({
                where: {
                    status: {
                        [Op.in]: ['inProgress']
                    },
                    missed_deadline: false,
                    task_deadline: {
                        [Op.lte]: now // Check if the deadline is less than or equal to the current time
                    }
                }
            });

            // Update the missed_deadline flag for the tasks that missed their deadline
            for (const task of tasks) {
                task.missed_deadline = true;
                await task.save();
            }

            console.log(`Checked and updated deadlines at: ${now}`);

        } catch (error) {
            console.error('Error in checking task deadlines:', error);
        }
    });
};

module.exports = checkTaskDeadlines;

const cron = require('node-cron');
const { Op } = require('sequelize');
const Subtask = require('../models/Subtask'); // Adjust path if needed
const Task = require('../models/Tasks'); // Adjust path if needed

const checkSubtaskDeadlines = () => {
    // Schedule a task to run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        try {
            const now = new Date();

            // Step 1: Fetch subtasks that are in 'InProgress' status and have missed their deadlines
            const subtasks = await Subtask.findAll({
                where: {
                    status: {
                        [Op.in]: ['InProgress'] // Only subtasks with this status
                    },
                    missed_deadline: false,  // Not yet flagged as missed
                    sub_task_deadline: {
                        [Op.lte]: now // Deadline is less than or equal to the current time
                    }
                }
            });

            if (subtasks.length > 0) {
                // Extract task IDs from subtasks
                const taskIds = subtasks.map(subtask => subtask.task_id);

                // Step 2: Fetch tasks that are in 'inProgress' or 'inChanges' status
                const tasks = await Task.findAll({
                    where: {
                        task_id: {
                            [Op.in]: taskIds // Fetch only the tasks related to subtasks
                        },
                        status: {
                            [Op.in]: ['inProgress', 'inChanges'] // Task status must be inProgress or inChanges
                        }
                    }
                });

                // Get valid task IDs
                const validTaskIds = tasks.map(task => task.task_id);

                // Step 3: Update subtasks that belong to tasks with valid statuses
                for (const subtask of subtasks) {
                    if (validTaskIds.includes(subtask.task_id)) {
                        subtask.missed_deadline = true; // Set missed_deadline to true
                        await subtask.save();
                    }
                }
            }

            console.log(`Checked and updated subtask deadlines at: ${now}`);

        } catch (error) {
            console.error('Error in checking subtask deadlines:', error);
        }
    });
};

module.exports = checkSubtaskDeadlines;

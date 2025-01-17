const cron = require('node-cron');
const { Op } = require('sequelize');
const User = require('../models/User');
const Task = require('../models/Tasks');
const SubTask = require('../models/Subtask');
const TaskSheet = require('../models/Tasksheets'); // Fixed model name

const taskSheetCronJob = () => {
    // Schedule a task to run at 23:50 local time every Monday to Friday (weekdays)
    // cron.schedule('50 23 * * 1-5', async () => {
        cron.schedule('55 20 * * 1-5', async () => {

        console.log('Cron job triggered:', new Date().toLocaleString());

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        // Calculate the previous day
        const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        let previousDay = new Date(today);

        if (dayOfWeek === 1) {
            // If today is Monday, set previousDay to Friday
            previousDay.setDate(today.getDate() - 3);
        } else {
            // Otherwise, set previousDay to the previous calendar day
            previousDay.setDate(today.getDate() - 1);
        }

        const previousFormattedDate = previousDay.toISOString().split('T')[0];

        try {
            // Fetch users with user_type 'Employee'
            const employees = await User.findAll({
                where: { user_type: 'Employee' }
            });

            console.log(`Number of employees fetched: ${employees.length}`);

            for (const employee of employees) {
                const userId = employee.user_id;

                // Fetch subtasks assigned to this user with status 'InProgress' or 'Completed'
                const subtasks = await SubTask.findAll({
                    where: {
                        sub_task_user_id: userId,
                        status: {
                            [Op.in]: ['InProgress', 'Completed']
                        }
                    }
                });

                console.log(`Number of subtasks for user ${userId}: ${subtasks.length}`);

                for (const subtask of subtasks) {
                    const task = await Task.findOne({
                        where: { task_id: subtask.task_id }
                    });

                    // Check if the task already exists in TaskSheet for the previous day
                    const taskExists = await TaskSheet.findOne({
                        where: {
                            user_id: userId,
                            task_id: task.task_id,
                            tasksheet_date: previousFormattedDate,
                            [Op.or]: [
                                { task_status: 'completed' },  // Condition 1: Task is completed
                                {
                                    [Op.or]: [  // Condition 2: Task is inactive or on hold
                                        { task_is_active: false },
                                        { task_on_hold: true }
                                    ]
                                }
                            ]
                        }
                    });

                    // If task does not already exist, create a new TaskSheet entry
                    if (!taskExists) {
                        await TaskSheet.create({
                            user_id: userId,
                            task_id: task.task_id,
                            tasksheet_date: formattedDate,
                            project_id: task.project_id,
                            project_name: task.project_name,
                            brand_name: task.brand_name,
                            task_name: task.task_name,
                            task_description: task.task_description,
                            task_deadline: task.task_deadline,
                            task_leader_name: task.lead_name,
                            task_missed_deadline: task.missed_deadline,
                            task_department: task.department,
                            task_status: task.status,
                            task_is_active: task.is_active,
                            task_on_hold: task.on_hold,
                            subtask_id: subtask.subtask_id,
                            Subtask_name: subtask.subtask_name,
                            subtask_desc: subtask.sub_task_description,
                            Project_role_name: subtask.project_role_name,
                            Subtask_deadline: subtask.sub_task_deadline,
                            Subtask_username: subtask.sub_task_username,
                            Subtask_missed_deadline: subtask.missed_deadline,
                            Subtask_status: subtask.status
                        });

                        console.log(`TaskSheet entry created for user ${userId} and subtask ${subtask.subtask_id}`);
                    } else {
                        console.log(`Task already exists for user ${userId} and task ${task.task_id} on ${previousFormattedDate}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error running the cron job:', error);
        }
    });
};

module.exports = taskSheetCronJob;


const Subtask = require('../models/Subtask'); // Ensure path is correct
const User = require('../models/User'); // Ensure path is correct
const { Op } = require('sequelize'); // For advanced querying

// Function to perform performance analysis for a specific user, month, and year
async function analyzePerformance(userId, month, year) {
    try {
        // Fetch the user by ID
        const user = await User.findOne({
            where: {
                user_id: userId
            }
        });

        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Define the start and end dates for the specified month and year
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month

        // Fetch all subtasks for the user within the specified month and year
        const subtasks = await Subtask.findAll({
            where: {
                sub_task_user_id: userId,
                [Op.or]: [
                    {
                        sub_task_deadline: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        created_at: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                ]
            }
        });

        if (subtasks.length === 0) {
            // Handle case where no subtasks are found
            return {
                user_id: userId,
                Name: null,
                totalSubtasks: 0,
                completedSubtasks: 0,
                onTimeSubtasks: 0,
                missedDeadlines: 0,
                subtasksByDate: {}, // Combined result
                todoSubtasks: 0,
                inProgressSubtasks: 0,
                startedSubtasks: 0,
                inactiveSubtasks: 0,
                completionRate: 0,
                missedDeadlineRate: 0,
                averageCompletionTime: 0
            };
        }

        // Initialize metrics
        const totalSubtasks = subtasks.length;
        const completedSubtasks = subtasks.filter(subtask => subtask.status === 'Completed').length;
        const onTimeSubtasks = subtasks.filter(subtask => subtask.status === 'Completed' && !subtask.missed_deadline).length;
        const missedDeadlines = subtasks.filter(subtask => subtask.missed_deadline).length;

        const todoSubtasks = subtasks.filter(subtask => subtask.status === 'Todo').length;
        const inProgressSubtasks = subtasks.filter(subtask => subtask.status === 'InProgress').length;
        const startedSubtasks = subtasks.filter(subtask => subtask.status === 'Started').length;
        const inactiveSubtasks = subtasks.filter(subtask => !subtask.is_active).length;

        // Calculate missed deadlines and completed subtasks by date, and merge them
        const subtasksByDate = subtasks.reduce((acc, subtask) => {
            let dateKey = null;

            if (subtask.missed_deadline && subtask.sub_task_deadline) {
                dateKey = subtask.sub_task_deadline.toISOString().split('T')[0];
            } else if (subtask.status === 'Completed' && subtask.updated_at) {
                dateKey = subtask.updated_at.toISOString().split('T')[0];
            }

            if (dateKey) {
                if (!acc[dateKey]) {
                    acc[dateKey] = { missedDeadlines: 0, completedSubtasks: 0 };
                }

                if (subtask.missed_deadline) {
                    acc[dateKey].missedDeadlines += 1;
                }

                if (subtask.status === 'Completed') {
                    acc[dateKey].completedSubtasks += 1;
                }
            }

            return acc;
        }, {});

        // Calculate average completion time for completed subtasks
        const totalCompletionTime = subtasks.reduce((total, subtask) => {
            if (subtask.status === 'Completed' && subtask.updated_at) {
                const completionTime = (new Date(subtask.updated_at) - new Date(subtask.created_at)) / (1000 * 60 * 60); // in hours
                return total + completionTime;
            }
            return total;
        }, 0);

        const averageCompletionTime = completedSubtasks > 0 ? totalCompletionTime / completedSubtasks : 0;

        // Assume all subtasks have the same username
        const username = subtasks[0].sub_task_username;

        const performanceData = {
            user_id: userId,
            Name: username,
            totalSubtasks,
            completedSubtasks,
            onTimeSubtasks,
            missedDeadlines,
            subtasksByDate, // Combined missed deadlines and completed subtasks by date
            todoSubtasks,
            inProgressSubtasks,
            startedSubtasks,
            inactiveSubtasks,
            completionRate: (totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100),
            missedDeadlineRate: (totalSubtasks === 0 ? 0 : (missedDeadlines / totalSubtasks) * 100),
            averageCompletionTime // Average time taken to complete subtasks
        };

        // Return the performance data
        return performanceData;

    } catch (error) {
        console.error('Error analyzing performance:', error);
        throw error;
    }
}

module.exports = analyzePerformance;

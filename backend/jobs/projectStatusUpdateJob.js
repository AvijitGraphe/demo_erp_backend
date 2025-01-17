const cron = require('node-cron');
const { Op } = require('sequelize');
const Projects = require('../models/Projects');
const Tasks = require('../models/Tasks');

const updateProjectStatusCronJob = () => {
    // Schedule the cron job to run every hour
    // cron.schedule('*/10 * * * *', async () => {
        cron.schedule('50 23 * * 1-5', async () => {
        console.log('Cron job triggered:', new Date().toLocaleString());

        try {
            // Find all projects with active tasks
            const projectsWithTasks = await Projects.findAll({
                include: {
                    model: Tasks,
                    as: 'tasks', // This should match the alias used in the Projects model definition
                    where: { is_active: true },
                    required: true
                }
            });

            const currentDate = new Date();

            for (const project of projectsWithTasks) {
                // Calculate total_time if not already present
                if (!project.total_time && project.start_date && project.end_date) {
                    const startDate = new Date(project.start_date);
                    const endDate = new Date(project.end_date);

                    // Calculate the difference in days
                    let daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

                    // Ensure the difference is at least one day if the start and end dates are the same
                    if (daysDiff === 0) {
                        daysDiff = 1;
                    }

                    // Calculate total working hours (9 hours per day)
                    const totalTime = daysDiff * 9;

                    // Update the project's total_time
                    project.total_time = totalTime;
                    await project.save();

                    console.log(`Project ID: ${project.project_id} - total_time updated to: ${totalTime}`);
                }
                // Check if the project is 'On Time' and has active tasks
                if (project.status === 'On Time') {
                    project.status = 'In Progress';
                    await project.save();

                    console.log(`Project ID: ${project.project_id} - status updated to: In Progress`);
                }

                // Check if the project has missed the deadline,
                // and ensure its status is neither 'Completed' nor 'On Hold'
                if (project.end_date && new Date(project.end_date) <= currentDate &&
                    project.status !== 'Completed' && project.status !== 'On Hold') {
                    project.status = 'Missed';
                    await project.save();

                    console.log(`Project ID: ${project.project_id} - status updated to: Missed`);
                }
            }

            console.log('Project status and total time updated successfully!');

        } catch (error) {
            console.error('Error updating project status and total time:', error);
        }
    });
};

module.exports = updateProjectStatusCronJob;

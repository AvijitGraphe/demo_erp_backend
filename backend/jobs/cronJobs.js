// cronJobs.js
const cron = require('node-cron');
const sequelize = require('../config/database');
const Attendance = require('../models/Attendance'); // Adjust the path to your Attendance model


const setupCronJobs = () => {
    // Schedule a task to run at 23:50 local time every day
    cron.schedule('51 23 * * *', async () => {
        console.log('Running automated checkout process...');
        try {
            const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format

            // Fetch users who haven't checked out yet
            const usersToCheckOut = await Attendance.findAll({
                where: {
                    end_time: null,
                    date: currentDate
                }
            });

            for (const user of usersToCheckOut) {
                const startTime = user.start_time;
                let totalTime = null;
                let endTime = null;

                if (startTime) {
                    // Calculate end time by adding 9 hours to start time
                    const startDateTime = new Date(`${currentDate}T${startTime}`);
                    const endDateTime = new Date(startDateTime.getTime() + 9 * 60 * 60 * 1000);
                    endTime = endDateTime.toTimeString().split(' ')[0]; // Get end time in HH:MM:SS format

                    const [result] = await sequelize.query(`
                        SELECT 
                            SEC_TO_TIME(SUM(TIME_TO_SEC(:endTime) - TIME_TO_SEC(:startTime))) AS total_time
                        FROM 
                            Attendance
                        WHERE 
                            user_id = :userId
                            AND date = :date
                    `, {
                        replacements: { userId: user.user_id, date: currentDate, startTime, endTime },
                        type: sequelize.QueryTypes.SELECT
                    });

                    totalTime = result.total_time;
                }

                // Update the attendance record
                const updateObj = { end_time: endTime };
                if (totalTime) {
                    updateObj.total_time = totalTime;
                }

                await Attendance.update(updateObj, {
                    where: { user_id: user.user_id, date: currentDate }
                });

                console.log(`User ${user.user_id} checked out automatically at ${endTime}`);
            }

            console.log('Automated checkout process completed');
        } catch (error) {
            console.error('Error during automated checkout:', error);
        }
    });
};

module.exports = setupCronJobs;

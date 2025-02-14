const cron = require('node-cron');
const Tasks = require('../Models/Tasks');

const TaskDeadlineJob = () => {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      const currentDate = new Date(now.setHours(0, 0, 0, 0));
      const updatedTasks = await Tasks.updateMany(
        {
          status: { $in: ['InProgress', 'InChanges'] },
          task_deadline: { $lt: currentDate },
          missed_deadline: false,
        },
        { $set: { missed_deadline: true } }
      );
    } catch (error) {
      console.error('Error checking task deadlines:', error);
    }
  });
};

module.exports = TaskDeadlineJob;

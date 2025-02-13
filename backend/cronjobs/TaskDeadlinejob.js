const cron = require('node-cron');
const Tasks = require('../Models/Tasks');

const TaskDeadlineJob = () => {
  cron.schedule('*/2 * * * *', async () => {
    try {
      const now = new Date();

      const updatedTasks = await Tasks.updateMany(
        {
          status: { $in: ['InProgress', 'InChanges'] },
          task_deadline: { $lt: now },
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

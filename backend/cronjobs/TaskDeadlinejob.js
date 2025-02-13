const cron = require('node-cron');
const Tasks = require('../Models/Tasks');

const TaskDeadlineJob = () => {
  cron.schedule('*/2 * * * *', async () => {
    try {
      const now = new Date();
      console.log("now",now)
      const updatedTasks = await Tasks.updateMany(
        {
          status: { $in: ['InProgress', 'InChanges'] },
          task_deadline: { $lt: now },
          missed_deadline: false,
        },
        { $set: { missed_deadline: true } }
      );
      console.log(`${updatedTasks.nModified} tasks updated for missed deadlines.`);
    } catch (error) {
      console.error('Error checking task deadlines:', error);
    }
  });
};
module.exports = TaskDeadlineJob;

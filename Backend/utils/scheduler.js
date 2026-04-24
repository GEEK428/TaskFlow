const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const initScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        // Force IST Timezone (Asia/Kolkata) for accurate local reminders
        const currentTime = now.toLocaleTimeString('en-GB', { 
            timeZone: 'Asia/Kolkata', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        try {
            // Find users who have a reminder set for this exact minute
            const users = await User.find({ reminderTime: currentTime });
            
            for (const user of users) {
                // Get pending tasks for the user
                const pendingTasks = await Task.find({ 
                    user: user._id, 
                    status: { $ne: 'Done' } 
                }).sort({ deadline: 1 });

                if (pendingTasks.length > 0) {
                    const taskList = pendingTasks.map(t => `- ${t.title} (Due: ${new Date(t.deadline).toLocaleDateString()})`).join('\n');
                    const title = 'TaskFlow Intel: Pending Actions';
                    const message = `You have ${pendingTasks.length} pending tasks. Please check your dashboard for details.\n\nTopics:\n${pendingTasks.map(t => `- ${t.title}`).join('\n')}`;

                    // 1. Create In-App Notification
                    await Notification.create({
                        user: user._id,
                        type: 'daily_reminder',
                        title,
                        message: `System Alert: You have ${pendingTasks.length} tasks waiting. Check your dashboard.`
                    });
                }
            }
        } catch (err) {
            console.error('Scheduler Error:', err.message);
        }

        // --- Notification Self-Cleaning Logic ---
        try {
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // 1. Purge READ notifications after 1 minute
            const readPurge = await Notification.deleteMany({
                read: true,
                updatedAt: { $lt: oneMinuteAgo }
            });

            // 2. Purge UNREAD notifications after 24 hours
            const unreadPurge = await Notification.deleteMany({
                read: false,
                createdAt: { $lt: twentyFourHoursAgo }
            });

            if (readPurge.deletedCount > 0 || unreadPurge.deletedCount > 0) {
                console.log(`[Scheduler] Purged ${readPurge.deletedCount} read and ${unreadPurge.deletedCount} unread notifications.`);
            }
        } catch (purgeErr) {
            console.error('Notification Purge Error:', purgeErr.message);
        }
    });
};

module.exports = initScheduler;

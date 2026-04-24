const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private
 */
exports.createTask = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Get all user tasks
 * @route   GET /api/tasks
 * @access  Private
 */
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get task stats for dashboard
 * @route   GET /api/tasks/stats
 * @access  Private
 */
exports.getTaskStats = async (req, res) => {
    try {
        const total = await Task.countDocuments({ user: req.user.id });
        const pending = await Task.countDocuments({ user: req.user.id, status: { $ne: 'Done' } });
        const completed = await Task.countDocuments({ user: req.user.id, status: 'Done' });
        const overdue = await Task.countDocuments({ 
            user: req.user.id, 
            status: { $ne: 'Done' },
            deadline: { $lt: new Date() }
        });

        res.json({ total, pending, completed, overdue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update task status/details
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
exports.updateTask = async (req, res) => {
    try {
        const { status } = req.body;
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        const previousStatus = task.status;
        
        // If status is being changed to Done
        if (status === 'Done' && previousStatus !== 'Done') {
            const now = new Date();
            const isLate = now > new Date(task.deadline);
            
            req.body.completedAt = now;
            req.body.isLate = isLate;

            if (!isLate) {
                // On-time: +4 Score, +1 OnTimeCount
                await User.findByIdAndUpdate(req.user.id, { 
                    $inc: { score: 4, onTimeCount: 1 } 
                });
                await Notification.create({
                    user: req.user.id,
                    type: 'task_completed',
                    title: 'Elite Precision! +4',
                    message: `Perfect! "${task.title}" completed on time. You earned 4 points.`
                });
            } else {
                // Late: -1 Score
                await User.findByIdAndUpdate(req.user.id, { 
                    $inc: { score: -1 } 
                });
                await Notification.create({
                    user: req.user.id,
                    type: 'task_completed',
                    title: 'Late Completion',
                    message: `Task "${task.title}" was late. 1 point deducted.`
                });
            }
        } 
        // If status was Done but moving back, reverse the score change
        else if (status !== 'Done' && previousStatus === 'Done') {
            if (!task.isLate) {
                await User.findByIdAndUpdate(req.user.id, { 
                    $inc: { score: -4, onTimeCount: -1 } 
                });
            } else {
                await User.findByIdAndUpdate(req.user.id, { 
                    $inc: { score: 1 } 
                });
            }
            req.body.completedAt = null;
            req.body.isLate = false;
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

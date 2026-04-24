const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskStats, updateTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getTasks)
    .post(createTask);

router.get('/stats', getTaskStats);

router.put('/:id', updateTask);

module.exports = router;

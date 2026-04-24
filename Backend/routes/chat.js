const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

/**
 * @route   GET /api/chat
 * @desc    Get user chat history
 * @access  Private
 */
router.get('/', protect, chatController.getHistory);

/**
 * @route   POST /api/chat
 * @desc    Send message and get streaming response
 * @access  Private
 */
router.post('/', protect, chatController.sendMessage);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getLeaderboard, getMyRank } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeaderboard);
router.get('/me', getMyRank);

module.exports = router;

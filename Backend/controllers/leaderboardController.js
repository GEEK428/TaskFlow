const User = require('../models/User');

/**
 * @desc    Get Top 50 leaderboard rankings
 * @route   GET /api/leaderboard
 * @access  Private
 */
exports.getLeaderboard = async (req, res) => {
    try {
        // Sort by: Score (DESC), OnTimeCount (DESC), Name (ASC)
        const leaderboard = await User.find()
            .select('name avatar score onTimeCount')
            .sort({ score: -1, onTimeCount: -1, name: 1 })
            .limit(50);
        
        const totalUsers = await User.countDocuments();

        res.json({
            leaderboard,
            totalUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get my rank
 * @route   GET /api/leaderboard/me
 * @access  Private
 */
exports.getMyRank = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('score onTimeCount name');
        
        // Find how many users are ranked ABOVE the current user
        // Criteria: 
        // 1. Better Score
        // 2. Same Score, but Better onTimeCount
        // 3. Same Score, Same onTimeCount, but Lexicographically smaller name
        const higherScorers = await User.countDocuments({
            $or: [
                { score: { $gt: user.score } },
                { score: user.score, onTimeCount: { $gt: user.onTimeCount } },
                { score: user.score, onTimeCount: user.onTimeCount, name: { $lt: user.name } }
            ]
        });

        const rank = higherScorers + 1;
        const totalUsers = await User.countDocuments();

        res.json({
            rank,
            score: user.score,
            onTimeCount: user.onTimeCount,
            totalUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Token Blacklist Model
 * Stores revoked JWT tokens until they naturally expire.
 * Uses MongoDB TTL (Time To Live) index for automatic cleanup.
 */

const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// TTL Index: Automatically delete the document when the current time reaches expiresAt
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Blacklist', blacklistSchema);

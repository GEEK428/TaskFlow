const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'assistant'],
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    updatedAt: {
        type: Date,
        default: Date.now,
        index: { expires: '7d' } // TTL: Chat history disappears after 7 days of inactivity
    }
});

module.exports = mongoose.model('Chat', ChatSchema);

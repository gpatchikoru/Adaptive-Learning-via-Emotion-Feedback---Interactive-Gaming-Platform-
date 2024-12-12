const mongoose = require('mongoose');

const emotionLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    emotion: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    imageData: {
        type: String  // Base64 encoded image data
    }
});

module.exports = mongoose.model('EmotionLog', emotionLogSchema);
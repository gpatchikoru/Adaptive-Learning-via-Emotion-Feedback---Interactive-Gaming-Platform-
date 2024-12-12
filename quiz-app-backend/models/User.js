const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    scores: [{
        quiz: Number,
        typing: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('User', userSchema);

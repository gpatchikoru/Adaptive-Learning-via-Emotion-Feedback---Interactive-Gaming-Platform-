const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// User Schema
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

const User = mongoose.model('User', userSchema);

// Test route to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Login route
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body); // Debug log
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('User not found:', username); // Debug log
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', username); // Debug log
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', username); // Debug log
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize admin and default users
const initializeUsers = async () => {
    try {
        // Create admin if doesn't exist
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created');
        }

        // Create default users if they don't exist
        const defaultUsers = ['user1', 'user2', 'user3'];
        for (const username of defaultUsers) {
            const userExists = await User.findOne({ username });
            if (!userExists) {
                const hashedPassword = await bcrypt.hash('user123', 10);
                await User.create({
                    username,
                    password: hashedPassword,
                    role: 'user'
                });
                console.log(`Default user ${username} created`);
            }
        }
    } catch (error) {
        console.error('Error initializing users:', error);
    }
};

// Start server function
const startServer = async () => {
    try {
        // Initialize users
        await initializeUsers();
        
        // Start server
        const PORT = 5001;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('Default login credentials:');
            console.log('Admin - username: admin, password: admin123');
            console.log('Users - username: user1/user2/user3, password: user123');
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
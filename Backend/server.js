/**
 * TaskFlow Backend - Entry Point
 * This file initializes the Express server, connects to MongoDB,
 * and sets up global middleware and route handlers.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load and Validate environment variables
const validateEnv = require('./config/env');
validateEnv();

const app = express();

/**
 * Global Middleware Configuration
 * - CORS: MUST be first to handle preflight requests
 * - JSON: Parses incoming JSON payloads
 * - Cookie Parser: Parses cookies for JWT authentication
 */
const allowedOrigins = [
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Normalize origin for comparison
        const normalizedOrigin = origin.replace(/\/$/, '');
        
        if (allowedOrigins.indexOf(normalizedOrigin) === -1) {
            console.error(`[CORS Error] Blocked origin: ${origin}. Expected one of: ${allowedOrigins.join(', ')}`);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

/**
 * Rate Limiting Configuration
 * Prevents brute force and API abuse.
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later'
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login attempts per hour
    message: 'Too many login attempts, please try again in an hour'
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
// Google auth is exempt from strict auth limiter to avoid issues with social login flows


/**
 * Database Connection
 * Establishes connection to MongoDB Atlas using Mongoose
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Error] Database connection failed: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

// Initialize Scheduler
const initScheduler = require('./utils/scheduler');
initScheduler();

/**
 * Route Definitions
 */
// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
    res.json({ message: "TaskFlow API is running..." });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
    console.error('--- GLOBAL ERROR ---', err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

/**
 * Server Execution
 */
const PORT = 5000;
app.listen(PORT, () => {
    console.log('--- TASKFLOW SYSTEM STARTUP ---');
    console.log(`[TaskFlow-Alpha] Server running strictly on port ${PORT}`);
    console.log('--- READY FOR FLOW-AI SYNC ---');
});

/**
 * Auth Controller
 * Handles user registration, login, and profile management.
 */

const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT
 * @param {string} id - User ID
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Name validation: Letters and spaces only
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: 'Name can only contain alphabetic characters.' });
        }

        // Password validation: 8+ chars, 1 upper, 1 number, 1 special
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passRegex.test(password)) {
            return res.status(400).json({ message: 'Password does not meet complexity requirements.' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    onTimeCount: 0,
                    reminderTime: null
                }
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    onTimeCount: user.onTimeCount || 0,
                    reminderTime: user.reminderTime
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Authenticate with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;


        const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
        const { name, email } = googleRes.data;

        let user = await User.findOne({ email });

        if (!user) {

            return res.json({
                needsName: true,
                email,
                googleName: name
            });
        }

        res.json({
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                onTimeCount: user.onTimeCount || 0,
                reminderTime: user.reminderTime
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(400).json({ message: 'Google authentication failed' });
    }
};

/**
 * @desc    Complete Google Registration
 * @route   POST /api/auth/complete-google-registration
 * @access  Public
 */
exports.completeGoogleRegistration = async (req, res) => {
    try {
        const { name, email, picture } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Name is mandatory' });
        }

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: 'Name can only contain alphabetic characters' });
        }

        let user = await User.create({
            name,
            email,
            password: crypto.randomBytes(16).toString('hex')
        });

        res.json({
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error completing registration' });
    }
};

/**
 * @desc    Logout user and blacklist token
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.decode(token);

        // Add to blacklist with TTL based on token expiry
        const expiresAt = new Date(decoded.exp * 1000);
        await Blacklist.create({ token, expiresAt });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error during logout' });
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        onTimeCount: req.user.onTimeCount || 0,
        reminderTime: req.user.reminderTime
    });
};

/**
 * @desc    Direct Password Reset (Bypass Email)
 * @route   POST /api/auth/direct-reset
 * @access  Public
 */
exports.directReset = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Password validation: 8+ chars, 1 upper, 1 number, 1 special
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passRegex.test(password)) {
            return res.status(400).json({ message: 'Password does not meet complexity requirements' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'Email not registered' });
        }


        if (user.password) {
            const isSame = await user.matchPassword(password);
            if (isSame) {
                return res.status(400).json({ message: 'New password must be different from your current password' });
            }
        }


        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update User Profile (Name/Avatar)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar, reminderTime } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (reminderTime !== undefined) updateData.reminderTime = reminderTime;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                reminderTime: user.reminderTime,
                onTimeCount: user.onTimeCount
            }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update Password (In-App)
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id).select('+password');


        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passRegex.test(password)) {
            return res.status(400).json({ message: 'Password does not meet complexity requirements' });
        }


        if (user.password) {
            const isSame = await user.matchPassword(password);
            if (isSame) {
                return res.status(400).json({ message: 'New password must be different from your current password' });
            }
        }

        user.password = password;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Permanently Delete Account
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
exports.deleteAccount = async (req, res) => {
    try {
        const { nameConfirmation } = req.body;
        const user = await User.findById(req.user._id);

        if (nameConfirmation !== user.name) {
            return res.status(400).json({ message: 'Name confirmation does not match' });
        }


        await Promise.all([
            User.findByIdAndDelete(req.user._id),

            require('../models/Task').deleteMany({ user: req.user._id })
        ]);

        res.status(200).json({ message: 'Account permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

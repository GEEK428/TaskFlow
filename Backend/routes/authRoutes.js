/**
 * Auth Routes
 * Mapping endpoints to authentication controller functions.
 */

const express = require('express');
const router = express.Router();
const { 
    registerUser, loginUser, getMe, googleLogin, logoutUser, 
    directReset, completeGoogleRegistration,
    updateProfile, updatePassword, deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/complete-google-registration', completeGoogleRegistration);
router.post('/logout', protect, logoutUser);
router.post('/direct-reset', directReset);
router.get('/me', protect, getMe);

// New Settings Routes
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;

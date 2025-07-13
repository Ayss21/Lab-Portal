// routes/user.js
const express = require('express');
const router = express.Router();
// Import specific authentication and authorization middlewares
const { authenticateToken, requireUser } = require('../middleware/auth');
const User = require('../models/user');
const Lab = require('../models/lab');
const Timetable = require('../models/timetable'); // If users can view their bookings

// Apply authenticateToken and requireUser to all routes in this file
router.use(authenticateToken);
router.use(requireUser); // Ensures all subsequent routes are user-only

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // req.user is already populated by authenticateToken and requireUser
    // It already excludes the password due to .select('-password') in middleware
    if (!req.user) {
      return res.status(404).json({ message: 'User not found.' }); // Should ideally not happen if middleware works
    }
    res.json(req.user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: 'Server error fetching user profile.' });
  }
});

// Update user profile
// NOTE: Your User model currently only has 'email', 'password', 'createdAt'.
// To update 'name', 'phone', 'department', 'year', 'rollNumber', you MUST add these fields to your User schema first.
router.put('/profile', async (req, res) => {
  try {
    const updateFields = req.body; // Get all fields from the body

    // Find the user by ID (req.user._id is the authenticated user's ID)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update only the fields that are provided in the request body
    // Ensure these fields exist in your User model schema
    Object.keys(updateFields).forEach(key => {
      if (user[key] !== undefined) { // Check if the field exists in the user object
        user[key] = updateFields[key];
      }
    });

    await user.save(); // Save the updated user document

    // Return the updated user without the password
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: 'Server error updating user profile.' });
  }
});

// Get available labs (for normal user view)
// This route is duplicated with routes/labs.js.
// It's better to use the /api/labs route for general lab viewing.
// If this is specifically for a user's *dashboard* view of labs, keep it.
router.get('/labs', async (req, res) => {
  try {
    // Assuming 'isActive' is a field you might add to Lab model for availability
    const labs = await Lab.find({ /* isActive: true */ }).select('labName department location capacity equipments');
    res.json(labs);
  } catch (error) {
    console.error("Error fetching available labs for user:", error);
    res.status(500).json({ message: 'Server error fetching labs.' });
  }
});

// Get specific lab details (for normal user view)
// This route is duplicated with routes/labs.js.
// It's better to use the /api/labs/:id route for general lab details.
router.get('/labs/:labId', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found.' });
    }
    res.json(lab);
  } catch (error) {
    console.error(`Error fetching lab details for user (${req.params.labId}):`, error);
    res.status(500).json({ message: 'Server error fetching lab details.' });
  }
});

module.exports = router;
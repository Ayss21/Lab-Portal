// routes/admin.js
const express = require('express');
const router = express.Router();
// Import the specific authentication and authorization middlewares
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/user');
const Lab = require('../models/lab');
const Timetable = require('../models/timetable');

// All routes in this file will require authentication and admin privileges
// Apply authenticateToken first, then requireAdmin
router.use(authenticateToken);
router.use(requireAdmin); // This ensures all subsequent routes are admin-only

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLabs = await Lab.countDocuments();
    const totalTimetables = await Timetable.countDocuments(); // Renamed totalBookings to totalTimetables for clarity

    // For "today's bookings", you need to define what constitutes a "booking" in your Timetable model.
    // Your Timetable model has 'schedule' which is an array of 'dayScheduleSchema',
    // and each dayScheduleSchema has 'timeSlots'.
    // A simple count of Timetable documents might not be what you mean by "bookings".
    // If a "booking" is a specific time slot being occupied, you'd need a more complex query.
    // For now, I'll keep the count of Timetables, but note this for future refinement.
    const todayBookings = 0; // Placeholder, as Timetable model doesn't have a direct 'date' field for a simple query.
    // Example for a more complex query if 'timeSlots' represent bookings and have a date:
    /*
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59, 999);
    const todayBookings = await Timetable.countDocuments({
      'schedule.timeSlots.isAvailable': false, // Assuming isAvailable: false means booked
      'schedule.timeSlots.date': { // You'd need a date field in your timeSlotSchema for this to work
        $gte: new Date(startOfDay),
        $lt: new Date(endOfDay)
      }
    });
    */

    const stats = {
      totalUsers,
      totalLabs,
      totalTimetables,
      todayBookings // This needs clarification based on your Timetable usage
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ message: 'Server error fetching dashboard stats.' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// Get user details
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: 'Server error fetching user details.' });
  }
});

// Update user status (activate/deactivate)
// NOTE: Your User model does not currently have an 'isActive' field.
// You would need to add `isActive: { type: Boolean, default: true }` to your User schema.
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    // Validate isActive is a boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean value.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive },
      { new: true, runValidators: true } // runValidators ensures schema validation on update
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User status updated successfully.', user });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: 'Server error updating user status.' });
  }
});

// Get all labs (for admin view)
router.get('/labs', async (req, res) => {
  try {
    const labs = await Lab.find().sort({ createdAt: -1 });
    res.json(labs);
  } catch (error) {
    console.error("Error fetching all labs (admin view):", error);
    res.status(500).json({ message: 'Server error fetching labs.' });
  }
});

// Create new lab
router.post('/labs', async (req, res) => {
  try {
    // Destructure all fields from your Lab model
    const {
      labName, department, location, capacity, equipments,
      availableSystem, workingSystem, incharge, technician, software,
      specifications, labType
    } = req.body;

    // Basic validation for required fields
    if (!labName || !department || !location || !capacity || !equipments ||
        !availableSystem || !workingSystem || !incharge || !technician || !software ||
        !specifications || !labType) {
      return res.status(400).json({ message: 'All lab fields are required.' });
    }

    const lab = new Lab({
      labName, department, location, capacity, equipments,
      availableSystem, workingSystem, incharge, technician, software,
      specifications, labType
      // createdBy: req.user._id // If you want to track which admin created it
    });

    await lab.save();
    res.status(201).json({ message: 'Lab created successfully.', lab });
  } catch (error) {
    console.error("Error creating new lab:", error);
    res.status(500).json({ message: 'Server error creating lab.', error: error.message });
  }
});

// Update lab
router.put('/labs/:labId', async (req, res) => {
  try {
    // Only update fields that are present in the request body
    const updateFields = req.body;

    const lab = await Lab.findByIdAndUpdate(
      req.params.labId,
      { $set: updateFields }, // Use $set to update only provided fields
      { new: true, runValidators: true }
    );

    if (!lab) {
      return res.status(404).json({ message: 'Lab not found.' });
    }

    res.json({ message: 'Lab updated successfully.', lab });
  } catch (error) {
    console.error("Error updating lab:", error);
    res.status(500).json({ message: 'Server error updating lab.', error: error.message });
  }
});

// Delete lab
router.delete('/labs/:labId', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found.' });
    }

    // Check if lab has any associated timetables (bookings)
    const associatedTimetables = await Timetable.countDocuments({ labId: req.params.labId });
    if (associatedTimetables > 0) {
      return res.status(400).json({ message: 'Cannot delete lab with existing timetables. Please delete associated timetables first.' });
    }

    await Lab.findByIdAndDelete(req.params.labId);
    res.json({ message: 'Lab deleted successfully.' });
  } catch (error) {
    console.error("Error deleting lab:", error);
    res.status(500).json({ message: 'Server error deleting lab.' });
  }
});

module.exports = router;
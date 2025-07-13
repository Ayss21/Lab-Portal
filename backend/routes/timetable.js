// routes/timetable.js
const express = require('express');
const { Timetable } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth'); // Import both

const router = express.Router();

// Get all timetables (accessible to any authenticated user/admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Populate labId to get lab details along with timetable
    const timetables = await Timetable.find().populate('labId').sort({ createdAt: -1 });
    res.json(timetables);
  } catch (error) {
    console.error("Error fetching all timetables:", error);
    res.status(500).json({ message: 'Server error fetching timetables.', error: error.message });
  }
});

// Get timetable by lab ID (accessible to any authenticated user/admin)
router.get('/lab/:labId', authenticateToken, async (req, res) => {
    try {
        const timetable = await Timetable.findOne({ labId: req.params.labId }).populate('labId');
        if (!timetable) {
            // CRITICAL CHANGE: Return 200 OK with an empty schedule if not found
            // This tells the frontend that no timetable exists yet, and it should allow creation.
            return res.status(200).json({ labId: req.params.labId, schedule: [] }); // <--- MODIFIED
        }
        res.json(timetable);
    } catch (error) {
        console.error(`Error fetching timetable for lab ${req.params.labId}:`, error);
        res.status(500).json({ message: 'Server error fetching timetable by lab ID.', error: error.message });
    }
});

// Create new timetable (requires admin authentication)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { labId, labName, schedule } = req.body;

        // Basic validation
        if (!labId || !labName || !schedule || !Array.isArray(schedule)) { // Removed schedule.length === 0 check
            return res.status(400).json({ message: 'Lab ID, lab name, and schedule array are required.' });
        }

        // OPTIONAL: Check if a timetable already exists for this lab. If it does, you should use PUT for updates.
        const existingTimetable = await Timetable.findOne({ labId });
        if (existingTimetable) {
            return res.status(409).json({ message: 'Timetable already exists for this lab. Use PUT to update.' });
        }

        const timetable = new Timetable({ labId, labName, schedule });
        await timetable.save();
        res.status(201).json({ message: 'Timetable created successfully.', timetable });
    } catch (error) {
        console.error("Error creating new timetable:", error);
        res.status(500).json({ message: 'Server error creating timetable.', error: error.message });
    }
});

// Update timetable (requires admin authentication)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updateFields = req.body;

    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found.' });
    }

    res.json({ message: 'Timetable updated successfully.', timetable });
  } catch (error) {
    console.error("Error updating timetable:", error);
    res.status(500).json({ message: 'Server error updating timetable.', error: error.message });
  }
});

// Delete timetable (requires admin authentication)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found.' });
    }

    res.json({ message: 'Timetable deleted successfully.' });
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({ message: 'Server error deleting timetable.' });
  }
});

module.exports = router;
// routes/labs.js
const express = require("express");
const Lab = require("../models/lab"); // Corrected import based on previous steps

const router = express.Router();

// Get all labs (accessible to anyone, including unauthenticated users)
router.get("/", async (req, res) => {
 
  try {
    const labs = await Lab.find().sort({ createdAt: -1 });
   
    res.json(labs);
  } catch (error) {
    console.error("Backend Error fetching all labs:", error); // More specific log
    res
      .status(500)
      .json({ message: "Server error fetching labs.", error: error.message });
  }
});
// Get labs by type (e.g., 'S' for PSPortal, 'A' for Academics)
router.get("/type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    // Add validation for 'type' if needed (e.g., ensure it's 'S' or 'A')
    const labs = await Lab.find({ labType: type }).sort({ createdAt: -1 });
    res.json(labs);
  } catch (error) {
    console.error(`Error fetching labs by type (${req.params.type}):`, error);
    res.status(500).json({
      message: "Server error fetching labs by type.",
      error: error.message,
    });
  }
});

// Get single lab by ID
router.get("/:id", async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: "Lab not found." });
    }
    res.json(lab);
  } catch (error) {
    console.error(`Error fetching single lab (${req.params.id}):`, error);
    res.status(500).json({
      message: "Server error fetching lab details.",
      error: error.message,
    });
  }
});

module.exports = router;

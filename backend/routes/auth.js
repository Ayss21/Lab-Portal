// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user"); // Assuming you have a User model
const Admin = require("../models/admin");
const { authenticateToken } = require("../middleware/auth"); // Ensure this import is correct

const router = express.Router();

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your-super-strong-secret-key-please-change-me";
// Admin Key (use environment variable in production)
const SUPER_ADMIN_KEY = process.env.SUPER_ADMIN_KEY || "supersecretadminkey"; // Define admin key here

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// New POST endpoint for Google ID token verification
router.post("/google-verify-token", async (req, res) => {
  try {
    const { token } = req.body; // This 'token' is the Google ID token from GSI
    if (!token) {
      return res.status(400).json({ message: "Google ID token is required." });
    }

    // 1. Verify the Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Use your backend's Google Client ID

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const email = payload['email'];
    const name = payload['name']; // Optional: get user's name

    // 2. Check if user exists in your User database
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new user account
      user = new User({
        email,
        // For Google users, you might not store a password or generate a random one
        // If you want to allow them to set a password later, handle that flow.
        password: Math.random().toString(36).slice(-8), // Dummy password
        // name: name, // Uncomment if your User model has a 'name' field
      });
      await user.save();
      console.log(`New user created via Google Sign-In: ${email}`);
    }

    // 3. Generate your own JWT for the authenticated user
    const appToken = generateToken({
      id: user._id,
      email: user.email,
      type: "user", // Google users are regular users
    });

    res.json({
      message: "Google sign-in successful",
      token: appToken,
      user: { id: user._id, email: user.email /* , name: user.name */ },
    });

  } catch (error) {
    console.error("Backend Google ID token verification error:", error);
    res.status(401).json({ message: "Google authentication failed. Invalid token." });
  }
});

// User Registration
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }
    const user = new User({ email, password });
    await user.save();
    // No token returned here, as per requirement to sign in after signup
    res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({ message: "Server error during user registration.", error: error.message });
  }
});

// Admin Registration (NEW)
router.post("/admin/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required for admin registration." });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists. Please sign in." });
    }
    const admin = new Admin({ email, password });
    await admin.save();
    // No token returned here, as per requirement to sign in after signup
    res.status(201).json({
      message: "Admin account registered successfully. Please sign in.",
      admin: { id: admin._id, email: admin.email, createdAt: admin.createdAt },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: "Server error during admin registration.", error: error.message });
  }
});

// User Sign In
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const token = generateToken({
      id: user._id,
      email: user.email,
      type: "user",
    });
    res.json({
      message: "User sign in successful.",
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("User sign in error:", error);
    res.status(500).json({ message: "Server error during user sign in.", error: error.message });
  }
});

// Admin Sign In
router.post("/admin/signin", async (req, res) => {
  try {
    const { email, password, adminKey } = req.body; // Renamed from adminPassword to adminKey for consistency with frontend
    if (!email || !password || !adminKey) {
      return res.status(400).json({ message: "Email, password, and admin key are required." });
    }

    // Verify the SUPER_ADMIN_KEY first
    if (adminKey !== SUPER_ADMIN_KEY) {
      return res.status(403).json({ message: "Invalid admin key." });
    }

    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      // If admin not found, instruct them to sign up first
      return res.status(400).json({ message: "Admin account not found. Please create an admin account first." });
    }

    // Compare the provided password with the stored hashed password for the admin
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // If email, password, and adminKey are all correct, generate token
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      type: "admin",
    });

    res.json({
      message: "Admin sign in successful.",
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Admin sign in error:", error);
    res.status(500).json({ message: "Server error during admin sign in.", error: error.message });
  }
});

// Google OAuth Routes (for users only) - Placeholder
router.get("/google", (req, res) => {
  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=email profile`;
  res.redirect(googleAuthUrl);
});

// Google OAuth Callback - Placeholder
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect("/signin?error=google-oauth-failed-no-code");
    }
    res.redirect(`/dashboard?message=google-oauth-callback-received&code=${code}`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.redirect("/signin?error=google-oauth-failed");
  }
});

// Get current user/admin details using the new authenticateToken middleware
router.get("/me", authenticateToken, async (req, res) => {
  try {
    if (req.userType === "admin") {
      return res.json({ admin: req.user, type: "admin" });
    } else if (req.userType === "user") {
      return res.json({ user: req.user, type: "user" });
    } else {
      return res.status(401).json({ message: "Authentication failed or user type unknown." });
    }
  } catch (error) {
    console.error("Error fetching current user/admin:", error);
    res.status(500).json({ message: "Server error while fetching user/admin details." });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful." });
});

module.exports = router;


// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const labRoutes = require("./routes/labs");
const timetableRoutes = require("./routes/timetable");

// Import middleware (only if you need to apply it directly here, otherwise it's in route files)
const { authenticateToken } = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// MongoDB connection
// The useNewUrlParser and useUnifiedTopology options are no longer necessary
// in Mongoose 6.x and above, as they are the default behavior.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    // Exit process with failure code if database connection fails
    process.exit(1);
  });
mongoose.set("debug", true);

// Define API Routes
// Note on middleware application:
// - authRoutes handles its own authentication logic (login/signup, /me)
// - userRoutes and adminRoutes apply `authenticateToken` and `requireUser`/`requireAdmin`
//   internally using `router.use()` within their respective files.
// - labRoutes and timetableRoutes GET endpoints are now protected by `authenticateToken` here,
//   while their POST/PUT/DELETE endpoints are protected by `authenticateToken` and `requireAdmin`
//   internally in their files.

app.use("/api/auth", authRoutes); // Authentication routes (signup, signin, admin signin, /me, logout)

// User-specific routes (e.g., profile management)
// These routes are protected by `authenticateToken` and `requireUser` inside `routes/user.js`
app.use("/api/users", userRoutes);

// Admin-specific routes (e.g., dashboard, user management, lab/timetable management by admin)
// These routes are protected by `authenticateToken` and `requireAdmin` inside `routes/admin.js`
app.use("/api/admin", adminRoutes);

// Lab routes (viewing labs for authenticated users, admin actions handled in adminRoutes)
// Applying `authenticateToken` here means all /api/labs routes (including GET) require a token.
// This aligns with "normal user they can just view that info" (implying logged in).
app.use("/api/labs", labRoutes);

// Timetable routes (viewing timetables for authenticated users, admin actions handled in timetableRoutes)
// Applying `authenticateToken` here means all /api/timetable routes (including GET) require a token.
app.use("/api/timetable", authenticateToken, timetableRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Lab Portal API is running successfully!",
  });
});

// Generic Error handling middleware (should be last middleware before 404)
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.stack); // Log the full stack trace for debugging
  // Send a generic error response to the client
  res
    .status(500)
    .json({
      message: "An unexpected server error occurred. Please try again later.",
    });
});

// 404 Not Found handler (should be the very last middleware)
app.use("*", (req, res) => {
  res
    .status(404)
    .json({
      message: `The requested route '${req.originalUrl}' was not found.`,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode.`
  );
});

module.exports = app;
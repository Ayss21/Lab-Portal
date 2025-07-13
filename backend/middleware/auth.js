
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming you have a User model
const Admin = require('../models/admin');

// Ensure you have JWT_SECRET set in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-strong-secret-key-please-change-me';

// General authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token required or invalid format' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded token payload to request for later use
    req.userPayload = decoded; // Store the entire decoded payload

    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password'); // Use decoded.id
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      req.user = admin; // Consistently use req.user for the authenticated entity
      req.userType = 'admin';
    } else if (decoded.type === 'user') {
      const user = await User.findById(decoded.id).select('-password'); // Use decoded.id
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = user; // Consistently use req.user for the authenticated entity
      req.userType = 'user';
    } else {
      return res.status(403).json({ message: 'Invalid token type' });
    }
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Log the actual error for debugging
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Authorization middleware factory
// This middleware checks if the authenticated user has one of the allowed roles
const authorizeRoles = (allowedTypes) => {
  return (req, res, next) => {
    // authenticateToken must run before this middleware
    if (!req.user || !req.userType) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedTypes.includes(req.userType)) {
      return res.status(403).json({ message: `Access denied. ${allowedTypes.join(' or ')} access required.` });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  // Export specific role-based middlewares using authorizeRoles
  requireAdmin: authorizeRoles(['admin']),
  requireUser: authorizeRoles(['user']),
  // If you need a route accessible by both:
  requireUserOrAdmin: authorizeRoles(['user', 'admin'])
};


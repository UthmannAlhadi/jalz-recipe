// middleware/auth.js
// This middleware protects admin-only routes.
// It checks for a valid JWT token in the Authorization header.

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jalz-recipe-secret-key-change-in-production';

/**
 * Middleware: requires a valid admin JWT token.
 * Attach this to any route that only admins should access.
 */
function requireAdmin(req, res, next) {
  // Expect: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = { requireAdmin, JWT_SECRET };

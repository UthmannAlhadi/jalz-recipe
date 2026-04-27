// server.js
// Main entry point for the Jalz Recipe backend API server.
// Run with: node server.js (or npm start)

// dotenv is only needed locally. On Render, env vars are injected automatically.
// We use a try/catch so the app won't crash if dotenv isn't installed.
try { require('dotenv').config(); } catch {}

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// DATA_DIR: where the database and uploads are stored.
// Set this as an env var on Render if you have a persistent disk.
// Falls back to a local 'data' folder for development.
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files: GET /uploads/recipe_123.jpg
app.use('/uploads', express.static(path.join(dataDir, 'uploads')));

// Serve the frontend (HTML/CSS/JS) — one server serves everything
app.use(express.static(path.join(__dirname, '../frontend')));

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────

app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Jalz Recipe', timestamp: new Date().toISOString() });
});

// Catch-all: serve frontend for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image too large. Max 5MB.' });
  }
  res.status(500).json({ error: err.message || 'An unexpected error occurred.' });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍳 Jalz Recipe server running at http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${dataDir}\n`);
});

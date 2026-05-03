// server.js
try { require('dotenv').config(); } catch {}

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve locally uploaded images (fallback when Cloudinary is not configured)
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
app.use('/uploads', express.static(path.join(dataDir, 'uploads')));

// Serve the frontend HTML/CSS/JS
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API ROUTES ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Jalz Recipe', timestamp: new Date().toISOString() });
});

// Catch-all: serve frontend for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ error: 'Image too large. Max 5MB.' });
  res.status(500).json({ error: err.message || 'Unexpected server error.' });
});

// ─── START (wait for DB to be ready first) ───
db.ready().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🍳 Jalz Recipe running at http://localhost:${PORT}\n`);
  });
});

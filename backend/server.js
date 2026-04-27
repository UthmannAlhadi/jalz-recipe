// server.js
try { require('dotenv').config(); } catch {}

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database'); // starts async init immediately

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');

// ─── MIDDLEWARE ───
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(dataDir, 'uploads')));

// Serve frontend HTML/CSS/JS
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── ROUTES ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Jalz Recipe', timestamp: new Date().toISOString() });
});

// Catch-all: send frontend for unknown routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ error: 'Image too large. Max 5MB.' });
  res.status(500).json({ error: err.message || 'Unexpected error.' });
});

// ─── START ───
// Wait for database to be ready before accepting connections
db.ready().then(() => {
  app.listen(PORT, () => {
    console.log(`Jalz Recipe running at http://localhost:${PORT}`);
  });
});

// db/database.js
// This file sets up the SQLite database and creates all required tables.

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const fs = require('fs');

// DB path: use environment variable if set (for Render disk),
// otherwise fall back to a local 'data' folder (local dev).
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
const DB_PATH = path.join(dataDir, 'jalz_recipe.db');

// Create the data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open (or create) the database file
const db = new Database(DB_PATH);

// Enable WAL mode for better performance and concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─────────────────────────────────────────────
// CREATE TABLES
// ─────────────────────────────────────────────

db.exec(`
  -- Users table: stores admin credentials
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,          -- bcrypt hashed
    role      TEXT    NOT NULL DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Categories table: recipe categories (e.g., Dessert, Main Course)
  CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL UNIQUE
  );

  -- Recipes table: the main data store
  CREATE TABLE IF NOT EXISTS recipes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL,
    description  TEXT,
    ingredients  TEXT    NOT NULL,       -- stored as JSON string array
    instructions TEXT    NOT NULL,       -- stored as JSON string array (steps)
    image_url    TEXT,                   -- path to uploaded image or external URL
    category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    prep_time    INTEGER,                -- in minutes
    cook_time    INTEGER,                -- in minutes
    servings     INTEGER,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─────────────────────────────────────────────
// SEED DEFAULT DATA (only if tables are empty)
// ─────────────────────────────────────────────

// Seed a default admin account
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hashed = bcrypt.hashSync('admin123', 10); // Change this password after first login!
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hashed, 'admin');
  console.log('✅ Default admin user created. Username: admin | Password: admin123');
  console.log('⚠️  Please change the password after first login!');
}

// Seed default categories
const defaultCategories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks', 'Traditional', 'Vegetarian'];
const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
defaultCategories.forEach(cat => insertCategory.run(cat));

// Seed a sample recipe so the app doesn't start empty
const recipeExists = db.prepare('SELECT id FROM recipes LIMIT 1').get();
if (!recipeExists) {
  db.prepare(`
    INSERT INTO recipes (title, description, ingredients, instructions, category_id, prep_time, cook_time, servings)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Nasi Lemak',
    'A fragrant Malaysian rice dish cooked in coconut milk and pandan leaf, served with sambal, anchovies, peanuts, and boiled egg.',
    JSON.stringify([
      '2 cups jasmine rice',
      '1 cup coconut milk',
      '1 cup water',
      '2 pandan leaves, knotted',
      '1 tsp salt',
      '3 tbsp sambal paste',
      '1/2 cup fried anchovies (ikan bilis)',
      '1/2 cup roasted peanuts',
      '2 hard-boiled eggs',
      '1 cucumber, sliced'
    ]),
    JSON.stringify([
      'Wash rice until water runs clear.',
      'Combine rice, coconut milk, water, pandan leaves, and salt in a pot.',
      'Bring to a boil, then reduce heat to low. Cover and cook for 15 minutes.',
      'Fluff the rice with a fork and remove pandan leaves.',
      'Fry dried anchovies in oil until crispy. Set aside.',
      'Serve rice with sambal, fried anchovies, peanuts, boiled egg, and cucumber slices.'
    ]),
    7, // Traditional category id
    15,
    30,
    4
  );
}

console.log('✅ Database initialized successfully');

module.exports = db;

// db/database.js
// Uses PostgreSQL (via the 'pg' package) for full persistence on Render.
// Connection is configured via the DATABASE_URL environment variable,
// which you get for free from Neon.tech.
//
// For local development: set DATABASE_URL in your .env file.

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// PostgreSQL connection pool — reuses connections efficiently
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Required for Neon.tech (SSL in production, plain locally)
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

// ─── DB WRAPPER ───
// Provides the same simple interface the rest of the app already uses.
const db = {
  _ready: false,
  _readyCallbacks: [],

  _resolve() {
    this._ready = true;
    this._readyCallbacks.forEach(cb => cb());
    this._readyCallbacks = [];
  },

  ready() {
    if (this._ready) return Promise.resolve();
    return new Promise(resolve => this._readyCallbacks.push(resolve));
  },

  // Execute a write query: INSERT, UPDATE, DELETE
  async run(sql, params = []) {
    // Convert SQLite ? placeholders to PostgreSQL $1 $2 style
    const pgSql = toPostgres(sql);
    await pool.query(pgSql, params);
  },

  // Get one row as a plain object, or null
  async get(sql, params = []) {
    const pgSql = toPostgres(sql);
    const result = await pool.query(pgSql, params);
    return result.rows[0] || null;
  },

  // Get all matching rows as an array of plain objects
  async all(sql, params = []) {
    const pgSql = toPostgres(sql);
    const result = await pool.query(pgSql, params);
    return result.rows;
  },

  // Run INSERT and return the new row's id
  async insert(sql, params = []) {
    // Add RETURNING id so Postgres gives us the new row id
    const pgSql = toPostgres(sql) + ' RETURNING id';
    const result = await pool.query(pgSql, params);
    return result.rows[0].id;
  },
};

// ─── PLACEHOLDER CONVERTER ───
// SQLite uses ? for parameters; PostgreSQL uses $1, $2, $3...
// This converts one style to the other.
function toPostgres(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// ─── SCHEMA & SEED ───
async function initDatabase() {
  console.log('Connecting to PostgreSQL...');

  // Test the connection
  await pool.query('SELECT 1');
  console.log('Connected to PostgreSQL');

  // Create tables (IF NOT EXISTS = safe to run every startup)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      username   TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id   SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id           SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      description  TEXT,
      ingredients  TEXT NOT NULL,
      instructions TEXT NOT NULL,
      image_url    TEXT,
      category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      prep_time    INTEGER,
      cook_time    INTEGER,
      servings     INTEGER,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      updated_at   TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Seed default admin (only if not already there)
  const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hashed = bcrypt.hashSync('admin123', 10);
    await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashed, 'admin']);
    console.log('Default admin created — username: admin | password: admin123');
    console.log('Please change the password after first login!');
  }

  // Seed default categories
  const cats = ['Breakfast','Lunch','Dinner','Dessert','Snacks','Drinks','Traditional','Vegetarian'];
  for (const c of cats) {
    await pool.query(
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [c]
    );
  }

  // Seed sample recipe if table is empty
  const recipeExists = await db.get('SELECT id FROM recipes LIMIT 1');
  if (!recipeExists) {
    const trad = await db.get("SELECT id FROM categories WHERE name = 'Traditional'");
    await db.insert(
      'INSERT INTO recipes (title, description, ingredients, instructions, category_id, prep_time, cook_time, servings) VALUES (?,?,?,?,?,?,?,?)',
      [
        'Nasi Lemak',
        'A fragrant Malaysian rice dish cooked in coconut milk and pandan leaf.',
        JSON.stringify(['2 cups jasmine rice','1 cup coconut milk','1 cup water','2 pandan leaves','1 tsp salt','3 tbsp sambal','1/2 cup fried anchovies','1/2 cup roasted peanuts','2 hard-boiled eggs','1 cucumber, sliced']),
        JSON.stringify(['Wash rice until water runs clear.','Combine rice, coconut milk, water, pandan leaves and salt in a pot.','Bring to boil then reduce heat. Cover and cook 15 minutes.','Fluff rice and remove pandan leaves.','Fry anchovies until crispy.','Serve with sambal, anchovies, peanuts, egg and cucumber.']),
        trad ? trad.id : null,
        15, 30, 4
      ]
    );
    console.log('Sample recipe added');
  }

  console.log('Database ready');
  db._resolve();
}

initDatabase().catch(err => {
  console.error('Database initialization failed:', err.message);
  process.exit(1);
});

module.exports = db;

// db/database.js
// SQLite via sql.js — pure JavaScript, no native compilation.
// Works on any Node.js version including v24+.

const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
const DB_FILE = path.join(dataDir, 'jalz_recipe.db');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Wrapper object exported to all route files
const db = {
  _db: null,
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

  _save() {
    try {
      const data = this._db.export();
      fs.writeFileSync(DB_FILE, Buffer.from(data));
    } catch (err) {
      console.error('DB save error:', err.message);
    }
  },

  // Execute a write statement (INSERT/UPDATE/DELETE/CREATE)
  run(sql, params = []) {
    this._db.run(sql, params);
    this._save();
  },

  // Get one row as a plain object, or null
  get(sql, params = []) {
    const stmt = this._db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  },

  // Get all matching rows as an array of plain objects
  all(sql, params = []) {
    const stmt = this._db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  },

  lastInsertRowid() {
    const r = this.get('SELECT last_insert_rowid() as id');
    return r ? r.id : null;
  },
};

async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    db._db = new SQL.Database(fs.readFileSync(DB_FILE));
    console.log('Loaded existing database from disk');
  } else {
    db._db = new SQL.Database();
    console.log('Created new database');
  }

  // Create tables
  db._db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      image_url TEXT,
      category_id INTEGER,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db._save();

  // Seed admin
  if (!db.get('SELECT id FROM users WHERE username = ?', ['admin'])) {
    const hashed = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashed, 'admin']);
    console.log('Default admin created: admin / admin123');
  }

  // Seed categories
  const cats = ['Breakfast','Lunch','Dinner','Dessert','Snacks','Drinks','Traditional','Vegetarian'];
  for (const c of cats) {
    if (!db.get('SELECT id FROM categories WHERE name = ?', [c])) {
      db.run('INSERT INTO categories (name) VALUES (?)', [c]);
    }
  }

  // Seed sample recipe
  if (!db.get('SELECT id FROM recipes LIMIT 1')) {
    const trad = db.get("SELECT id FROM categories WHERE name = 'Traditional'");
    db.run(
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
  }

  console.log('Database ready');
  db._resolve();
}

initDatabase().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

module.exports = db;

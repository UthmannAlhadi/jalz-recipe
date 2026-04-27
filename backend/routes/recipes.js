// routes/recipes.js
// All recipe CRUD endpoints.
// GET routes are public; POST/PUT/DELETE require admin JWT.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

// ─── IMAGE UPLOAD SETUP ───
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
const uploadDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `recipe_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  }
});

// ─── HELPER ───
function parseRecipe(r) {
  if (!r) return null;
  return {
    ...r,
    ingredients: JSON.parse(r.ingredients || '[]'),
    instructions: JSON.parse(r.instructions || '[]'),
  };
}

// ─── PUBLIC ROUTES ───

// GET /api/recipes?search=...&category=...
router.get('/', async (req, res) => {
  await db.ready();
  const { search, category } = req.query;

  let sql = `
    SELECT r.*, c.name AS category_name
    FROM recipes r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ' AND (r.title LIKE ? OR r.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    sql += ' AND r.category_id = ?';
    params.push(parseInt(category));
  }
  sql += ' ORDER BY r.created_at DESC';

  res.json(db.all(sql, params).map(parseRecipe));
});

// GET /api/recipes/meta/categories  — must be before /:id
router.get('/meta/categories', async (req, res) => {
  await db.ready();
  res.json(db.all('SELECT * FROM categories ORDER BY name'));
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  await db.ready();
  const recipe = db.get(`
    SELECT r.*, c.name AS category_name
    FROM recipes r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.id = ?
  `, [req.params.id]);

  if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });
  res.json(parseRecipe(recipe));
});

// ─── ADMIN ROUTES ───

// POST /api/recipes
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  await db.ready();
  const { title, description, ingredients, instructions, category_id, prep_time, cook_time, servings } = req.body;

  if (!title || !ingredients || !instructions)
    return res.status(400).json({ error: 'Title, ingredients, and instructions are required.' });

  let parsedIngredients, parsedInstructions;
  try {
    parsedIngredients = JSON.parse(ingredients);
    parsedInstructions = JSON.parse(instructions);
  } catch {
    return res.status(400).json({ error: 'Ingredients and instructions must be valid JSON arrays.' });
  }

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(`
    INSERT INTO recipes (title, description, ingredients, instructions, image_url, category_id, prep_time, cook_time, servings)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    title.trim(),
    description?.trim() || null,
    JSON.stringify(parsedIngredients),
    JSON.stringify(parsedInstructions),
    image_url,
    category_id ? parseInt(category_id) : null,
    prep_time ? parseInt(prep_time) : null,
    cook_time ? parseInt(cook_time) : null,
    servings ? parseInt(servings) : null,
  ]);

  const newId = db.lastInsertRowid();
  const newRecipe = db.get('SELECT * FROM recipes WHERE id = ?', [newId]);
  res.status(201).json({ message: 'Recipe created successfully.', recipe: parseRecipe(newRecipe) });
});

// PUT /api/recipes/:id
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  await db.ready();
  const existing = db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Recipe not found.' });

  const { title, description, ingredients, instructions, category_id, prep_time, cook_time, servings } = req.body;

  let parsedIngredients, parsedInstructions;
  try {
    parsedIngredients = ingredients ? JSON.parse(ingredients) : JSON.parse(existing.ingredients);
    parsedInstructions = instructions ? JSON.parse(instructions) : JSON.parse(existing.instructions);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON in ingredients or instructions.' });
  }

  let image_url = existing.image_url;
  if (req.file) {
    // Delete old image if it exists
    if (existing.image_url && existing.image_url.startsWith('/uploads/')) {
      const oldPath = path.join(dataDir, existing.image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    image_url = `/uploads/${req.file.filename}`;
  }

  db.run(`
    UPDATE recipes SET
      title = ?, description = ?, ingredients = ?, instructions = ?,
      image_url = ?, category_id = ?, prep_time = ?, cook_time = ?,
      servings = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [
    title?.trim() || existing.title,
    description?.trim() ?? existing.description,
    JSON.stringify(parsedIngredients),
    JSON.stringify(parsedInstructions),
    image_url,
    category_id ? parseInt(category_id) : existing.category_id,
    prep_time ? parseInt(prep_time) : existing.prep_time,
    cook_time ? parseInt(cook_time) : existing.cook_time,
    servings ? parseInt(servings) : existing.servings,
    req.params.id,
  ]);

  const updated = db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
  res.json({ message: 'Recipe updated successfully.', recipe: parseRecipe(updated) });
});

// DELETE /api/recipes/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  await db.ready();
  const recipe = db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });

  if (recipe.image_url && recipe.image_url.startsWith('/uploads/')) {
    const imgPath = path.join(dataDir, recipe.image_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  db.run('DELETE FROM recipes WHERE id = ?', [req.params.id]);
  res.json({ message: 'Recipe deleted successfully.' });
});

module.exports = router;

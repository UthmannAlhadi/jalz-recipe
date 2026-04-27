// routes/recipes.js
// All recipe-related API endpoints.
// GET routes are public (guests can access).
// POST/PUT/DELETE routes require admin authentication.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

// ─────────────────────────────────────────────
// IMAGE UPLOAD CONFIGURATION (multer)
// ─────────────────────────────────────────────

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
const uploadDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Create unique filename: timestamp + original extension
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `recipe_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'));
    }
  }
});

// ─────────────────────────────────────────────
// HELPER: parse stored JSON safely
// ─────────────────────────────────────────────
function parseRecipe(recipe) {
  if (!recipe) return null;
  return {
    ...recipe,
    ingredients: JSON.parse(recipe.ingredients || '[]'),
    instructions: JSON.parse(recipe.instructions || '[]')
  };
}

// ─────────────────────────────────────────────
// PUBLIC ROUTES (no login required)
// ─────────────────────────────────────────────

/**
 * GET /api/recipes
 * Returns all recipes. Supports:
 *   ?search=keyword   - search by title or description
 *   ?category=id      - filter by category
 */
router.get('/', (req, res) => {
  const { search, category } = req.query;

  let query = `
    SELECT r.*, c.name AS category_name
    FROM recipes r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (r.title LIKE ? OR r.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    query += ` AND r.category_id = ?`;
    params.push(parseInt(category));
  }

  query += ` ORDER BY r.created_at DESC`;

  const recipes = db.prepare(query).all(...params);
  res.json(recipes.map(parseRecipe));
});

/**
 * GET /api/recipes/:id
 * Returns a single recipe by ID.
 */
router.get('/:id', (req, res) => {
  const recipe = db.prepare(`
    SELECT r.*, c.name AS category_name
    FROM recipes r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.id = ?
  `).get(req.params.id);

  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found.' });
  }

  res.json(parseRecipe(recipe));
});

/**
 * GET /api/categories
 * Returns all recipe categories.
 */
router.get('/meta/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

// ─────────────────────────────────────────────
// ADMIN-ONLY ROUTES (require JWT token)
// ─────────────────────────────────────────────

/**
 * POST /api/recipes
 * Creates a new recipe.
 * Form data (multipart): title, description, ingredients (JSON), instructions (JSON),
 *                        category_id, prep_time, cook_time, servings, image (file)
 */
router.post('/', requireAdmin, upload.single('image'), (req, res) => {
  const { title, description, ingredients, instructions, category_id, prep_time, cook_time, servings } = req.body;

  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ error: 'Title, ingredients, and instructions are required.' });
  }

  // Validate that ingredients and instructions are valid JSON arrays
  let parsedIngredients, parsedInstructions;
  try {
    parsedIngredients = JSON.parse(ingredients);
    parsedInstructions = JSON.parse(instructions);
  } catch {
    return res.status(400).json({ error: 'Ingredients and instructions must be valid JSON arrays.' });
  }

  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db.prepare(`
    INSERT INTO recipes (title, description, ingredients, instructions, image_url, category_id, prep_time, cook_time, servings)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    description?.trim() || null,
    JSON.stringify(parsedIngredients),
    JSON.stringify(parsedInstructions),
    image_url,
    category_id ? parseInt(category_id) : null,
    prep_time ? parseInt(prep_time) : null,
    cook_time ? parseInt(cook_time) : null,
    servings ? parseInt(servings) : null
  );

  const newRecipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ message: 'Recipe created successfully.', recipe: parseRecipe(newRecipe) });
});

/**
 * PUT /api/recipes/:id
 * Updates an existing recipe.
 */
router.put('/:id', requireAdmin, upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Recipe not found.' });

  const { title, description, ingredients, instructions, category_id, prep_time, cook_time, servings } = req.body;

  let parsedIngredients, parsedInstructions;
  try {
    parsedIngredients = ingredients ? JSON.parse(ingredients) : JSON.parse(existing.ingredients);
    parsedInstructions = instructions ? JSON.parse(instructions) : JSON.parse(existing.instructions);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON in ingredients or instructions.' });
  }

  // If a new image is uploaded, delete the old one to save space
  let image_url = existing.image_url;
  if (req.file) {
    if (existing.image_url && existing.image_url.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', existing.image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    image_url = `/uploads/${req.file.filename}`;
  }

  db.prepare(`
    UPDATE recipes SET
      title = ?, description = ?, ingredients = ?, instructions = ?,
      image_url = ?, category_id = ?, prep_time = ?, cook_time = ?,
      servings = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title?.trim() || existing.title,
    description?.trim() ?? existing.description,
    JSON.stringify(parsedIngredients),
    JSON.stringify(parsedInstructions),
    image_url,
    category_id ? parseInt(category_id) : existing.category_id,
    prep_time ? parseInt(prep_time) : existing.prep_time,
    cook_time ? parseInt(cook_time) : existing.cook_time,
    servings ? parseInt(servings) : existing.servings,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  res.json({ message: 'Recipe updated successfully.', recipe: parseRecipe(updated) });
});

/**
 * DELETE /api/recipes/:id
 * Deletes a recipe and its associated image.
 */
router.delete('/:id', requireAdmin, (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });

  // Delete the associated image file if it exists
  if (recipe.image_url && recipe.image_url.startsWith('/uploads/')) {
    const imagePath = path.join(__dirname, '..', recipe.image_url);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }

  db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Recipe deleted successfully.' });
});

module.exports = router;

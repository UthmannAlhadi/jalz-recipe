// routes/recipes.js
// All recipe CRUD endpoints.
// Images are uploaded to Cloudinary (free tier) for persistent storage.
// If Cloudinary is not configured, images are stored locally as before.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

// ─── IMAGE UPLOAD SETUP ───
// Uses Cloudinary if credentials are set, otherwise saves locally.
let upload;

if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
  // Cloudinary storage — images survive server restarts and deploys
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'jalz-recipe',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
    },
  });

  upload = multer({ storage: cloudStorage, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('Image storage: Cloudinary');
} else {
  // Local disk fallback (for development / if Cloudinary not set up)
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
  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
      else cb(new Error('Only image files are allowed.'));
    }
  });
  console.log('Image storage: local disk (set CLOUDINARY_URL for persistent images on Render)');
}

// ─── HELPER: get the public URL of an uploaded file ───
function getImageUrl(req) {
  if (!req.file) return null;
  // Cloudinary returns .path or .secure_url; multer disk returns filename
  return req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
}

// ─── HELPER: parse JSON fields stored in the database ───
function parseRecipe(r) {
  if (!r) return null;
  return {
    ...r,
    ingredients: JSON.parse(r.ingredients || '[]'),
    instructions: JSON.parse(r.instructions || '[]'),
  };
}

// ═══════════════════════════════════════════════
// PUBLIC ROUTES (no login required)
// ═══════════════════════════════════════════════

// GET /api/recipes?search=...&category=...
router.get('/', async (req, res) => {
  try {
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
      sql += ' AND (r.title ILIKE ? OR r.description ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      sql += ' AND r.category_id = ?';
      params.push(parseInt(category));
    }
    sql += ' ORDER BY r.created_at DESC';

    const recipes = await db.all(sql, params);
    res.json(recipes.map(parseRecipe));
  } catch (err) {
    console.error('Get recipes error:', err.message);
    res.status(500).json({ error: 'Could not load recipes.' });
  }
});

// GET /api/recipes/meta/categories  — must be BEFORE /:id
router.get('/meta/categories', async (req, res) => {
  try {
    await db.ready();
    res.json(await db.all('SELECT * FROM categories ORDER BY name'));
  } catch (err) {
    res.status(500).json({ error: 'Could not load categories.' });
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    await db.ready();
    const recipe = await db.get(`
      SELECT r.*, c.name AS category_name
      FROM recipes r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });
    res.json(parseRecipe(recipe));
  } catch (err) {
    res.status(500).json({ error: 'Could not load recipe.' });
  }
});

// ═══════════════════════════════════════════════
// ADMIN ROUTES (require JWT token)
// ═══════════════════════════════════════════════

// POST /api/recipes
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
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

    const image_url = getImageUrl(req);

    const newId = await db.insert(
      'INSERT INTO recipes (title, description, ingredients, instructions, image_url, category_id, prep_time, cook_time, servings) VALUES (?,?,?,?,?,?,?,?,?)',
      [
        title.trim(),
        description?.trim() || null,
        JSON.stringify(parsedIngredients),
        JSON.stringify(parsedInstructions),
        image_url,
        category_id ? parseInt(category_id) : null,
        prep_time ? parseInt(prep_time) : null,
        cook_time ? parseInt(cook_time) : null,
        servings ? parseInt(servings) : null,
      ]
    );

    const newRecipe = await db.get('SELECT * FROM recipes WHERE id = ?', [newId]);
    res.status(201).json({ message: 'Recipe created successfully.', recipe: parseRecipe(newRecipe) });
  } catch (err) {
    console.error('Create recipe error:', err.message);
    res.status(500).json({ error: 'Could not create recipe.' });
  }
});

// PUT /api/recipes/:id
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    await db.ready();
    const existing = await db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Recipe not found.' });

    const { title, description, ingredients, instructions, category_id, prep_time, cook_time, servings } = req.body;

    let parsedIngredients, parsedInstructions;
    try {
      parsedIngredients = ingredients ? JSON.parse(ingredients) : JSON.parse(existing.ingredients);
      parsedInstructions = instructions ? JSON.parse(instructions) : JSON.parse(existing.instructions);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON in ingredients or instructions.' });
    }

    // Use new image URL if a new file was uploaded, otherwise keep existing
    const image_url = req.file ? getImageUrl(req) : existing.image_url;

    await db.run(`
      UPDATE recipes SET
        title = ?, description = ?, ingredients = ?, instructions = ?,
        image_url = ?, category_id = ?, prep_time = ?, cook_time = ?,
        servings = ?, updated_at = NOW()
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

    const updated = await db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Recipe updated successfully.', recipe: parseRecipe(updated) });
  } catch (err) {
    console.error('Update recipe error:', err.message);
    res.status(500).json({ error: 'Could not update recipe.' });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await db.ready();
    const recipe = await db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });

    await db.run('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Recipe deleted successfully.' });
  } catch (err) {
    console.error('Delete recipe error:', err.message);
    res.status(500).json({ error: 'Could not delete recipe.' });
  }
});

module.exports = router;

// js/app.js
// Main application controller.
// Handles routing, UI state, user interactions, and data rendering.

// ─── APP STATE ───
let state = {
  recipes: [],
  categories: [],
  currentSearch: '',
  currentCategory: '',
  deleteTargetId: null,   // ID of recipe to delete (used by modal)
};

// ─── INITIALIZATION ───
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadCategories();
  loadRecipes();
});

// ═══════════════════════════════════════════════
// PAGE ROUTING
// ═══════════════════════════════════════════════

function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show the target page
  const page = document.getElementById(`page-${pageName}`);
  if (page) page.classList.add('active');

  // Scroll to top when changing pages
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Run page-specific setup
  if (pageName === 'add-recipe') {
    setupAddRecipeForm();
  }
}

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════

function updateAuthUI() {
  const isAdmin = Auth.isLoggedIn();

  // Toggle visibility of admin-only and guest-only elements
  document.querySelectorAll('.admin-only').forEach(el => {
    isAdmin ? el.classList.remove('hidden') : el.classList.add('hidden');
  });
  document.querySelectorAll('.guest-only').forEach(el => {
    isAdmin ? el.classList.add('hidden') : el.classList.remove('hidden');
  });

  // Update logout button text to show username
  if (isAdmin) {
    const user = Auth.getUser();
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && user) logoutBtn.textContent = `Logout (${user.username})`;
  }

  // Re-render cards to show/hide admin action buttons
  renderRecipes(state.recipes);
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');

  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    const result = await AuthAPI.login(username, password);
    Auth.setToken(result.token);
    Auth.setUser(result.user);
    showToast('Welcome back, ' + result.user.username + '! 👋', 'success');
    updateAuthUI();
    showPage('home');
    // Clear the form
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

function handleLogout() {
  Auth.clearToken();
  Auth.clearUser();
  updateAuthUI();
  showPage('home');
  showToast('Logged out successfully.', 'success');
}

// ═══════════════════════════════════════════════
// RECIPES: LOAD & RENDER
// ═══════════════════════════════════════════════

async function loadCategories() {
  try {
    state.categories = await RecipesAPI.getCategories();
    renderCategoryPills();
    populateCategoryDropdown();
  } catch (err) {
    console.error('Could not load categories:', err);
  }
}

function renderCategoryPills() {
  const container = document.getElementById('categoryPills');
  // Keep the "All" button, add category pills after it
  const existing = container.querySelectorAll('.pill:not([data-id=""])');
  existing.forEach(el => el.remove());

  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.dataset.id = cat.id;
    btn.textContent = cat.name;
    btn.onclick = () => filterByCategory(btn, cat.id);
    container.appendChild(btn);
  });
}

function populateCategoryDropdown() {
  // Populate the category <select> in the add/edit form
  const select = document.getElementById('fCategory');
  if (!select) return;

  // Remove old options (keep the placeholder)
  while (select.options.length > 1) select.remove(1);

  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

async function loadRecipes() {
  const grid = document.getElementById('recipeGrid');
  grid.innerHTML = `<div class="loading-spinner" style="grid-column:1/-1"><div class="spinner"></div><span>Loading recipes...</span></div>`;

  try {
    state.recipes = await RecipesAPI.getAll(state.currentSearch, state.currentCategory);
    renderRecipes(state.recipes);
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--danger);padding:24px">Could not load recipes. Is the server running?</p>`;
  }
}

function renderRecipes(recipes) {
  const grid = document.getElementById('recipeGrid');
  const empty = document.getElementById('emptyState');

  if (recipes.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = '';

  const isAdmin = Auth.isLoggedIn();

  recipes.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.style.animationDelay = `${index * 0.06}s`;

    const imageHTML = recipe.image_url
      ? `<img class="card-image" src="${recipe.image_url}" alt="${escapeHTML(recipe.title)}" loading="lazy" />`
      : `<div class="card-image-placeholder">🍽️</div>`;

    const metaHTML = [
      recipe.prep_time || recipe.cook_time ? `<span>⏱ ${(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>` : '',
      recipe.servings ? `<span>🍽 ${recipe.servings} servings</span>` : '',
    ].filter(Boolean).join('');

    const adminHTML = isAdmin ? `
      <div class="card-admin-actions">
        <button class="btn-edit" onclick="event.stopPropagation(); openEditRecipe(${recipe.id})">✏️ Edit</button>
        <button class="btn-delete" onclick="event.stopPropagation(); openDeleteModal(${recipe.id})">🗑 Delete</button>
      </div>
    ` : '';

    card.innerHTML = `
      ${imageHTML}
      <div class="card-body">
        ${recipe.category_name ? `<p class="card-category">${escapeHTML(recipe.category_name)}</p>` : ''}
        <h3 class="card-title">${escapeHTML(recipe.title)}</h3>
        ${recipe.description ? `<p class="card-desc">${escapeHTML(recipe.description)}</p>` : ''}
        ${metaHTML ? `<div class="card-meta">${metaHTML}</div>` : ''}
        ${adminHTML}
      </div>
    `;

    card.onclick = () => openRecipeDetail(recipe.id);
    grid.appendChild(card);
  });
}

// ─── SEARCH & FILTER ───
function handleSearch() {
  state.currentSearch = document.getElementById('searchInput').value;
  debounce(loadRecipes, 400)();
}

function filterByCategory(btnEl, categoryId) {
  state.currentCategory = categoryId;

  // Update active pill UI
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btnEl.classList.add('active');

  loadRecipes();
}

// ═══════════════════════════════════════════════
// RECIPE DETAIL VIEW
// ═══════════════════════════════════════════════

async function openRecipeDetail(id) {
  showPage('recipe-detail');
  const container = document.getElementById('recipeDetail');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><span>Loading...</span></div>`;

  try {
    const recipe = await RecipesAPI.getById(id);
    renderRecipeDetail(recipe);
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Could not load recipe.</p>`;
  }
}

function renderRecipeDetail(recipe) {
  const container = document.getElementById('recipeDetail');
  const isAdmin = Auth.isLoggedIn();
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  const imageHTML = recipe.image_url
    ? `<img class="detail-image" src="${recipe.image_url}" alt="${escapeHTML(recipe.title)}" />`
    : `<div class="detail-image-placeholder">🍽️</div>`;

  const metaItems = [
    recipe.prep_time ? { label: 'Prep Time', value: `${recipe.prep_time} min` } : null,
    recipe.cook_time ? { label: 'Cook Time', value: `${recipe.cook_time} min` } : null,
    totalTime ? { label: 'Total Time', value: `${totalTime} min` } : null,
    recipe.servings ? { label: 'Servings', value: recipe.servings } : null,
  ].filter(Boolean);

  const metaHTML = metaItems.length > 0 ? `
    <div class="detail-meta-row">
      ${metaItems.map(m => `
        <div class="detail-meta-item">
          <div class="detail-meta-label">${m.label}</div>
          <div class="detail-meta-value">${m.value}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const ingredientsHTML = recipe.ingredients.length > 0 ? `
    <div class="detail-section">
      <h3>Ingredients</h3>
      <ul class="ingredients-list">
        ${recipe.ingredients.map(ing => `<li>${escapeHTML(ing)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const instructionsHTML = recipe.instructions.length > 0 ? `
    <div class="detail-section">
      <h3>Instructions</h3>
      <ol class="instructions-list">
        ${recipe.instructions.map((step, i) => `
          <li class="instruction-step">
            <div class="step-number">${i + 1}</div>
            <div class="step-text">${escapeHTML(step)}</div>
          </li>
        `).join('')}
      </ol>
    </div>
  ` : '';

  const adminHTML = isAdmin ? `
    <div class="detail-admin-actions">
      <button class="btn-edit" onclick="openEditRecipe(${recipe.id})" style="border:1.5px solid var(--border);padding:10px 20px;border-radius:50px;font-size:0.9rem;font-weight:500;">✏️ Edit Recipe</button>
      <button class="btn-delete" onclick="openDeleteModal(${recipe.id})" style="padding:10px 20px;border-radius:50px;font-size:0.9rem;font-weight:500;background:#fff0f0;color:var(--danger);border:1.5px solid #f5c6c6;">🗑 Delete Recipe</button>
    </div>
  ` : '';

  container.innerHTML = `
    ${imageHTML}
    ${recipe.category_name ? `<p class="detail-category">${escapeHTML(recipe.category_name)}</p>` : ''}
    <h1 class="detail-title">${escapeHTML(recipe.title)}</h1>
    ${recipe.description ? `<p class="detail-description">${escapeHTML(recipe.description)}</p>` : ''}
    ${metaHTML}
    ${ingredientsHTML}
    ${instructionsHTML}
    ${adminHTML}
  `;
}

// ═══════════════════════════════════════════════
// ADD / EDIT RECIPE FORM (Admin)
// ═══════════════════════════════════════════════

function setupAddRecipeForm(recipe = null) {
  document.getElementById('formTitle').textContent = recipe ? 'Edit Recipe' : 'Add New Recipe';
  document.getElementById('editRecipeId').value = recipe ? recipe.id : '';
  document.getElementById('fTitle').value = recipe?.title || '';
  document.getElementById('fDescription').value = recipe?.description || '';
  document.getElementById('fServings').value = recipe?.servings || '';
  document.getElementById('fPrepTime').value = recipe?.prep_time || '';
  document.getElementById('fCookTime').value = recipe?.cook_time || '';

  // Set category
  const catSelect = document.getElementById('fCategory');
  if (catSelect) catSelect.value = recipe?.category_id || '';

  // Reset image preview
  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('imageUploadPlaceholder');
  if (recipe?.image_url) {
    preview.src = recipe.image_url;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    preview.src = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
  document.getElementById('fImage').value = '';

  // Populate dynamic ingredient list
  setupDynamicList('ingredientsList', 'ingredients', recipe?.ingredients || ['', '']);

  // Populate dynamic instruction list
  setupDynamicList('instructionsList', 'instructions', recipe?.instructions || ['', '']);
}

function setupDynamicList(containerId, type, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(value => addListItem(type, value));
}

function addListItem(type, value = '') {
  const containerId = type === 'ingredients' ? 'ingredientsList' : 'instructionsList';
  const container = document.getElementById(containerId);

  const div = document.createElement('div');
  div.className = 'list-item';

  const isInstruction = type === 'instructions';
  const index = container.children.length + 1;

  div.innerHTML = `
    ${isInstruction ? `<span style="font-size:0.78rem;color:var(--warm-gray);min-width:20px;text-align:center;">${index}</span>` : ''}
    <input type="text" placeholder="${isInstruction ? `Step ${index}...` : 'e.g., 2 cups flour'}" value="${escapeHTML(value)}" />
    <button type="button" class="btn-remove-item" onclick="removeListItem(this)" title="Remove">×</button>
  `;

  container.appendChild(div);
}

function removeListItem(btn) {
  const item = btn.closest('.list-item');
  const container = item.parentElement;
  if (container.children.length <= 1) {
    showToast('You need at least one item.', 'error');
    return;
  }
  item.remove();
}

function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('imageUploadPlaceholder');
  const reader = new FileReader();

  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

async function handleSaveRecipe(event) {
  event.preventDefault();

  const id = document.getElementById('editRecipeId').value;
  const isEdit = !!id;

  // Collect form data
  const title = document.getElementById('fTitle').value.trim();
  const description = document.getElementById('fDescription').value.trim();
  const category_id = document.getElementById('fCategory').value;
  const servings = document.getElementById('fServings').value;
  const prep_time = document.getElementById('fPrepTime').value;
  const cook_time = document.getElementById('fCookTime').value;
  const imageFile = document.getElementById('fImage').files[0];

  // Collect ingredient items
  const ingredientInputs = document.querySelectorAll('#ingredientsList .list-item input');
  const ingredients = Array.from(ingredientInputs).map(i => i.value.trim()).filter(Boolean);

  // Collect instruction steps
  const instructionInputs = document.querySelectorAll('#instructionsList .list-item input');
  const instructions = Array.from(instructionInputs).map(i => i.value.trim()).filter(Boolean);

  if (!title) return showToast('Recipe title is required.', 'error');
  if (ingredients.length === 0) return showToast('Add at least one ingredient.', 'error');
  if (instructions.length === 0) return showToast('Add at least one instruction step.', 'error');

  // Build FormData for multipart upload
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('ingredients', JSON.stringify(ingredients));
  formData.append('instructions', JSON.stringify(instructions));
  if (category_id) formData.append('category_id', category_id);
  if (servings) formData.append('servings', servings);
  if (prep_time) formData.append('prep_time', prep_time);
  if (cook_time) formData.append('cook_time', cook_time);
  if (imageFile) formData.append('image', imageFile);

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    if (isEdit) {
      await RecipesAPI.update(id, formData);
      showToast('Recipe updated! ✅', 'success');
    } else {
      await RecipesAPI.create(formData);
      showToast('Recipe added! 🎉', 'success');
    }
    await loadRecipes();
    showPage('home');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Recipe';
  }
}

async function openEditRecipe(id) {
  try {
    const recipe = await RecipesAPI.getById(id);
    showPage('add-recipe');
    setupAddRecipeForm(recipe);
  } catch (err) {
    showToast('Could not load recipe for editing.', 'error');
  }
}

// ═══════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════

function openDeleteModal(id) {
  state.deleteTargetId = id;
  document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
  state.deleteTargetId = null;
  document.getElementById('deleteModal').classList.add('hidden');
}

async function confirmDelete() {
  if (!state.deleteTargetId) return;

  try {
    await RecipesAPI.delete(state.deleteTargetId);
    showToast('Recipe deleted.', 'success');
    closeDeleteModal();
    await loadRecipes();
    showPage('home');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Close modal if overlay is clicked
document.getElementById('deleteModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});

// ═══════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════

// Prevent XSS: escape HTML special characters before inserting user content
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Debounce: delay function execution (used for search input)
let debounceTimer;
function debounce(fn, delay) {
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Toast notification
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.style.opacity = '1';
    }, 400);
  }, 3000);
}

// js/api.js
// Handles all communication with the backend API.
// This is a thin wrapper around fetch() with auth token management.

// ─── CONFIG ───
// In production, this auto-detects the backend URL.
// If frontend and backend are served from the same server (recommended), use ''.
const API_BASE = '';

// ─── AUTH TOKEN MANAGEMENT ───
const Auth = {
  getToken: () => localStorage.getItem('jalz_token'),
  setToken: (token) => localStorage.setItem('jalz_token', token),
  clearToken: () => localStorage.removeItem('jalz_token'),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('jalz_user')); } 
    catch { return null; }
  },
  setUser: (user) => localStorage.setItem('jalz_user', JSON.stringify(user)),
  clearUser: () => localStorage.removeItem('jalz_user'),
  isLoggedIn: () => !!localStorage.getItem('jalz_token'),
};

// ─── GENERIC FETCH WRAPPER ───
async function apiFetch(method, endpoint, body = null, isFormData = false) {
  const headers = {};

  // Attach auth token if available
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Set Content-Type only for JSON (not for FormData — browser sets it automatically)
  if (!isFormData && body) headers['Content-Type'] = 'application/json';

  const options = {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

// ─── AUTH API ───
const AuthAPI = {
  login: (username, password) =>
    apiFetch('POST', '/api/auth/login', { username, password }),

  changePassword: (currentPassword, newPassword) =>
    apiFetch('POST', '/api/auth/change-password', { currentPassword, newPassword }),
};

// ─── RECIPES API ───
const RecipesAPI = {
  // Get all recipes, with optional search and category filter
  getAll: (search = '', categoryId = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('category', categoryId);
    const query = params.toString();
    return apiFetch('GET', `/api/recipes${query ? '?' + query : ''}`);
  },

  // Get a single recipe by ID
  getById: (id) => apiFetch('GET', `/api/recipes/${id}`),

  // Get all categories
  getCategories: () => apiFetch('GET', '/api/recipes/meta/categories'),

  // Create a new recipe (FormData for image upload)
  create: (formData) => apiFetch('POST', '/api/recipes', formData, true),

  // Update a recipe (FormData for image upload)
  update: (id, formData) => apiFetch('PUT', `/api/recipes/${id}`, formData, true),

  // Delete a recipe
  delete: (id) => apiFetch('DELETE', `/api/recipes/${id}`),
};

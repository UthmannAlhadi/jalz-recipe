# 🍳 Jalz Recipe — Release 3

Family recipe web app. Admins can add, edit, and delete recipes with images. Guests can browse and search freely.

---

## What Changed in Release 3

- **Database moved to PostgreSQL (Neon.tech)** — recipes and passwords now persist permanently, even when Render restarts or redeploys.
- **Images moved to Cloudinary** — recipe photos now survive server restarts.
- **All 3 bugs fixed**: recipe loss, image display failure, and password revert.

---

## Project Structure

```
jalz-recipe/
├── backend/
│   ├── db/database.js      ← PostgreSQL connection + schema
│   ├── middleware/auth.js  ← JWT protection
│   ├── routes/auth.js      ← Login / change password
│   ├── routes/recipes.js   ← CRUD + Cloudinary image upload
│   ├── server.js           ← Express server entry point
│   ├── package.json
│   └── .env.example        ← Copy to .env for local dev
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js
│       └── app.js
└── README.md
```

---

## Tech Stack

| Layer    | Technology              | Why                                     |
|----------|-------------------------|-----------------------------------------|
| Frontend | HTML + CSS + JS         | No build step, works everywhere         |
| Backend  | Node.js + Express       | Simple, free on Render                  |
| Database | PostgreSQL (Neon.tech)  | Free, permanent, survives restarts      |
| Images   | Cloudinary (free tier)  | Permanent image hosting, free           |
| Auth     | JWT + bcrypt            | Secure, stateless                       |
| Hosting  | Render.com (free tier)  | Free Node.js hosting                    |

---

## ══════════════════════════════════
## FIRST-TIME SETUP: 3 FREE Services
## ══════════════════════════════════

You need accounts on 3 free services. Each takes about 5 minutes.

---

### STEP 1 — Get a Free PostgreSQL Database (Neon.tech)

1. Go to **https://neon.tech** and sign up for free (use GitHub login for speed)
2. Click **"New Project"**
3. Name it `jalz-recipe`, choose the region closest to you (e.g. Singapore)
4. Click **"Create Project"**
5. On the next screen, find the **Connection string** section
6. Make sure **"Connection string"** tab is selected (not "Parameters")
7. Copy the full string — it looks like:
   ```
   postgresql://alex:password123@ep-cool-name.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
8. Save this — you'll need it in Step 4.

---

### STEP 2 — Get Free Image Hosting (Cloudinary)

1. Go to **https://cloudinary.com** and sign up for free
2. After signing in, go to your **Dashboard**
3. You'll see three values at the top — copy all three:
   - **Cloud name** (e.g. `dxyz12abc`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `AbCdEfGhIjKlMnOpQrStUv`)
4. Save these — you'll need them in Step 4.

---

### STEP 3 — Push Your Code to GitHub

If you haven't already:

```bash
cd jalz-recipe
git init
git add .
git commit -m "Release 3: PostgreSQL + Cloudinary"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jalz-recipe.git
git push -u origin main
```

If you already have the repo, just push the updated files:
```bash
git add .
git commit -m "Release 3: fix data persistence and image display"
git push
```

---

### STEP 4 — Set Environment Variables on Render

1. Go to your Render dashboard → click your `jalz-recipe` service
2. Click the **"Environment"** tab
3. Add these environment variables one by one:

| Key                    | Value                                         |
|------------------------|-----------------------------------------------|
| `DATABASE_URL`         | The full connection string from Neon (Step 1) |
| `JWT_SECRET`           | Any long random string (click "Generate")     |
| `CLOUDINARY_CLOUD_NAME`| Your cloud name from Cloudinary (Step 2)      |
| `CLOUDINARY_API_KEY`   | Your API key from Cloudinary (Step 2)         |
| `CLOUDINARY_API_SECRET`| Your API secret from Cloudinary (Step 2)      |

4. Click **"Save Changes"**
5. Render will automatically redeploy

---

### STEP 5 — Verify It Works

After the deploy succeeds (green checkmark):

1. Open your app URL
2. Click **Admin Login** → log in with `admin` / `admin123`
3. Add a test recipe with a photo
4. Refresh the page — recipe should still be there ✅
5. Close the browser, wait a few minutes, reopen — recipe still there ✅
6. Go to **🔑 Password** → change your password
7. Log out, close browser, reopen → log in with new password ✅

---

## Local Development Setup

```bash
# 1. Install Node.js from nodejs.org

# 2. Install dependencies
cd jalz-recipe/backend
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your DATABASE_URL and Cloudinary values

# 4. Start the server
npm start
```

Open http://localhost:3000

> For local dev, you can use the same Neon database as production,
> or create a separate Neon project for local testing.

---

## Default Admin Credentials

```
Username: admin
Password: admin123
```

**Change this immediately after first login** using the 🔑 Password button in the navbar.

---

## API Reference

| Method | Endpoint                       | Auth  | Description              |
|--------|--------------------------------|-------|--------------------------|
| POST   | `/api/auth/login`              | None  | Admin login              |
| POST   | `/api/auth/change-password`    | Admin | Change admin password    |
| GET    | `/api/recipes`                 | None  | List all recipes         |
| GET    | `/api/recipes?search=keyword`  | None  | Search recipes           |
| GET    | `/api/recipes?category=id`     | None  | Filter by category       |
| GET    | `/api/recipes/meta/categories` | None  | List all categories      |
| GET    | `/api/recipes/:id`             | None  | Get single recipe        |
| POST   | `/api/recipes`                 | Admin | Create recipe            |
| PUT    | `/api/recipes/:id`             | Admin | Update recipe            |
| DELETE | `/api/recipes/:id`             | Admin | Delete recipe            |
| GET    | `/api/health`                  | None  | Server health check      |

---

## Troubleshooting

**"Database initialization failed"**
- Check that `DATABASE_URL` is set correctly in Render environment variables
- Make sure you copied the full Neon connection string including `?sslmode=require`

**Images not showing after upload**
- Check that all three Cloudinary env vars are set (`CLOUD_NAME`, `API_KEY`, `API_SECRET`)
- Check Render deploy logs for "Image storage: Cloudinary" — if it says "local disk", the vars are missing

**"Invalid username or password" after password change**
- This is now fixed. PostgreSQL persists the change permanently.

**Build failed on Render**
- Make sure `Root Directory` is set to `backend` in Render service settings
- Check that `package.json` is inside the `backend/` folder

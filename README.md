# 🍳 Jalz Recipe

A full-stack web application for managing and sharing family recipes. Admins can add, edit, and delete recipes with images; guests can browse and search freely — no account needed.

---

## 📁 Project Structure

```
jalz-recipe/
├── backend/                  ← Node.js + Express API server
│   ├── db/
│   │   └── database.js       ← SQLite setup & schema
│   ├── middleware/
│   │   └── auth.js           ← JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           ← Login / change password
│   │   └── recipes.js        ← Recipe CRUD + image upload
│   ├── data/                 ← Auto-created: SQLite database file
│   ├── uploads/              ← Auto-created: recipe images
│   ├── server.js             ← Main Express server
│   ├── package.json
│   └── .env.example          ← Copy to .env for local setup
├── frontend/                 ← HTML/CSS/JS frontend
│   ├── css/style.css
│   ├── js/
│   │   ├── api.js            ← API communication layer
│   │   └── app.js            ← Application logic
│   └── index.html
├── render.yaml               ← Render.com deployment config
├── .gitignore
└── README.md
```

---

## 🚀 Technology Stack

| Layer      | Technology            | Why                                          |
|------------|-----------------------|----------------------------------------------|
| Frontend   | HTML + CSS + JS       | Zero build step, works on any free host      |
| Backend    | Node.js + Express     | Simple, fast, widely supported               |
| Database   | SQLite (better-sqlite3) | File-based, zero config, free forever      |
| Auth       | JWT + bcrypt          | Stateless, secure, no session storage needed |
| Images     | Local disk via Multer | Simple file upload, persistent on Render     |
| Hosting    | Render.com            | Free tier, supports Node.js + persistent disk|

---

## 🖥️ Local Setup (Run on Your Computer)

### Prerequisites
- **Node.js** v18 or higher — download from [nodejs.org](https://nodejs.org)
- **Git** — download from [git-scm.com](https://git-scm.com)

### Step 1: Clone or Download the Project

If you downloaded a ZIP, extract it. Or clone from GitHub:
```bash
git clone https://github.com/YOUR_USERNAME/jalz-recipe.git
cd jalz-recipe
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

### Step 3: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Open .env and set a secure JWT_SECRET:
# JWT_SECRET=some-long-random-string-here
```

### Step 4: Start the Server

```bash
# From the backend/ folder:
npm start

# Or for development with auto-restart:
npm run dev
```

### Step 5: Open the App

Open your browser and go to: **http://localhost:3000**

The app will automatically:
- Create the SQLite database at `backend/data/jalz_recipe.db`
- Seed default categories
- Create a default admin user
- Add one sample recipe (Nasi Lemak)

---

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin123
```

> ⚠️ **IMPORTANT**: Change this password immediately after your first login!
> Go to... (future: add change password UI). For now, you can update it via the API:
> 
> ```bash
> curl -X POST http://localhost:3000/api/auth/change-password \
>   -H "Authorization: Bearer YOUR_TOKEN" \
>   -H "Content-Type: application/json" \
>   -d '{"currentPassword":"admin123","newPassword":"YourNewPassword"}'
> ```

---

## 🌐 Deploy to the Internet (Free on Render.com)

Render.com offers a **free tier** for web services with persistent disk storage — perfect for this app.

### Step 1: Push Your Code to GitHub

1. Create a free account at [github.com](https://github.com)
2. Create a new repository named `jalz-recipe`
3. Push your code:

```bash
cd jalz-recipe   # from the root project folder
git init
git add .
git commit -m "Initial commit: Jalz Recipe app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jalz-recipe.git
git push -u origin main
```

### Step 2: Create a Render.com Account

Go to [render.com](https://render.com) and sign up for free.

### Step 3: Create a New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account and select your `jalz-recipe` repository
3. Fill in these settings:

| Setting         | Value                    |
|-----------------|--------------------------|
| Name            | `jalz-recipe`            |
| Region          | Singapore (closest to MY)|
| Branch          | `main`                   |
| Root Directory  | `backend`                |
| Build Command   | `npm install`            |
| Start Command   | `npm start`              |
| Instance Type   | **Free**                 |

### Step 4: Add Environment Variables

In the Render dashboard → **Environment** tab:

| Key            | Value                                   |
|----------------|-----------------------------------------|
| `JWT_SECRET`   | (click "Generate" for a secure value)   |
| `NODE_ENV`     | `production`                            |

### Step 5: Add Persistent Disk (for Database + Images)

1. Go to **Disks** tab in your Render service
2. Click **"Add Disk"**
3. Set:
   - **Name**: `jalz-recipe-data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB (free)

> 💡 This ensures your recipes and images are NOT deleted when the server restarts.

### Step 6: Deploy

Click **"Create Web Service"**. Render will:
1. Clone your code from GitHub
2. Run `npm install`
3. Start the server with `npm start`

After 2–3 minutes, your app will be live at:
```
https://jalz-recipe.onrender.com
```
(or a similar URL shown in your Render dashboard)

### Step 7: Make Image Uploads Work on Production

The upload path on Render needs a small change. In `backend/routes/recipes.js`, the `uploadDir` should point to your mounted disk. The server is already set up to work correctly — no changes needed if you follow the disk mount path above.

---

## 📱 How to Use the App

### As a Guest (No Login Needed)
1. Open the app URL in any browser
2. Browse all recipes on the home page
3. Click a category pill to filter recipes
4. Type in the search bar to find a specific recipe
5. Click any recipe card to see the full recipe

### As an Admin
1. Click **"Admin Login"** in the top right
2. Enter your username and password
3. You now see **Edit** and **Delete** buttons on every recipe
4. Click **"+ Add Recipe"** in the navbar to add a new recipe
5. Fill in the form: title, description, category, ingredients, steps, and an optional photo
6. Click **"Save Recipe"**
7. Click **"Logout"** when done

---

## 🔌 API Reference

All API endpoints:

| Method | Endpoint                        | Auth     | Description                     |
|--------|---------------------------------|----------|---------------------------------|
| POST   | `/api/auth/login`               | None     | Admin login                     |
| POST   | `/api/auth/change-password`     | Admin    | Change admin password           |
| GET    | `/api/recipes`                  | None     | Get all recipes (+ search)      |
| GET    | `/api/recipes/:id`              | None     | Get single recipe               |
| GET    | `/api/recipes/meta/categories`  | None     | Get all categories              |
| POST   | `/api/recipes`                  | Admin    | Create recipe (multipart form)  |
| PUT    | `/api/recipes/:id`              | Admin    | Update recipe (multipart form)  |
| DELETE | `/api/recipes/:id`              | Admin    | Delete recipe                   |
| GET    | `/api/health`                   | None     | Server health check             |

---

## 🛠️ Common Issues & Fixes

**App shows "Could not load recipes"**
- Make sure the backend server is running (`npm start` in the `backend/` folder)
- Check that you're at `http://localhost:3000` (not port 5500 or similar)

**Images don't appear after deploying**
- Make sure the Render disk is mounted at `/opt/render/project/src/data`
- Check that the `uploads/` folder is inside the mounted disk path

**Login says "Invalid username or password"**
- Default credentials: `admin` / `admin123`
- These are case-sensitive

**"jwt malformed" or "Invalid token" errors**
- Your token expired (24 hour lifetime). Just log out and log in again.

**Render free tier "spins down" after inactivity**
- The free Render tier pauses services after 15 minutes of inactivity
- The first request after a pause takes ~30 seconds to "wake up"
- This is normal for the free tier. Upgrading to a paid plan removes this.

---

## 🔮 Future Enhancements (Planned)

- [ ] Family accounts (invite family members)
- [ ] Video embedding per recipe
- [ ] Print-friendly recipe view
- [ ] Recipe rating / favourites
- [ ] Change admin password from the UI

---

## 📄 License

Personal use. Built with ❤️ for the Jalz family.

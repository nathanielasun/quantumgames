# Quantum Games — Documentation

> A modular game hosting platform built with Next.js. Each game is an independent repository integrated into a unified website.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Adding a New Game](#2-adding-a-new-game)
3. [Updating an Existing Game](#3-updating-an-existing-game)
4. [Build & Deploy](#4-build--deploy)
5. [Game Development Guide](#5-game-development-guide)
6. [Removing a Game](#6-removing-a-game)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Clone & Install

```bash
# Clone with all game submodules
git clone --recurse-submodules https://github.com/<org>/quantumgames.git
cd quantumgames

# Install dependencies
npm install

# Start dev server
npm run dev
```

The site is available at `http://localhost:3000`. All games are accessible at `/games/<slug>`.

### If you already cloned without submodules

```bash
git submodule update --init --recursive
```

---

## 2. Adding a New Game

### Step 1: Prepare your game repository

Your game repo must include a `game.config.json` at its root. This file tells the main site how to integrate your game.

```json
{
  "slug": "my-game",
  "title": "My Game",
  "description": "A short description of the game.",
  "type": "react",
  "entry": "src/index.tsx",
  "thumbnail": "thumbnail.png",
  "tags": ["puzzle", "singleplayer"],
  "minPlayers": 1,
  "maxPlayers": 1,
  "version": "1.0.0"
}
```

#### Config field reference

| Field | Required | Type | Description |
|---|---|---|---|
| `slug` | Yes | `string` | URL-safe identifier. Must match the submodule directory name. Lowercase, hyphens only. |
| `title` | Yes | `string` | Display name shown in the game catalog. |
| `description` | Yes | `string` | Short description (1-2 sentences) for the catalog card. |
| `type` | Yes | `string` | One of: `"react"`, `"python"`, `"python-server"`, `"static"`. See §5 for details on each type. |
| `entry` | Yes | `string` | Path to the game's entrypoint, relative to the game repo root. |
| `thumbnail` | Yes | `string` | Path to a thumbnail image (recommended 600x400px), relative to repo root. |
| `tags` | No | `string[]` | Tags for catalog filtering (e.g., `["puzzle", "multiplayer"]`). |
| `minPlayers` | No | `number` | Minimum players. Defaults to 1. |
| `maxPlayers` | No | `number` | Maximum players. Defaults to 1. |
| `version` | No | `string` | Semver version string. |
| `buildCommand` | No | `string` | Custom build command (for `static` type games). |
| `buildOutput` | No | `string` | Directory containing build output (for `static` type games). |
| `pythonVersion` | No | `string` | Python version requirement (for `python-server` type). |
| `serverPort` | No | `number` | Port the server listens on (for `python-server` type). |

### Step 2: Add the game as a submodule

From the `quantumgames` root:

```bash
# Add the submodule — directory name MUST match the slug
git submodule add https://github.com/<org>/<game-repo>.git games/my-game

# Commit the addition
git add .gitmodules games/my-game
git commit -m "Add game: my-game"
```

Or use the helper script:

```bash
npm run add-game
# Follow the interactive prompts
```

### Step 3: Rebuild the game registry

```bash
npm run build:games
```

This reads all `games/*/game.config.json` files and regenerates `lib/game-registry.ts`.

### Step 4: Verify locally

```bash
npm run dev
# Navigate to http://localhost:3000/games/my-game
```

### Step 5: Deploy

Push to your main branch. If using Vercel, it will automatically detect the submodule and rebuild.

```bash
git push origin main
```

---

## 3. Updating an Existing Game

Games are pinned to specific commits via git submodules. To update a game to its latest version:

### Update a single game

```bash
cd games/my-game
git checkout main
git pull origin main
cd ../..

# Commit the submodule pointer update
git add games/my-game
git commit -m "Update game: my-game to latest"
git push origin main
```

### Update all games at once

```bash
git submodule update --remote --merge

# Review changes
git diff --submodule

# Commit
git add games/
git commit -m "Update all games to latest"
git push origin main
```

### Update a game to a specific version/commit

```bash
cd games/my-game
git checkout v2.0.0   # or a specific commit hash
cd ../..

git add games/my-game
git commit -m "Pin my-game to v2.0.0"
```

### After updating

Always verify the game still works:

```bash
npm run build:games
npm run dev
# Test at http://localhost:3000/games/my-game
```

---

## 4. Build & Deploy

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build all games + Next.js production build |
| `npm run build:all` | Sync submodules + full build (used in CI) |
| `npm run build:games` | Regenerate game registry + build individual games |
| `npm start` | Start production server (after build) |
| `npm run add-game` | Interactive helper to add a new game submodule |

### Build pipeline

The build proceeds in this order:

1. **Sync submodules** — `git submodule update --init --recursive`
2. **Register games** — Read all `game.config.json` files → generate `lib/game-registry.ts`
3. **Build each game** based on its `type`:
   - `react`: Verify entry exports a valid component, install game-specific deps
   - `python`: Copy source files, validate Pyodide compatibility
   - `static`: Run `buildCommand`, copy `buildOutput` to `public/games/<slug>/`
   - `python-server`: Build Docker image or prepare serverless function
4. **Build Next.js** — `next build`

### Vercel deployment

Vercel handles deployment automatically on push. Configuration in `vercel.json`:

```json
{
  "buildCommand": "npm run build:all",
  "framework": "nextjs",
  "git": {
    "submodules": true
  }
}
```

Ensure your Vercel project settings have:
- **Framework Preset**: Next.js
- **Root Directory**: `.` (default)
- **Build Command**: `npm run build:all`

### Self-hosting with Docker

```bash
# Build
docker build -t quantumgames .

# Run
docker run -p 3000:3000 quantumgames
```

For games with Python servers, use Docker Compose:

```bash
docker compose up --build
```

---

## 5. Game Development Guide

### 5.1 React/TypeScript Games (`type: "react"`)

This is the most common game type. Your game is a React component dynamically imported into the Next.js app.

#### Requirements

1. **Entry file** (e.g., `src/index.tsx`) must have a **default export** that is a React component:

```tsx
import React from "react";

interface GameProps {
  onExit?: () => void;  // Optional: called when player wants to leave
}

const MyGame: React.FC<GameProps> = ({ onExit }) => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <h1>My Game</h1>
      <button onClick={onExit}>Back to Catalog</button>
      {/* Game content */}
    </div>
  );
};

export default MyGame;
```

2. **`package.json`** with your game's dependencies. React and ReactDOM are provided by the host — do **not** bundle your own copy.

```json
{
  "name": "my-game",
  "version": "1.0.0",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "three": "^0.160.0"
  }
}
```

3. **Self-contained rendering**: Your component receives a full-width container. Do not make assumptions about the parent DOM structure.

4. **No side effects on import**: Do not run game logic at module scope. Initialize in `useEffect` or on user interaction.

#### Developing locally

You can develop your game standalone with a simple Vite/CRA setup, then integrate:

```bash
# In your game repo
npm install
npm run dev  # Your own dev server

# To test inside the main site
cd /path/to/quantumgames
npm run dev
# Visit http://localhost:3000/games/my-game
```

### 5.2 Python Games — In-Browser (`type: "python"`)

For Python games that run entirely in the browser using Pyodide.

#### Requirements

1. **Entry file** (e.g., `src/main.py`) must define a `main()` function:

```python
def main(canvas, input_handler):
    """
    Called by the Pyodide runner.

    Args:
        canvas: JavaScript canvas element (for rendering)
        input_handler: Object with keyboard/mouse event streams
    """
    # Game loop here
    pass
```

2. **`requirements.txt`** with Pyodide-compatible packages only. Check [Pyodide package list](https://pyodide.org/en/stable/usage/packages-in-pyodide.html).

3. **No filesystem or network access** from Python. All I/O goes through the JS bridge.

#### Limitations

- Maximum ~50MB of packages (loaded over network)
- No threading (single-threaded browser environment)
- No native C extensions unless pre-built for Pyodide (numpy, scipy are available)

### 5.3 Python Games — Server (`type: "python-server"`)

For Python games that need a backend (multiplayer, databases, heavy computation).

#### Requirements

1. **`server.py`** or equivalent with a web server (FastAPI, Flask):

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

2. **`Dockerfile`**:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

3. **`game.config.json`** must include `serverPort`:

```json
{
  "slug": "multiplayer-chess",
  "type": "python-server",
  "entry": "server.py",
  "serverPort": 8000
}
```

The main site embeds your game in an iframe. The server URL is configured per environment.

### 5.4 Static Engine Games (`type: "static"`)

For games built with Phaser, Unity, Godot, or any engine that exports a static web build.

#### Requirements

1. **`game.config.json`** must include `buildCommand` and `buildOutput`:

```json
{
  "slug": "space-shooter",
  "type": "static",
  "entry": "index.html",
  "buildCommand": "npm run build",
  "buildOutput": "dist"
}
```

2. The build output directory must contain an `index.html` that boots the game.

3. At build time, the output is copied to `public/games/<slug>/` and served via iframe.

---

## 6. Removing a Game

```bash
# Remove the submodule
git submodule deinit -f games/my-game
git rm -f games/my-game
rm -rf .git/modules/games/my-game

# Clean up any static build artifacts
rm -rf public/games/my-game

# Rebuild registry
npm run build:games

# Commit
git add .
git commit -m "Remove game: my-game"
```

---

## 7. Troubleshooting

### Game shows blank/white screen

- Check the browser console for errors
- Verify the entry file has a valid default export
- Ensure all dependencies are installed (`npm install` in both root and game directory)
- For Python games: check that packages are Pyodide-compatible

### Submodule shows empty directory

```bash
git submodule update --init --recursive
```

### Build fails with "Cannot find module"

- Game dependencies may not be installed. Run `npm install` in the game directory.
- Check that the entry path in `game.config.json` matches the actual file.

### Game works locally but not on Vercel

- Ensure `vercel.json` has `"git": { "submodules": true }`
- Check Vercel build logs for submodule fetch errors (may need to make repos public or configure deploy keys)
- Verify `buildCommand` is set to `npm run build:all`

### Python game fails to load packages

- Verify packages are listed in the [Pyodide compatibility list](https://pyodide.org/en/stable/usage/packages-in-pyodide.html)
- Some packages require specific versions for Pyodide compatibility
- Check browser console for micropip installation errors

### iframe game not loading

- Check that the build output exists in `public/games/<slug>/`
- Verify the `index.html` file is present and valid
- For server games: ensure the server is running and accessible at the configured URL
- Check for CORS issues in browser console

### Multiple games have dependency conflicts

If two React games need incompatible versions of a shared library:

1. **Preferred**: Align versions across games
2. **Alternative**: Convert the conflicting game to `type: "static"` and build it independently with its own bundler. It will be served via iframe, fully isolating its dependencies.

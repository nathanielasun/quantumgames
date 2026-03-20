#!/usr/bin/env bash
# Interactive helper to add a new game as a git submodule.

set -euo pipefail

echo "=== Add a new game to Quantum Games ==="
echo ""

read -rp "Game slug (lowercase, hyphens, e.g. 'my-game'): " slug
read -rp "Git repository URL: " repo_url

if [ -z "$slug" ] || [ -z "$repo_url" ]; then
  echo "ERROR: slug and repo URL are required."
  exit 1
fi

# Validate slug format
if ! echo "$slug" | grep -qE '^[a-z0-9][a-z0-9-]*$'; then
  echo "ERROR: slug must be lowercase alphanumeric with hyphens only."
  exit 1
fi

if [ -d "games/$slug" ]; then
  echo "ERROR: games/$slug already exists."
  exit 1
fi

echo ""
echo "Adding submodule: $repo_url -> games/$slug"
git submodule add "$repo_url" "games/$slug"

# Validate game.config.json exists
if [ ! -f "games/$slug/game.config.json" ]; then
  echo ""
  echo "WARNING: games/$slug/game.config.json not found."
  echo "The game repository must include a game.config.json. See docs.md for the schema."
  exit 1
fi

# Validate slug matches
config_slug=$(node -e "console.log(JSON.parse(require('fs').readFileSync('games/$slug/game.config.json','utf-8')).slug)")
if [ "$config_slug" != "$slug" ]; then
  echo "ERROR: game.config.json slug '$config_slug' does not match directory slug '$slug'"
  exit 1
fi

echo ""
echo "Regenerating game registry..."
npx tsx scripts/register-games.ts

echo ""
echo "Done! Game '$slug' has been added."
echo "Run 'npm run dev' and visit http://localhost:3000/games/$slug"

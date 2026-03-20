#!/usr/bin/env bash
# Build each game based on its type.
# Called by: npm run build:games (after register-games.ts)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
GAMES_DIR="$ROOT_DIR/games"
PUBLIC_GAMES_DIR="$ROOT_DIR/public/games"

if [ ! -d "$GAMES_DIR" ]; then
  echo "No games/ directory. Nothing to build."
  exit 0
fi

for game_dir in "$GAMES_DIR"/*/; do
  [ -d "$game_dir" ] || continue

  config_file="$game_dir/game.config.json"
  [ -f "$config_file" ] || continue

  slug=$(basename "$game_dir")
  type=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file','utf-8')).type)")

  echo "==> Building game: $slug (type: $type)"

  case "$type" in
    react)
      # Install game-specific dependencies if package.json exists
      if [ -f "$game_dir/package.json" ]; then
        echo "    Installing dependencies for $slug..."
        (cd "$game_dir" && npm install --ignore-scripts 2>/dev/null || true)
      fi
      # Copy thumbnail to public if it exists
      thumbnail=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file','utf-8')).thumbnail || '')")
      if [ -n "$thumbnail" ] && [ -f "$game_dir/$thumbnail" ]; then
        mkdir -p "$PUBLIC_GAMES_DIR/$slug"
        cp "$game_dir/$thumbnail" "$PUBLIC_GAMES_DIR/$slug/"
      fi
      echo "    Done (React game — will be dynamically imported)."
      ;;

    python)
      # Copy Python source + thumbnail to public for Pyodide to fetch
      mkdir -p "$PUBLIC_GAMES_DIR/$slug"
      entry=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file','utf-8')).entry)")
      cp "$game_dir/$entry" "$PUBLIC_GAMES_DIR/$slug/"
      if [ -f "$game_dir/requirements.txt" ]; then
        cp "$game_dir/requirements.txt" "$PUBLIC_GAMES_DIR/$slug/"
      fi
      thumbnail=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file','utf-8')).thumbnail || '')")
      if [ -n "$thumbnail" ] && [ -f "$game_dir/$thumbnail" ]; then
        cp "$game_dir/$thumbnail" "$PUBLIC_GAMES_DIR/$slug/"
      fi
      echo "    Done (Python/Pyodide game — source copied to public)."
      ;;

    static)
      # Run the game's build command and copy output to public
      build_cmd=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file','utf-8')).buildCommand || '')")
      build_out=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file','utf-8')).buildOutput || 'dist')")

      if [ -n "$build_cmd" ]; then
        echo "    Running: $build_cmd"
        (cd "$game_dir" && eval "$build_cmd")
      fi

      if [ -d "$game_dir/$build_out" ]; then
        mkdir -p "$PUBLIC_GAMES_DIR/$slug"
        cp -r "$game_dir/$build_out/." "$PUBLIC_GAMES_DIR/$slug/"
        echo "    Done (static game — built and copied to public)."
      else
        echo "    WARNING: Build output directory '$build_out' not found for $slug"
      fi
      ;;

    python-server)
      # Server games are deployed separately. Just copy thumbnail.
      thumbnail=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file','utf-8')).thumbnail || '')")
      if [ -n "$thumbnail" ] && [ -f "$game_dir/$thumbnail" ]; then
        mkdir -p "$PUBLIC_GAMES_DIR/$slug"
        cp "$game_dir/$thumbnail" "$PUBLIC_GAMES_DIR/$slug/"
      fi
      echo "    Done (python-server — deployed separately)."
      ;;

    *)
      echo "    WARNING: Unknown game type '$type' for $slug"
      ;;
  esac
done

echo ""
echo "All games built."

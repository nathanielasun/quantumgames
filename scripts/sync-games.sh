#!/usr/bin/env bash
# Pull/update all game submodules to their latest commits.

set -euo pipefail

echo "Syncing all game submodules..."
git submodule update --init --recursive
git submodule foreach git pull origin main || true
echo "Done."

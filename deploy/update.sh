#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Unified Ads MCP — Update / Redeploy Script
# Run from your local machine: bash deploy/update.sh root@your-droplet-ip
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REMOTE="${1:-}"
if [[ -z "$REMOTE" ]]; then
  echo "Usage: bash deploy/update.sh root@your-server-ip"
  exit 1
fi

echo "Building locally..."
npm run build

echo "Uploading to $REMOTE..."
rsync -az --exclude='node_modules' --exclude='.env' --exclude='.git' \
  ./ "$REMOTE:/root/unified-ads-mcp/"

echo "Installing deps + restarting..."
ssh "$REMOTE" "cd /root/unified-ads-mcp && npm install --omit=dev && pm2 restart unified-ads-mcp --update-env"

echo "Done! Checking health..."
sleep 2
ssh "$REMOTE" "curl -s http://localhost:3000/health | node -e \"const d=require('fs').readFileSync('/dev/stdin','utf8'); const j=JSON.parse(d); console.log('Status:', j.status, '| Tools:', j.tools);\""

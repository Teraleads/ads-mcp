#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Unified Ads MCP — DigitalOcean Droplet Setup Script
# Run as root on a fresh Ubuntu 24.04 droplet:
#   bash setup.sh YOUR_DOMAIN
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Usage: bash setup.sh your-domain.com"
  exit 1
fi

echo "=================================================="
echo " Unified Ads MCP — Server Setup"
echo " Domain: $DOMAIN"
echo "=================================================="

# ─── System packages ──────────────────────────────────────────────────────────
echo "[1/7] Installing system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl git ufw nginx certbot python3-certbot-nginx

# ─── Node.js 20 ───────────────────────────────────────────────────────────────
echo "[2/7] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt-get install -y -qq nodejs
npm install -g pm2 > /dev/null 2>&1
echo "  Node: $(node --version)  npm: $(npm --version)  pm2: $(pm2 --version)"

# ─── Firewall ─────────────────────────────────────────────────────────────────
echo "[3/7] Configuring firewall..."
ufw --force reset > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow ssh > /dev/null 2>&1
ufw allow 'Nginx Full' > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
echo "  UFW status: $(ufw status | head -1)"

# ─── App directory + logs ─────────────────────────────────────────────────────
echo "[4/7] Creating directories..."
mkdir -p /root/ads-mcp /root/logs
if [[ ! -f /root/ads-mcp/package.json ]]; then
  echo "  NOTE: Upload your code to /root/ads-mcp/ and re-run step 5+"
fi

# ─── nginx ────────────────────────────────────────────────────────────────────
echo "[5/7] Configuring nginx..."
NGINX_CONF="/etc/nginx/sites-available/ads-mcp"
sed "s/YOUR_DOMAIN/$DOMAIN/g" /root/ads-mcp/deploy/nginx.conf > "$NGINX_CONF" || \
  echo "  WARNING: deploy/nginx.conf not found — copy it manually to $NGINX_CONF"

if [[ -f "$NGINX_CONF" ]]; then
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/ads-mcp
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  echo "  nginx configured for $DOMAIN"
fi

# ─── SSL ──────────────────────────────────────────────────────────────────────
echo "[6/7] Obtaining SSL certificate..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || \
  echo "  WARNING: certbot failed — make sure DNS for $DOMAIN points to this server's IP"

# ─── PM2 startup ──────────────────────────────────────────────────────────────
echo "[7/7] Setting up PM2 startup..."
pm2 startup systemd -u root --hp /root > /dev/null 2>&1
echo "  PM2 configured to start on boot"

echo ""
echo "=================================================="
echo " Setup complete!"
echo ""
echo " Next steps:"
echo "  1. Upload code:   scp -r ads-mcp root@$(curl -s ifconfig.me):/root/"
echo "  2. Configure:     cp /root/ads-mcp/.env.example /root/ads-mcp/.env"
echo "                    nano /root/ads-mcp/.env  (fill in API keys)"
echo "  3. Build + start: cd /root/ads-mcp && npm install && npm run build"
echo "                    pm2 start ecosystem.config.cjs"
echo "                    pm2 save"
echo "  4. Test:          curl https://$DOMAIN/health"
echo "=================================================="

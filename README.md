# Unified Ads MCP Server

A single MCP server connecting Claude (or any MCP client) to all four major ad platforms:
**Google Ads · Meta (Facebook/Instagram) · TikTok Ads · LinkedIn Ads**

---

## Features

- **26 tools** covering campaigns, ad groups, creatives, performance analytics, and demographic breakdowns
- **Dual transport**: runs as `stdio` (local Claude Desktop) or `http` (remote DigitalOcean)
- **Bearer token auth** when running in HTTP mode
- **Per-platform credentials** — only configure what you use; unconfigured platforms return a helpful error

---

## Quick Start (Local / Claude Desktop)

```bash
# 1. Install dependencies
npm install

# 2. Configure credentials
cp .env.example .env
# Edit .env with your API keys

# 3. Run in dev mode
npm run dev

# 4. Or build and run
npm run build && npm start
```

Add to `claude_desktop_config.json` (`~/Library/Application Support/Claude/` on Mac):

```json
{
  "mcpServers": {
    "unified-ads": {
      "command": "node",
      "args": ["/absolute/path/to/unified-ads-mcp/dist/index.js"],
      "env": {
        "GOOGLE_ADS_CLIENT_ID": "...",
        "GOOGLE_ADS_CLIENT_SECRET": "...",
        "GOOGLE_ADS_DEVELOPER_TOKEN": "...",
        "GOOGLE_ADS_REFRESH_TOKEN": "...",
        "GOOGLE_ADS_CUSTOMER_ID": "...",
        "META_ACCESS_TOKEN": "...",
        "META_AD_ACCOUNT_ID": "act_...",
        "TIKTOK_ACCESS_TOKEN": "...",
        "TIKTOK_APP_ID": "...",
        "TIKTOK_APP_SECRET": "...",
        "TIKTOK_ADVERTISER_ID": "...",
        "LINKEDIN_ACCESS_TOKEN": "...",
        "LINKEDIN_ACCOUNT_ID": "..."
      }
    }
  }
}
```

---

## Deploy to DigitalOcean (Remote MCP)

### 1. Provision a Droplet

Create a $12/month Droplet (2GB RAM, Ubuntu 24.04). SSH in and run:

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2
```

### 2. Upload and configure

```bash
# On your local machine
scp -r unified-ads-mcp root@your-droplet-ip:/root/

# On the Droplet
cd /root/unified-ads-mcp
npm install && npm run build
cp .env.example .env
nano .env  # Fill in all credentials + set TRANSPORT=http + set API_SECRET=some-long-random-string
```

### 3. Start with PM2

```bash
pm2 start dist/index.js --name unified-ads-mcp
pm2 save
pm2 startup
```

### 4. Configure nginx

Create `/etc/nginx/sites-available/ads-mcp`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /mcp {
        proxy_pass http://localhost:3000/mcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/ads-mcp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d your-domain.com   # Free HTTPS
```

### 5. Connect Claude to remote server

In Claude Desktop or claude.ai settings:

```json
{
  "mcpServers": {
    "unified-ads": {
      "url": "https://your-domain.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_SECRET"
      }
    }
  }
}
```

---

## Credential Setup Guides

### Google Ads
1. Create OAuth2 credentials at [Google Cloud Console](https://console.cloud.google.com/) (Web App type)
2. Enable the **Google Ads API**
3. Apply for a Developer Token at [Google Ads API Center](https://developers.google.com/google-ads/api/docs/get-started/dev-token)
4. Generate a refresh token using the OAuth Playground or the `google-ads-python` library's auth example
5. Your Customer ID is the 10-digit number in your Google Ads account (without dashes)

### Meta Ads
1. Create an app at [Meta for Developers](https://developers.facebook.com/) (Business type)
2. Add the **Marketing API** product
3. Generate a User Access Token with `ads_read` + `ads_management` permissions
4. Exchange for a long-lived token (60-day) via the [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
5. Your Ad Account ID starts with `act_`

### TikTok Ads
1. Create an app at [TikTok for Business Developers](https://developers.tiktok.com/) portal
2. Select **Marketing API** as the service type
3. Enable `Ads Management` + `Reporting` permissions
4. Generate an access token via the TikTok Marketing API Inspector

### LinkedIn Ads
1. Create an app at [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Request **Marketing Developer Platform** access
3. Add OAuth2 scopes: `r_ads`, `r_ads_reporting`, `w_organization_social`
4. Run the OAuth flow to generate an access token
5. Your Account ID is the number in your LinkedIn Campaign Manager URL

---

## Available Tools

### Google Ads (5 tools)
| Tool | Description |
|------|-------------|
| `google_get_account_summary` | Overall account KPIs |
| `google_get_campaigns` | Campaigns with performance metrics |
| `google_get_ad_groups` | Ad groups, optionally by campaign |
| `google_get_keywords` | Keywords with quality scores |
| `google_run_gaql` | Custom GAQL queries |

### Meta Ads (7 tools)
| Tool | Description |
|------|-------------|
| `meta_get_account_summary` | Account-level KPIs including ROAS |
| `meta_get_campaigns` | Campaigns with budgets |
| `meta_get_adsets` | Ad sets with targeting |
| `meta_get_insights` | Multi-level insights with breakdowns |
| `meta_get_ads` | Ads with creative details |
| `meta_create_campaign` | Create campaign (starts PAUSED) |
| `meta_update_campaign_status` | Pause / activate / archive |

### TikTok Ads (5 tools)
| Tool | Description |
|------|-------------|
| `tiktok_get_account_info` | Account balance and settings |
| `tiktok_get_campaigns` | Campaigns list |
| `tiktok_get_adgroups` | Ad groups list |
| `tiktok_get_campaign_performance` | Full metrics + video engagement |
| `tiktok_get_ad_performance` | Individual ad metrics |

### LinkedIn Ads (5 tools)
| Tool | Description |
|------|-------------|
| `linkedin_get_account_info` | Account details |
| `linkedin_get_campaigns` | Campaigns with budget/type |
| `linkedin_get_campaign_groups` | Campaign groups |
| `linkedin_get_analytics` | Performance by campaign/creative |
| `linkedin_get_demographic_analytics` | Audience breakdown by job title, seniority, industry, etc. |

---

## Example Prompts

```
"Give me a summary of all 4 ad platforms for the last 7 days — spend, ROAS, and top campaign"

"Which Google Ads keywords have a quality score below 5?"

"Show me TikTok ad performance broken down by age group"

"What's the LinkedIn spend breakdown by job seniority?"

"Compare Meta campaign performance this week vs same period last month"

"Pause the Meta campaign named 'Summer Sale 2024'"

"What's my total ad spend across all platforms this month?"
```

---

## Security Notes

- Never commit your `.env` file — it's in `.gitignore` by default
- Rotate your `API_SECRET` periodically when running in HTTP mode
- Use a firewall (DigitalOcean Firewall or `ufw`) to restrict port 80/443 to known IPs if needed
- Meta access tokens expire every 60 days — set a calendar reminder to refresh

---

## License

MIT

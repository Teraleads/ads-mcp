/**
 * Token Refresh Utilities
 *
 * Meta access tokens expire every ~60 days.
 * LinkedIn tokens expire every 60 days (or up to 2 years with offline_access scope).
 * TikTok tokens expire every 24 hours (use refresh_token to get a new one).
 *
 * This module provides manual refresh helpers you can call from the CLI
 * or schedule via cron.
 */

import axios from "axios";
import { required, optional } from "./http.js";

// ─── Meta ─────────────────────────────────────────────────────────────────────

/**
 * Exchange a short-lived Meta token for a long-lived one (60 days).
 * Run this whenever your META_ACCESS_TOKEN is about to expire.
 */
export async function refreshMetaToken(shortLivedToken: string): Promise<void> {
  const appId = required("META_APP_ID");
  const appSecret = required("META_APP_SECRET");

  const res = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
    params: {
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    },
  });

  const newToken: string = res.data.access_token;
  const expiresIn: number = res.data.expires_in; // seconds (~5183944 = 60 days)
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  console.log("═══════════════════════════════════════════════");
  console.log("Meta Token Refreshed Successfully");
  console.log("─────────────────────────────────────────────");
  console.log("New token:", newToken);
  console.log("Expires at:", expiresAt);
  console.log("─────────────────────────────────────────────");
  console.log("Update your .env:");
  console.log(`META_ACCESS_TOKEN=${newToken}`);
  console.log("═══════════════════════════════════════════════");
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

/**
 * Refresh a LinkedIn access token using a refresh token.
 * Requires the offline_access scope when generating the initial token.
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<void> {
  const clientId = required("LINKEDIN_CLIENT_ID");
  const clientSecret = required("LINKEDIN_CLIENT_SECRET");

  const res = await axios.post(
    "https://www.linkedin.com/oauth/v2/accessToken",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const newAccessToken: string = res.data.access_token;
  const newRefreshToken: string = res.data.refresh_token;
  const expiresIn: number = res.data.expires_in;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  console.log("═══════════════════════════════════════════════");
  console.log("LinkedIn Token Refreshed Successfully");
  console.log("─────────────────────────────────────────────");
  console.log("Expires at:", expiresAt);
  console.log("─────────────────────────────────────────────");
  console.log("Update your .env:");
  console.log(`LINKEDIN_ACCESS_TOKEN=${newAccessToken}`);
  if (newRefreshToken) console.log(`LINKEDIN_REFRESH_TOKEN=${newRefreshToken}`);
  console.log("═══════════════════════════════════════════════");
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

/**
 * Refresh a TikTok access token. TikTok tokens last only 24 hours.
 * Store the refresh_token in .env and call this daily via cron.
 */
export async function refreshTikTokToken(refreshToken: string): Promise<void> {
  const appId = required("TIKTOK_APP_ID");
  const appSecret = required("TIKTOK_APP_SECRET");

  const res = await axios.post(
    "https://business-api.tiktok.com/open_api/v1.3/oauth2/refresh_token/",
    {
      app_id: appId,
      secret: appSecret,
      refresh_token: refreshToken,
    }
  );

  if (res.data.code !== 0) {
    throw new Error(`TikTok refresh failed: ${res.data.message}`);
  }

  const newToken: string = res.data.data.access_token;
  const newRefreshToken: string = res.data.data.refresh_token;
  const expiresIn: number = res.data.data.access_token_expire_in;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  console.log("═══════════════════════════════════════════════");
  console.log("TikTok Token Refreshed Successfully");
  console.log("─────────────────────────────────────────────");
  console.log("Expires at:", expiresAt);
  console.log("─────────────────────────────────────────────");
  console.log("Update your .env:");
  console.log(`TIKTOK_ACCESS_TOKEN=${newToken}`);
  console.log(`TIKTOK_REFRESH_TOKEN=${newRefreshToken}`);
  console.log("═══════════════════════════════════════════════");
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
// Run directly: npx tsx src/utils/token-refresh.ts meta <short_lived_token>

if (process.argv[1]?.endsWith("token-refresh.ts") || process.argv[1]?.endsWith("token-refresh.js")) {
  import("dotenv/config").then(() => {
    const [,, platform, token] = process.argv;
    if (!platform || !token) {
      console.error("Usage: npx tsx src/utils/token-refresh.ts <meta|linkedin|tiktok> <token_or_refresh_token>");
      process.exit(1);
    }
    const handlers: Record<string, (t: string) => Promise<void>> = {
      meta: refreshMetaToken,
      linkedin: refreshLinkedInToken,
      tiktok: refreshTikTokToken,
    };
    const fn = handlers[platform.toLowerCase()];
    if (!fn) {
      console.error(`Unknown platform: ${platform}. Use: meta, linkedin, or tiktok`);
      process.exit(1);
    }
    fn(token).catch((e) => { console.error("Error:", e.message); process.exit(1); });
  });
}

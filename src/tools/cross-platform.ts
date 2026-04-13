/**
 * Cross-platform aggregation tools.
 * These combine data from multiple platforms into a single unified response.
 */

import { googleGetAccountSummary } from "../platforms/google.js";
import { metaGetAccountSummary } from "../platforms/meta.js";
import { tiktokGetCampaignPerformance, tiktokGetAccountInfo } from "../platforms/tiktok.js";
import { linkedinGetCampaignAnalytics } from "../platforms/linkedin.js";

interface PlatformResult {
  platform: string;
  status: "ok" | "error" | "not_configured";
  data?: unknown;
  error?: string;
}

async function tryPlatform(
  platform: string,
  requiredVars: string[],
  fn: () => Promise<unknown>
): Promise<PlatformResult> {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    return { platform, status: "not_configured" };
  }
  try {
    const data = await fn();
    return { platform, status: "ok", data };
  } catch (e: unknown) {
    return { platform, status: "error", error: e instanceof Error ? e.message : String(e) };
  }
}

// ─── Unified Summary ──────────────────────────────────────────────────────────

export async function getAllPlatformsSummary(args: { days?: number }) {
  const days = args.days ?? 30;

  const [google, meta, tiktok, linkedin] = await Promise.all([
    tryPlatform("google_ads", ["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_DEVELOPER_TOKEN"], () =>
      googleGetAccountSummary({ days })
    ),
    tryPlatform("meta", ["META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID"], () =>
      metaGetAccountSummary({ days })
    ),
    tryPlatform("tiktok", ["TIKTOK_ACCESS_TOKEN", "TIKTOK_ADVERTISER_ID"], async () => {
      const [info, perf] = await Promise.all([
        tiktokGetAccountInfo(),
        tiktokGetCampaignPerformance({ days }),
      ]);
      const totals = (perf as any[]).reduce(
        (acc, r) => ({
          impressions: acc.impressions + Number(r.impressions ?? 0),
          clicks: acc.clicks + Number(r.clicks ?? 0),
          spend: acc.spend + Number(r.spend ?? 0),
          conversions: acc.conversions + Number(r.conversion ?? 0),
        }),
        { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
      );
      return { account: info, totals };
    }),
    tryPlatform("linkedin", ["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_ACCOUNT_ID"], async () => {
      const analytics = await linkedinGetCampaignAnalytics({ days });
      const totals = (analytics as any[]).reduce(
        (acc, r) => ({
          impressions: acc.impressions + Number(r.impressions ?? 0),
          clicks: acc.clicks + Number(r.clicks ?? 0),
          spend: acc.spend + Number(r.spend ?? 0),
          leads: acc.leads + Number(r.leads ?? 0),
        }),
        { impressions: 0, clicks: 0, spend: 0, leads: 0 }
      );
      return totals;
    }),
  ]);

  // Calculate combined totals across all configured platforms
  let totalSpend = 0;
  const platforms = [google, meta, tiktok, linkedin];

  for (const p of platforms) {
    if (p.status !== "ok") continue;
    const d = p.data as any;
    const spend = parseFloat(
      d?.spend ?? d?.totals?.spend ?? "0"
    );
    if (!isNaN(spend)) totalSpend += spend;
  }

  return {
    summary: {
      date_range_days: days,
      total_spend_all_platforms: totalSpend.toFixed(2),
      configured_platforms: platforms.filter((p) => p.status !== "not_configured").map((p) => p.platform),
      not_configured: platforms.filter((p) => p.status === "not_configured").map((p) => p.platform),
    },
    platforms: { google, meta, tiktok, linkedin },
  };
}

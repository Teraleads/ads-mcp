import axios from "axios";
import { createHttpClient, dateRange, required } from "../utils/http.js";

interface GoogleTokens {
  access_token: string;
  expires_at: number;
}

let cachedTokens: GoogleTokens | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedTokens && cachedTokens.expires_at > now + 60_000) {
    return cachedTokens.access_token;
  }

  const res = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: required("GOOGLE_ADS_CLIENT_ID"),
    client_secret: required("GOOGLE_ADS_CLIENT_SECRET"),
    refresh_token: required("GOOGLE_ADS_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });

  cachedTokens = {
    access_token: res.data.access_token,
    expires_at: now + res.data.expires_in * 1000,
  };

  return cachedTokens.access_token;
}

async function gaqlQuery(query: string): Promise<unknown[]> {
  const token = await getAccessToken();
  const customerId = required("GOOGLE_ADS_CUSTOMER_ID").replace(/-/g, "");
  const managerId = process.env.GOOGLE_ADS_MANAGER_ID?.replace(/-/g, "");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "developer-token": required("GOOGLE_ADS_DEVELOPER_TOKEN"),
    "Content-Type": "application/json",
  };
  if (managerId) headers["login-customer-id"] = managerId;

  const res = await axios.post(
    `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
    { query },
    { headers }
  );

  return res.data.results ?? [];
}

// ─── Tools ────────────────────────────────────────────────────────────────────

export async function googleGetCampaigns(args: { days?: number; status?: string }) {
  const { start, end } = dateRange(args.days ?? 30);
  const statusFilter = args.status ? `AND campaign.status = '${args.status}'` : "";
  const results = await gaqlQuery(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.bidding_strategy_type,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversion_rate
    FROM campaign
    WHERE segments.date BETWEEN '${start}' AND '${end}'
    ${statusFilter}
    ORDER BY metrics.cost_micros DESC
    LIMIT 50
  `);

  return results.map((r: any) => ({
    id: r.campaign?.id,
    name: r.campaign?.name,
    status: r.campaign?.status,
    type: r.campaign?.advertisingChannelType,
    biddingStrategy: r.campaign?.biddingStrategyType,
    impressions: r.metrics?.impressions,
    clicks: r.metrics?.clicks,
    spend: ((r.metrics?.costMicros ?? 0) / 1_000_000).toFixed(2),
    conversions: r.metrics?.conversions,
    ctr: r.metrics?.ctr,
    avgCpc: ((r.metrics?.averageCpc ?? 0) / 1_000_000).toFixed(2),
    conversionRate: r.metrics?.conversionRate,
  }));
}

export async function googleGetAdGroups(args: { campaign_id?: string; days?: number }) {
  const { start, end } = dateRange(args.days ?? 30);
  const campaignFilter = args.campaign_id ? `AND campaign.id = ${args.campaign_id}` : "";
  const results = await gaqlQuery(`
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr
    FROM ad_group
    WHERE segments.date BETWEEN '${start}' AND '${end}'
    ${campaignFilter}
    ORDER BY metrics.cost_micros DESC
    LIMIT 50
  `);

  return results.map((r: any) => ({
    id: r.adGroup?.id,
    name: r.adGroup?.name,
    status: r.adGroup?.status,
    campaign: r.campaign?.name,
    impressions: r.metrics?.impressions,
    clicks: r.metrics?.clicks,
    spend: ((r.metrics?.costMicros ?? 0) / 1_000_000).toFixed(2),
    conversions: r.metrics?.conversions,
    ctr: r.metrics?.ctr,
  }));
}

export async function googleGetKeywords(args: { campaign_id?: string; days?: number; limit?: number }) {
  const { start, end } = dateRange(args.days ?? 30);
  const campaignFilter = args.campaign_id ? `AND campaign.id = ${args.campaign_id}` : "";
  const results = await gaqlQuery(`
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status,
      campaign.name,
      ad_group.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.average_cpc,
      metrics.quality_score
    FROM keyword_view
    WHERE segments.date BETWEEN '${start}' AND '${end}'
    ${campaignFilter}
    ORDER BY metrics.cost_micros DESC
    LIMIT ${args.limit ?? 50}
  `);

  return results.map((r: any) => ({
    keyword: r.adGroupCriterion?.keyword?.text,
    matchType: r.adGroupCriterion?.keyword?.matchType,
    status: r.adGroupCriterion?.status,
    campaign: r.campaign?.name,
    adGroup: r.adGroup?.name,
    impressions: r.metrics?.impressions,
    clicks: r.metrics?.clicks,
    spend: ((r.metrics?.costMicros ?? 0) / 1_000_000).toFixed(2),
    conversions: r.metrics?.conversions,
    avgCpc: ((r.metrics?.averageCpc ?? 0) / 1_000_000).toFixed(2),
    qualityScore: r.metrics?.qualityScore,
  }));
}

export async function googleGetAccountSummary(args: { days?: number }) {
  const { start, end } = dateRange(args.days ?? 30);
  const results = await gaqlQuery(`
    SELECT
      customer.id,
      customer.descriptive_name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversion_rate,
      metrics.cost_per_conversion
    FROM customer
    WHERE segments.date BETWEEN '${start}' AND '${end}'
  `);

  if (!results.length) return { message: "No data found for period" };
  const r: any = results[0];
  return {
    accountId: r.customer?.id,
    accountName: r.customer?.descriptiveName,
    dateRange: { start, end },
    impressions: r.metrics?.impressions,
    clicks: r.metrics?.clicks,
    spend: ((r.metrics?.costMicros ?? 0) / 1_000_000).toFixed(2),
    conversions: r.metrics?.conversions,
    ctr: r.metrics?.ctr,
    avgCpc: ((r.metrics?.averageCpc ?? 0) / 1_000_000).toFixed(2),
    conversionRate: r.metrics?.conversionRate,
    costPerConversion: ((r.metrics?.costPerConversion ?? 0) / 1_000_000).toFixed(2),
  };
}

export async function googleRunGaql(args: { query: string }) {
  return gaqlQuery(args.query);
}

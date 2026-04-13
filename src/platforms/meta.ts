import { createHttpClient, dateRange, required } from "../utils/http.js";

function metaClient() {
  return createHttpClient("https://graph.facebook.com/v21.0");
}

function token() {
  return required("META_ACCESS_TOKEN");
}

function accountId() {
  return required("META_AD_ACCOUNT_ID");
}

// ─── Tools ────────────────────────────────────────────────────────────────────

export async function metaGetCampaigns(args: { days?: number; status?: string; limit?: number }) {
  const client = metaClient();
  const { start, end } = dateRange(args.days ?? 30);

  const params: Record<string, string> = {
    access_token: token(),
    fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
    limit: String(args.limit ?? 25),
    time_range: JSON.stringify({ since: start, until: end }),
  };
  if (args.status) params.effective_status = JSON.stringify([args.status]);

  const res = await client.get(`/${accountId()}/campaigns`, { params });
  return res.data.data ?? [];
}

export async function metaGetAdSets(args: { campaign_id?: string; days?: number; limit?: number }) {
  const client = metaClient();
  const { start, end } = dateRange(args.days ?? 30);

  const endpoint = args.campaign_id
    ? `/${args.campaign_id}/adsets`
    : `/${accountId()}/adsets`;

  const res = await client.get(endpoint, {
    params: {
      access_token: token(),
      fields: "id,name,status,campaign_id,daily_budget,billing_event,optimization_goal,targeting",
      limit: String(args.limit ?? 25),
      time_range: JSON.stringify({ since: start, until: end }),
    },
  });
  return res.data.data ?? [];
}

export async function metaGetInsights(args: {
  level?: "account" | "campaign" | "adset" | "ad";
  days?: number;
  breakdown?: string;
}) {
  const client = metaClient();
  const { start, end } = dateRange(args.days ?? 30);
  const level = args.level ?? "campaign";

  const fields = [
    "campaign_name",
    "adset_name",
    "ad_name",
    "impressions",
    "clicks",
    "spend",
    "reach",
    "frequency",
    "ctr",
    "cpc",
    "cpm",
    "cpp",
    "actions",
    "cost_per_action_type",
    "roas",
    "purchase_roas",
  ].join(",");

  const params: Record<string, string> = {
    access_token: token(),
    fields,
    level,
    time_range: JSON.stringify({ since: start, until: end }),
    limit: "25",
  };
  if (args.breakdown) params.breakdowns = args.breakdown;

  const res = await client.get(`/${accountId()}/insights`, { params });
  return res.data.data ?? [];
}

export async function metaGetAds(args: { adset_id?: string; days?: number; limit?: number }) {
  const client = metaClient();
  const endpoint = args.adset_id ? `/${args.adset_id}/ads` : `/${accountId()}/ads`;

  const res = await client.get(endpoint, {
    params: {
      access_token: token(),
      fields: "id,name,status,adset_id,campaign_id,creative{title,body,image_url},effective_status",
      limit: String(args.limit ?? 25),
    },
  });
  return res.data.data ?? [];
}

export async function metaGetAccountSummary(args: { days?: number }) {
  const client = metaClient();
  const { start, end } = dateRange(args.days ?? 30);

  const res = await client.get(`/${accountId()}/insights`, {
    params: {
      access_token: token(),
      fields: "impressions,clicks,spend,reach,ctr,cpc,cpm,actions,purchase_roas",
      level: "account",
      time_range: JSON.stringify({ since: start, until: end }),
    },
  });

  const data = res.data.data?.[0] ?? {};
  const purchases = data.actions?.find((a: any) => a.action_type === "purchase");
  return {
    dateRange: { start, end },
    impressions: data.impressions,
    clicks: data.clicks,
    spend: data.spend,
    reach: data.reach,
    ctr: data.ctr,
    cpc: data.cpc,
    cpm: data.cpm,
    purchases: purchases?.value,
    roas: data.purchase_roas?.[0]?.value,
  };
}

export async function metaCreateCampaign(args: {
  name: string;
  objective: string;
  daily_budget_cents?: number;
  status?: string;
}) {
  const client = metaClient();
  const res = await client.post(
    `/${accountId()}/campaigns`,
    {
      name: args.name,
      objective: args.objective,
      status: args.status ?? "PAUSED",
      daily_budget: args.daily_budget_cents,
      special_ad_categories: [],
    },
    { params: { access_token: token() } }
  );
  return res.data;
}

export async function metaUpdateCampaignStatus(args: { campaign_id: string; status: string }) {
  const client = metaClient();
  const res = await client.post(
    `/${args.campaign_id}`,
    { status: args.status },
    { params: { access_token: token() } }
  );
  return res.data;
}

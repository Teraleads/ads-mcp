import { createHttpClient, dateRange, required } from "../utils/http.js";

function tiktokClient() {
  return createHttpClient("https://business-api.tiktok.com/open_api/v1.3", {
    "Access-Token": required("TIKTOK_ACCESS_TOKEN"),
    "Content-Type": "application/json",
  });
}

function advertiserId() {
  return required("TIKTOK_ADVERTISER_ID");
}

// ─── Tools ────────────────────────────────────────────────────────────────────

export async function tiktokGetCampaigns(args: { days?: number; status?: string }) {
  const client = tiktokClient();
  const params: Record<string, unknown> = {
    advertiser_id: advertiserId(),
    fields: JSON.stringify([
      "campaign_id", "campaign_name", "status", "objective_type",
      "budget", "budget_mode", "create_time", "modify_time",
    ]),
    page_size: 20,
  };
  if (args.status) params.primary_status = args.status;

  const res = await client.get("/campaign/get/", { params });
  const list = res.data.data?.list ?? [];

  return list.map((c: any) => ({
    id: c.campaign_id,
    name: c.campaign_name,
    status: c.status,
    objective: c.objective_type,
    budget: c.budget,
    budgetMode: c.budget_mode,
  }));
}

export async function tiktokGetAdGroups(args: { campaign_id?: string; days?: number }) {
  const client = tiktokClient();
  const params: Record<string, unknown> = {
    advertiser_id: advertiserId(),
    fields: JSON.stringify([
      "adgroup_id", "adgroup_name", "campaign_id", "status",
      "budget", "bid_type", "bid_price", "placement_type",
      "optimize_goal", "billing_event",
    ]),
    page_size: 20,
  };
  if (args.campaign_id) params.campaign_ids = JSON.stringify([args.campaign_id]);

  const res = await client.get("/adgroup/get/", { params });
  const list = res.data.data?.list ?? [];

  return list.map((ag: any) => ({
    id: ag.adgroup_id,
    name: ag.adgroup_name,
    campaignId: ag.campaign_id,
    status: ag.status,
    budget: ag.budget,
    bidType: ag.bid_type,
    bidPrice: ag.bid_price,
    optimizeGoal: ag.optimize_goal,
  }));
}

export async function tiktokGetCampaignPerformance(args: {
  campaign_ids?: string[];
  days?: number;
  breakdown?: string;
}) {
  const client = tiktokClient();
  const { start, end } = dateRange(args.days ?? 30);

  const metrics = [
    "campaign_name", "impressions", "clicks", "spend",
    "ctr", "cpc", "cpm", "reach", "frequency",
    "conversion", "cost_per_conversion", "conversion_rate",
    "video_play_actions", "video_watched_2s", "video_watched_6s",
  ];

  const body: Record<string, unknown> = {
    advertiser_id: advertiserId(),
    report_type: "BASIC",
    dimensions: args.breakdown
      ? ["campaign_id", args.breakdown]
      : ["campaign_id"],
    metrics,
    start_date: start,
    end_date: end,
    page_size: 20,
  };
  if (args.campaign_ids?.length) body.filters = [{ field_name: "campaign_id", filter_type: "IN", filter_value: JSON.stringify(args.campaign_ids) }];

  const res = await client.post("/report/integrated/get/", body);
  const list = res.data.data?.list ?? [];

  return list.map((r: any) => ({
    ...r.dimensions,
    ...r.metrics,
  }));
}

export async function tiktokGetAdPerformance(args: {
  campaign_id?: string;
  days?: number;
}) {
  const client = tiktokClient();
  const { start, end } = dateRange(args.days ?? 30);

  const body: Record<string, unknown> = {
    advertiser_id: advertiserId(),
    report_type: "BASIC",
    dimensions: ["ad_id"],
    metrics: [
      "ad_name", "impressions", "clicks", "spend",
      "ctr", "cpc", "cpm", "conversion", "cost_per_conversion",
      "video_play_actions", "video_watched_2s",
    ],
    start_date: start,
    end_date: end,
    page_size: 20,
  };

  const res = await client.post("/report/integrated/get/", body);
  const list = res.data.data?.list ?? [];

  return list.map((r: any) => ({ ...r.dimensions, ...r.metrics }));
}

export async function tiktokGetAccountInfo() {
  const client = tiktokClient();
  const res = await client.get("/advertiser/info/", {
    params: {
      advertiser_ids: JSON.stringify([advertiserId()]),
      fields: JSON.stringify(["advertiser_id", "advertiser_name", "status", "currency", "timezone", "balance"]),
    },
  });
  return res.data.data?.list?.[0] ?? {};
}

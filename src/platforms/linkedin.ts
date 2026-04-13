import axios from "axios";
import { createHttpClient, dateRange, required } from "../utils/http.js";

function linkedinClient() {
  return createHttpClient("https://api.linkedin.com/rest", {
    Authorization: `Bearer ${required("LINKEDIN_ACCESS_TOKEN")}`,
    "LinkedIn-Version": "202401",
    "X-Restli-Protocol-Version": "2.0.0",
  });
}

function accountUrn() {
  const id = required("LINKEDIN_ACCOUNT_ID");
  return `urn:li:sponsoredAccount:${id}`;
}

function buildTimeRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: { year: start.getFullYear(), month: start.getMonth() + 1, day: start.getDate() },
    end: { year: end.getFullYear(), month: end.getMonth() + 1, day: end.getDate() },
  };
}

// ─── Tools ────────────────────────────────────────────────────────────────────

export async function linkedinGetCampaignGroups(args: { status?: string; limit?: number }) {
  const client = linkedinClient();
  const res = await client.get("/adAccounts/" + required("LINKEDIN_ACCOUNT_ID") + "/adCampaignGroups", {
    params: {
      q: "search",
      search: args.status ? `(status:(values:List(${args.status})))` : undefined,
      count: args.limit ?? 25,
    },
  });
  return res.data.elements ?? [];
}

export async function linkedinGetCampaigns(args: { days?: number; status?: string; limit?: number }) {
  const client = linkedinClient();
  const res = await client.get("/adAccounts/" + required("LINKEDIN_ACCOUNT_ID") + "/adCampaigns", {
    params: {
      q: "search",
      count: args.limit ?? 25,
    },
  });
  return (res.data.elements ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    type: c.type,
    objectiveType: c.objectiveType,
    costType: c.costType,
    dailyBudget: c.dailyBudget,
    totalBudget: c.totalBudget,
    startAt: c.runSchedule?.start,
    endAt: c.runSchedule?.end,
  }));
}

export async function linkedinGetCampaignAnalytics(args: {
  campaign_ids?: string[];
  days?: number;
  pivot?: string;
}) {
  const client = linkedinClient();
  const { start, end } = dateRange(args.days ?? 30);

  const params: Record<string, unknown> = {
    q: "analytics",
    pivot: args.pivot ?? "CAMPAIGN",
    dateRange: JSON.stringify(buildTimeRange(args.days ?? 30)),
    metrics: "impressions,clicks,costInLocalCurrency,conversions,externalWebsiteConversions,leads,likes,comments,shares",
    accounts: `List(${accountUrn()})`,
    count: 25,
  };
  if (args.campaign_ids?.length) {
    params.campaigns = `List(${args.campaign_ids.map((id) => `urn:li:sponsoredCampaign:${id}`).join(",")})`;
  }

  const res = await client.get("/adAnalytics", { params });
  return (res.data.elements ?? []).map((e: any) => ({
    pivotValue: e.pivotValues?.[0],
    impressions: e.impressions,
    clicks: e.clicks,
    spend: e.costInLocalCurrency,
    ctr: e.clicks && e.impressions ? (e.clicks / e.impressions * 100).toFixed(2) + "%" : null,
    conversions: e.conversions,
    leads: e.leads,
    likes: e.likes,
    comments: e.comments,
    shares: e.shares,
  }));
}

export async function linkedinGetCreatives(args: { campaign_id?: string; limit?: number }) {
  const client = linkedinClient();
  const res = await client.get("/adAccounts/" + required("LINKEDIN_ACCOUNT_ID") + "/creatives", {
    params: {
      q: "criteria",
      count: args.limit ?? 25,
    },
  });
  return res.data.elements ?? [];
}

export async function linkedinGetAccountInfo() {
  const client = linkedinClient();
  const res = await client.get("/adAccounts/" + required("LINKEDIN_ACCOUNT_ID"));
  return res.data;
}

export async function linkedinGetDemographicAnalytics(args: {
  days?: number;
  pivot: "MEMBER_JOB_TITLE" | "MEMBER_COMPANY" | "MEMBER_INDUSTRY" | "MEMBER_SENIORITY" | "MEMBER_FUNCTION" | "MEMBER_COUNTRY_V2";
}) {
  const client = linkedinClient();
  const res = await client.get("/adAnalytics", {
    params: {
      q: "analytics",
      pivot: args.pivot,
      dateRange: JSON.stringify(buildTimeRange(args.days ?? 30)),
      metrics: "impressions,clicks,costInLocalCurrency,leads",
      accounts: `List(${accountUrn()})`,
      count: 25,
    },
  });

  return (res.data.elements ?? []).map((e: any) => ({
    segment: e.pivotValues?.[0],
    impressions: e.impressions,
    clicks: e.clicks,
    spend: e.costInLocalCurrency,
    leads: e.leads,
    ctr: e.clicks && e.impressions ? (e.clicks / e.impressions * 100).toFixed(2) + "%" : null,
  }));
}

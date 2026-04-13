export const TOOL_DEFINITIONS = [
  // ─── Google Ads ─────────────────────────────────────────────────────────────
  {
    name: "google_get_account_summary",
    description: "Get overall Google Ads account performance summary (impressions, clicks, spend, conversions, ROAS) for a given date range.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Number of past days to analyze (default: 30)" },
      },
    },
  },
  {
    name: "google_get_campaigns",
    description: "List Google Ads campaigns with performance metrics. Optionally filter by status.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data to include (default: 30)" },
        status: { type: "string", description: "Filter by status: ENABLED, PAUSED, or REMOVED", enum: ["ENABLED", "PAUSED", "REMOVED"] },
      },
    },
  },
  {
    name: "google_get_ad_groups",
    description: "List Google Ads ad groups with performance metrics. Optionally filter by campaign.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: { type: "string", description: "Optional: filter by campaign ID" },
        days: { type: "number", description: "Days of data (default: 30)" },
      },
    },
  },
  {
    name: "google_get_keywords",
    description: "List keywords with performance metrics, match type, and quality score.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: { type: "string", description: "Optional: filter by campaign ID" },
        days: { type: "number", description: "Days of data (default: 30)" },
        limit: { type: "number", description: "Max results (default: 50)" },
      },
    },
  },
  {
    name: "google_run_gaql",
    description: "Run a raw Google Ads Query Language (GAQL) query for custom reporting.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", description: "A valid GAQL SELECT statement" },
      },
    },
  },

  // ─── Meta Ads ────────────────────────────────────────────────────────────────
  {
    name: "meta_get_account_summary",
    description: "Get Meta Ads account-level performance summary (spend, impressions, clicks, CTR, CPC, ROAS, purchases).",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data (default: 30)" },
      },
    },
  },
  {
    name: "meta_get_campaigns",
    description: "List Meta (Facebook/Instagram) campaigns with budget and status details.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data (default: 30)" },
        status: { type: "string", description: "Filter by status: ACTIVE, PAUSED, ARCHIVED, DELETED" },
        limit: { type: "number", description: "Max results (default: 25)" },
      },
    },
  },
  {
    name: "meta_get_adsets",
    description: "List Meta Ads ad sets. Optionally filter by campaign ID.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: { type: "string", description: "Optional: filter by campaign ID" },
        days: { type: "number", description: "Days of data (default: 30)" },
        limit: { type: "number", description: "Max results (default: 25)" },
      },
    },
  },
  {
    name: "meta_get_insights",
    description: "Get Meta Ads insights at account, campaign, adset, or ad level with optional breakdowns (age, gender, placement, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        level: { type: "string", description: "Aggregation level: account, campaign, adset, or ad", enum: ["account", "campaign", "adset", "ad"] },
        days: { type: "number", description: "Days of data (default: 30)" },
        breakdown: { type: "string", description: "Optional breakdown: age, gender, placement, publisher_platform, impression_device" },
      },
    },
  },
  {
    name: "meta_get_ads",
    description: "List Meta ads with creative details. Optionally filter by ad set.",
    inputSchema: {
      type: "object",
      properties: {
        adset_id: { type: "string", description: "Optional: filter by ad set ID" },
        days: { type: "number", description: "Days of data (default: 30)" },
        limit: { type: "number", description: "Max results (default: 25)" },
      },
    },
  },
  {
    name: "meta_create_campaign",
    description: "Create a new Meta Ads campaign (created as PAUSED by default for safety).",
    inputSchema: {
      type: "object",
      required: ["name", "objective"],
      properties: {
        name: { type: "string", description: "Campaign name" },
        objective: { type: "string", description: "Campaign objective: OUTCOME_AWARENESS, OUTCOME_TRAFFIC, OUTCOME_ENGAGEMENT, OUTCOME_LEADS, OUTCOME_APP_PROMOTION, OUTCOME_SALES" },
        daily_budget_cents: { type: "number", description: "Daily budget in cents (e.g. 5000 = $50.00)" },
        status: { type: "string", description: "Initial status (default: PAUSED)", enum: ["PAUSED", "ACTIVE"] },
      },
    },
  },
  {
    name: "meta_update_campaign_status",
    description: "Pause, activate, or archive a Meta Ads campaign.",
    inputSchema: {
      type: "object",
      required: ["campaign_id", "status"],
      properties: {
        campaign_id: { type: "string", description: "Campaign ID to update" },
        status: { type: "string", description: "New status: ACTIVE, PAUSED, ARCHIVED, DELETED", enum: ["ACTIVE", "PAUSED", "ARCHIVED", "DELETED"] },
      },
    },
  },

  // ─── TikTok Ads ──────────────────────────────────────────────────────────────
  {
    name: "tiktok_get_account_info",
    description: "Get TikTok Ads account information including name, status, currency, timezone, and balance.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tiktok_get_campaigns",
    description: "List TikTok Ads campaigns with objective, budget, and status.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data (default: 30)" },
        status: { type: "string", description: "Filter by primary status: STATUS_ALL, STATUS_ACTIVE, STATUS_PAUSED" },
      },
    },
  },
  {
    name: "tiktok_get_adgroups",
    description: "List TikTok Ads ad groups (ad sets) with budget, bid, and optimization settings.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: { type: "string", description: "Optional: filter by campaign ID" },
        days: { type: "number", description: "Days of data (default: 30)" },
      },
    },
  },
  {
    name: "tiktok_get_campaign_performance",
    description: "Get TikTok Ads campaign performance metrics including impressions, clicks, spend, CTR, CPC, CPM, conversions, and video engagement metrics.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_ids: { type: "array", items: { type: "string" }, description: "Optional: specific campaign IDs to filter" },
        days: { type: "number", description: "Days of data (default: 30)" },
        breakdown: { type: "string", description: "Optional dimension breakdown: age, gender, country_code, placement" },
      },
    },
  },
  {
    name: "tiktok_get_ad_performance",
    description: "Get TikTok individual ad performance including video play metrics.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_id: { type: "string", description: "Optional: filter by campaign ID" },
        days: { type: "number", description: "Days of data (default: 30)" },
      },
    },
  },

  // ─── LinkedIn Ads ─────────────────────────────────────────────────────────────
  {
    name: "linkedin_get_account_info",
    description: "Get LinkedIn Ads account information and status.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "linkedin_get_campaigns",
    description: "List LinkedIn Ads campaigns with type, budget, and status.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data (default: 30)" },
        status: { type: "string", description: "Filter by status: ACTIVE, PAUSED, ARCHIVED, COMPLETED, CANCELED, DRAFT" },
        limit: { type: "number", description: "Max results (default: 25)" },
      },
    },
  },
  {
    name: "linkedin_get_campaign_groups",
    description: "List LinkedIn campaign groups (equivalent to campaign groups/portfolios).",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Optional status filter" },
        limit: { type: "number", description: "Max results (default: 25)" },
      },
    },
  },
  {
    name: "linkedin_get_analytics",
    description: "Get LinkedIn Ads performance analytics including impressions, clicks, spend, conversions, and leads.",
    inputSchema: {
      type: "object",
      properties: {
        campaign_ids: { type: "array", items: { type: "string" }, description: "Optional: specific campaign IDs to filter" },
        days: { type: "number", description: "Days of data (default: 30)" },
        pivot: { type: "string", description: "Aggregation pivot: CAMPAIGN (default), CREATIVE, CAMPAIGN_GROUP", enum: ["CAMPAIGN", "CREATIVE", "CAMPAIGN_GROUP"] },
      },
    },
  },
  {
    name: "linkedin_get_demographic_analytics",
    description: "Break down LinkedIn Ads performance by audience demographics: job title, company, industry, seniority, function, or country.",
    inputSchema: {
      type: "object",
      required: ["pivot"],
      properties: {
        days: { type: "number", description: "Days of data (default: 30)" },
        pivot: {
          type: "string",
          description: "Demographic dimension to break down by",
          enum: ["MEMBER_JOB_TITLE", "MEMBER_COMPANY", "MEMBER_INDUSTRY", "MEMBER_SENIORITY", "MEMBER_FUNCTION", "MEMBER_COUNTRY_V2"],
        },
      },
    },
  },
  // ─── Cross-Platform ──────────────────────────────────────────────────────────
  {
    name: "get_all_platforms_summary",
    description: "Get a unified performance summary across ALL configured ad platforms (Google Ads, Meta, TikTok, LinkedIn) in a single call — total spend, impressions, clicks, and per-platform breakdown.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data to summarize (default: 30)" },
      },
    },
  },

  // ─── Northbeam ───────────────────────────────────────────────────────────────
  {
    name: "northbeam_get_channel_performance",
    description: "Get Northbeam cross-channel performance data — revenue, ROAS, spend, and conversions attributed across all channels using a chosen attribution model.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data (default: 30)" },
        attribution_model: { type: "string", description: "Attribution model: linear, last_click, first_click, time_decay (default: linear)", enum: ["linear", "last_click", "first_click", "time_decay"] },
        granularity: { type: "string", description: "Aggregation: total or daily (default: total)", enum: ["total", "daily"] },
      },
    },
  },
  {
    name: "northbeam_get_metric",
    description: "Get a specific Northbeam metric (e.g. revenue, roas, new_customers) over time with optional dimension breakdowns.",
    inputSchema: {
      type: "object",
      required: ["metric"],
      properties: {
        metric: { type: "string", description: "Metric name (use northbeam_list_metrics to discover available metrics)" },
        days: { type: "number", description: "Days of data (default: 30)" },
        granularity: { type: "string", description: "daily or weekly (default: daily)", enum: ["daily", "weekly"] },
        dimensions: { type: "array", items: { type: "string" }, description: "Optional dimension filters (use northbeam_list_dimensions to discover)" },
      },
    },
  },
  {
    name: "northbeam_list_metrics",
    description: "List all available Northbeam metrics for this brand.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "northbeam_list_dimensions",
    description: "List all available Northbeam dimensions for segmenting data.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "northbeam_get_attribution",
    description: "Get Northbeam attribution data showing how revenue is credited across touchpoints using a specific attribution model.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data (default: 30)" },
        attribution_model: { type: "string", description: "Attribution model: linear, last_click, first_click, time_decay", enum: ["linear", "last_click", "first_click", "time_decay"] },
        channel: { type: "string", description: "Optional: filter to a specific channel (e.g. google, meta, tiktok)" },
      },
    },
  },
  {
    name: "northbeam_get_cohort_analysis",
    description: "Get Northbeam cohort analysis showing how customer cohorts retain and generate revenue over time.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days of data (default: 90)" },
        metric: { type: "string", description: "Cohort metric to analyze: revenue, orders, customers (default: revenue)" },
      },
    },
  },
] as const;

export type ToolName = (typeof TOOL_DEFINITIONS)[number]["name"];

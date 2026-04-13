import { createHttpClient, dateRange, required } from "../utils/http.js";

function northbeamClient() {
  return createHttpClient("https://api.northbeam.io/v1", {
    "x-api-key": required("NORTHBEAM_API_KEY"),
    "Content-Type": "application/json",
  });
}

function brand() {
  return required("NORTHBEAM_BRAND");
}

// ─── Tools ────────────────────────────────────────────────────────────────────

export async function northbeamGetChannelPerformance(args: {
  days?: number;
  attribution_model?: string;
  granularity?: string;
}) {
  const client = northbeamClient();
  const { start, end } = dateRange(args.days ?? 30);

  const res = await client.get("/channel-performance", {
    params: {
      brand: brand(),
      start_date: start,
      end_date: end,
      attribution_model: args.attribution_model ?? "linear",
      granularity: args.granularity ?? "total",
    },
  });
  return res.data;
}

export async function northbeamGetMetric(args: {
  metric: string;
  days?: number;
  granularity?: string;
  dimensions?: string[];
}) {
  const client = northbeamClient();
  const { start, end } = dateRange(args.days ?? 30);

  const res = await client.get("/metrics", {
    params: {
      brand: brand(),
      metric: args.metric,
      start_date: start,
      end_date: end,
      granularity: args.granularity ?? "daily",
      dimensions: args.dimensions?.join(","),
    },
  });
  return res.data;
}

export async function northbeamListMetrics() {
  const client = northbeamClient();
  const res = await client.get("/metrics/list", {
    params: { brand: brand() },
  });
  return res.data;
}

export async function northbeamListDimensions() {
  const client = northbeamClient();
  const res = await client.get("/dimensions/list", {
    params: { brand: brand() },
  });
  return res.data;
}

export async function northbeamGetAttribution(args: {
  days?: number;
  attribution_model?: string;
  channel?: string;
}) {
  const client = northbeamClient();
  const { start, end } = dateRange(args.days ?? 30);

  const res = await client.get("/attribution", {
    params: {
      brand: brand(),
      start_date: start,
      end_date: end,
      attribution_model: args.attribution_model ?? "linear",
      channel: args.channel,
    },
  });
  return res.data;
}

export async function northbeamGetCohortAnalysis(args: {
  cohort_date?: string;
  days?: number;
  metric?: string;
}) {
  const client = northbeamClient();
  const { start, end } = dateRange(args.days ?? 90);

  const res = await client.get("/cohort-analysis", {
    params: {
      brand: brand(),
      start_date: start,
      end_date: end,
      cohort_metric: args.metric ?? "revenue",
    },
  });
  return res.data;
}

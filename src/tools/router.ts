import {
  googleGetAccountSummary,
  googleGetCampaigns,
  googleGetAdGroups,
  googleGetKeywords,
  googleRunGaql,
} from "../platforms/google.js";

import {
  metaGetAccountSummary,
  metaGetCampaigns,
  metaGetAdSets,
  metaGetInsights,
  metaGetAds,
  metaCreateCampaign,
  metaUpdateCampaignStatus,
} from "../platforms/meta.js";

import {
  tiktokGetAccountInfo,
  tiktokGetCampaigns,
  tiktokGetAdGroups,
  tiktokGetCampaignPerformance,
  tiktokGetAdPerformance,
} from "../platforms/tiktok.js";

import {
  linkedinGetAccountInfo,
  linkedinGetCampaigns,
  linkedinGetCampaignGroups,
  linkedinGetCampaignAnalytics,
  linkedinGetDemographicAnalytics,
} from "../platforms/linkedin.js";

import { getAllPlatformsSummary } from "./cross-platform.js";

import {
  northbeamGetChannelPerformance,
  northbeamGetMetric,
  northbeamListMetrics,
  northbeamListDimensions,
  northbeamGetAttribution,
  northbeamGetCohortAnalysis,
} from "../platforms/northbeam.js";

export async function routeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    // Google Ads
    case "google_get_account_summary":    return googleGetAccountSummary(args as any);
    case "google_get_campaigns":          return googleGetCampaigns(args as any);
    case "google_get_ad_groups":          return googleGetAdGroups(args as any);
    case "google_get_keywords":           return googleGetKeywords(args as any);
    case "google_run_gaql":               return googleRunGaql(args as any);

    // Meta Ads
    case "meta_get_account_summary":      return metaGetAccountSummary(args as any);
    case "meta_get_campaigns":            return metaGetCampaigns(args as any);
    case "meta_get_adsets":               return metaGetAdSets(args as any);
    case "meta_get_insights":             return metaGetInsights(args as any);
    case "meta_get_ads":                  return metaGetAds(args as any);
    case "meta_create_campaign":          return metaCreateCampaign(args as any);
    case "meta_update_campaign_status":   return metaUpdateCampaignStatus(args as any);

    // TikTok Ads
    case "tiktok_get_account_info":       return tiktokGetAccountInfo();
    case "tiktok_get_campaigns":          return tiktokGetCampaigns(args as any);
    case "tiktok_get_adgroups":           return tiktokGetAdGroups(args as any);
    case "tiktok_get_campaign_performance": return tiktokGetCampaignPerformance(args as any);
    case "tiktok_get_ad_performance":     return tiktokGetAdPerformance(args as any);

    // LinkedIn Ads
    case "linkedin_get_account_info":     return linkedinGetAccountInfo();
    case "linkedin_get_campaigns":        return linkedinGetCampaigns(args as any);
    case "linkedin_get_campaign_groups":  return linkedinGetCampaignGroups(args as any);
    case "linkedin_get_analytics":        return linkedinGetCampaignAnalytics(args as any);
    case "linkedin_get_demographic_analytics": return linkedinGetDemographicAnalytics(args as any);

    // Cross-platform
    case "get_all_platforms_summary":          return getAllPlatformsSummary(args as any);

    // Northbeam
    case "northbeam_get_channel_performance":  return northbeamGetChannelPerformance(args as any);
    case "northbeam_get_metric":               return northbeamGetMetric(args as any);
    case "northbeam_list_metrics":             return northbeamListMetrics();
    case "northbeam_list_dimensions":          return northbeamListDimensions();
    case "northbeam_get_attribution":          return northbeamGetAttribution(args as any);
    case "northbeam_get_cohort_analysis":      return northbeamGetCohortAnalysis(args as any);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

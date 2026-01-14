export type DataSource =
  | 'google_ai_overviews'
  | 'google_ai_mode'
  | 'chatgpt'
  | 'gemini'
  | 'perplexity'
  | 'copilot';

export interface Brand {
  id: string;
  name: string;
  domain?: string;
  isCompetitor: boolean;
}

export interface MentionsOverview {
  brand: string;
  total: number;
  only_target_brand: number;
  only_competitors_brands: number;
  target_and_competitors_brands: number;
  no_tracked_brands: number;
}

export interface MentionsHistory {
  date: string;
  mentions: number;
}

export interface ShareOfVoice {
  brand: string;
  share_of_voice: number;
}

export interface ShareOfVoiceHistory {
  date: string;
  share_of_voice: Array<{ brand: string; share_of_voice: number }>;
}

export interface ImpressionsOverview {
  brand: string;
  total: number;
  only_target_brand: number;
  only_competitors_brands: number;
  target_and_competitors_brands: number;
  no_tracked_brands: number;
}

export interface SEOMetrics {
  org_keywords: number;
  org_traffic: number;
  org_cost: number;
  paid_keywords: number;
  paid_traffic: number;
  paid_cost: number;
}

export interface AIResponse {
  question: string;
  response: string;
  volume: number;
  country: string;
  links: Array<{ url: string; title?: string }>;
}

export interface DashboardConfig {
  brands: Brand[];
  dataSource: DataSource;
  country: string;
  dateFrom: string;
  dateTo: string;
}

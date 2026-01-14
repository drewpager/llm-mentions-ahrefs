import type {
  DataSource,
  MentionsOverview,
  MentionsHistory,
  ShareOfVoice,
  ShareOfVoiceHistory,
  ImpressionsOverview,
  SEOMetrics,
  AIResponse,
} from '../types';

// Use local proxy in dev, Vercel serverless in production
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

class AhrefsService {
  private apiKey: string = '';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  private normalizeCountry(country: string | undefined): string {
    return country ? country.toLowerCase() : '';
  }

  private async request<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const url = new URL(`${API_BASE}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      // Normalize country codes to lowercase
      if (key === 'country' && value) {
        url.searchParams.append(key, value.toLowerCase());
      } else if (value) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async getMentionsOverview(params: {
    dataSource: DataSource;
    brand?: string;
    competitors?: string;
    country?: string;
    market?: string;
  }): Promise<{ mentions: MentionsOverview[] }> {
    const result = await this.request<{ metrics: MentionsOverview[] }>('/brand-radar/mentions-overview', {
      select: 'brand,total,only_target_brand,only_competitors_brands,target_and_competitors_brands,no_tracked_brands',
      data_source: params.dataSource,
      brand: params.brand || '',
      competitors: params.competitors || '',
      country: params.country || '',
      market: params.market || '',
    });
    return { mentions: result.metrics || [] };
  }

  async getMentionsHistory(params: {
    dataSource: DataSource;
    brand: string;
    dateFrom: string;
    dateTo?: string;
    country?: string;
  }): Promise<{ mentions: MentionsHistory[] }> {
    const result = await this.request<{ metrics: MentionsHistory[] }>('/brand-radar/mentions-history', {
      data_source: params.dataSource,
      brand: params.brand,
      date_from: params.dateFrom,
      date_to: params.dateTo || '',
      country: params.country || '',
    });
    return { mentions: result.metrics || [] };
  }

  async getShareOfVoiceOverview(params: {
    dataSource: DataSource;
    brand?: string;
    competitors?: string;
    country?: string;
  }): Promise<{ share_of_voice: ShareOfVoice[] }> {
    const result = await this.request<{ metrics: ShareOfVoice[] }>('/brand-radar/sov-overview', {
      select: 'brand,share_of_voice',
      data_source: params.dataSource,
      brand: params.brand || '',
      competitors: params.competitors || '',
      country: params.country || '',
    });
    return { share_of_voice: result.metrics || [] };
  }

  async getShareOfVoiceHistory(params: {
    dataSource: DataSource;
    brand?: string;
    competitors?: string;
    dateFrom: string;
    dateTo?: string;
    country?: string;
  }): Promise<{ share_of_voice: ShareOfVoiceHistory[] }> {
    const result = await this.request<{ metrics: ShareOfVoiceHistory[] }>('/brand-radar/sov-history', {
      data_source: params.dataSource,
      brand: params.brand || '',
      competitors: params.competitors || '',
      date_from: params.dateFrom,
      date_to: params.dateTo || '',
      country: params.country || '',
    });
    return { share_of_voice: result.metrics || [] };
  }

  async getImpressionsOverview(params: {
    dataSource: DataSource;
    brand?: string;
    competitors?: string;
    country?: string;
  }): Promise<{ impressions: ImpressionsOverview[] }> {
    const result = await this.request<{ metrics: ImpressionsOverview[] }>('/brand-radar/impressions-overview', {
      select: 'brand,total,only_target_brand,only_competitors_brands,target_and_competitors_brands,no_tracked_brands',
      data_source: params.dataSource,
      brand: params.brand || '',
      competitors: params.competitors || '',
      country: params.country || '',
    });
    return { impressions: result.metrics || [] };
  }

  async getSEOMetrics(params: {
    target: string;
    date: string;
    country?: string;
  }): Promise<{ metrics: SEOMetrics }> {
    const result = await this.request<{ metrics: SEOMetrics }>('/site-explorer/metrics', {
      target: params.target,
      date: params.date,
      mode: 'subdomains',
      country: params.country || '',
    });
    return { metrics: result.metrics };
  }

  async getAIResponses(params: {
    dataSource: DataSource;
    brand?: string;
    competitors?: string;
    country?: string;
    limit?: number;
  }): Promise<{ ai_responses: AIResponse[] }> {
    const result = await this.request<{ ai_responses: AIResponse[] }>('/brand-radar/ai-responses', {
      select: 'question,response,volume,country,links',
      data_source: params.dataSource,
      brand: params.brand || '',
      competitors: params.competitors || '',
      country: params.country || '',
      limit: params.limit?.toString() || '20',
    });
    return { ai_responses: result.ai_responses || [] };
  }
}

export const ahrefsService = new AhrefsService();

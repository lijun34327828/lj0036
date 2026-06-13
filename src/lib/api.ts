import type {
  AggregatedStats,
  TrendPoint,
  ArticleWithMetrics,
  CategoryStats,
  FilterParams,
  TimePeriod,
} from '@shared/types';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}

function buildQuery(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        parts.push(`${key}=${value.join(',')}`);
      }
    } else {
      parts.push(`${key}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

function toRecord(obj: unknown): Record<string, unknown> {
  return obj as Record<string, unknown>;
}

export const api = {
  getOverview(filter: FilterParams = {}): Promise<AggregatedStats> {
    return request<AggregatedStats>(`/stats/overview${buildQuery(toRecord(filter))}`);
  },

  getTrends(period: TimePeriod = 'day', filter: FilterParams = {}): Promise<TrendPoint[]> {
    return request<TrendPoint[]>(`/stats/trends${buildQuery({ period, ...toRecord(filter) })}`);
  },

  getArticles(filter: FilterParams = {}): Promise<ArticleWithMetrics[]> {
    return request<ArticleWithMetrics[]>(`/articles${buildQuery(toRecord(filter))}`);
  },

  getArticleById(id: string): Promise<ArticleWithMetrics> {
    return request<ArticleWithMetrics>(`/articles/${id}`);
  },

  getRanking(
    sortBy: FilterParams['sortBy'] = 'engagement',
    limit = 20,
    filter: FilterParams = {}
  ): Promise<ArticleWithMetrics[]> {
    return request<ArticleWithMetrics[]>(
      `/articles/ranking${buildQuery({ sortBy, limit, ...toRecord(filter) })}`
    );
  },

  getCategories(): Promise<string[]> {
    return request<string[]>('/categories');
  },

  getCategoryStats(filter: FilterParams = {}): Promise<CategoryStats[]> {
    return request<CategoryStats[]>(`/categories/stats${buildQuery(toRecord(filter))}`);
  },

  getExportUrl(filter: FilterParams = {}): string {
    return `${API_BASE}/export/csv${buildQuery(toRecord(filter))}`;
  },
};

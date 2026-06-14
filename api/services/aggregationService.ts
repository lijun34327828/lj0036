import {
  getAllArticles,
  getDailyTrends,
  getCategoryStats,
  getArticleById,
  getAllCategories,
} from '../db/repository.js';
import {
  calcCompletionRate,
  calcEngagementRate,
  enrichArticleWithMetrics,
  calcOverallScore,
  getScoreLevel,
} from './metricsService.js';
import type {
  AggregatedStats,
  TrendPoint,
  CategoryStats,
  FilterParams,
  ArticleWithMetrics,
  TimePeriod,
  Article,
  ArticleMetrics,
} from '../../shared/types.js';

function getPreviousPeriodFilter(filter: FilterParams): FilterParams | null {
  const { startDate, endDate } = filter;
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days + 1);

  return {
    ...filter,
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0],
  };
}

function calcTrend(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  const trend = ((current - previous) / previous) * 100;
  return Math.round(trend * 10) / 10;
}

function calculateStatsFromArticles(articles: (Article & { metrics: ArticleMetrics })[]): Omit<AggregatedStats, 'trends'> {
  const stats: Omit<AggregatedStats, 'trends'> = {
    totalArticles: articles.length,
    totalViews: 0,
    totalUniqueViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    totalFavorites: 0,
    totalNewFollowers: 0,
    avgCompletionRate: 0,
    avgEngagementRate: 0,
    overallScore: 0,
    scoreLevel: 'poor',
  };

  if (articles.length === 0) {
    return stats;
  }

  let totalCompletionRate = 0;
  let totalEngagementRate = 0;

  for (const article of articles) {
    const metrics = article.metrics;
    stats.totalViews += metrics.views;
    stats.totalUniqueViews += metrics.uniqueViews;
    stats.totalLikes += metrics.likes;
    stats.totalShares += metrics.shares;
    stats.totalComments += metrics.comments;
    stats.totalFavorites += metrics.favorites;
    stats.totalNewFollowers += metrics.newFollowers;
    totalCompletionRate += calcCompletionRate(metrics);
    totalEngagementRate += calcEngagementRate(metrics);
  }

  stats.avgCompletionRate = Math.round((totalCompletionRate / articles.length) * 100) / 100;
  stats.avgEngagementRate = Math.round((totalEngagementRate / articles.length) * 100) / 100;
  stats.overallScore = calcOverallScore(
    stats.avgCompletionRate,
    stats.avgEngagementRate,
    stats.totalNewFollowers,
    stats.totalArticles
  );
  stats.scoreLevel = getScoreLevel(stats.overallScore);

  return stats;
}

export function getOverviewStats(filter: FilterParams = {}): AggregatedStats {
  const articles = getAllArticles(filter);
  const current = calculateStatsFromArticles(articles);

  const trends: AggregatedStats['trends'] = {
    totalViews: null,
    totalUniqueViews: null,
    totalLikes: null,
    totalShares: null,
    totalComments: null,
    totalNewFollowers: null,
    overallScore: null,
  };

  const prevFilter = getPreviousPeriodFilter(filter);
  if (prevFilter) {
    const prevArticles = getAllArticles(prevFilter);
    if (prevArticles.length > 0) {
      const prev = calculateStatsFromArticles(prevArticles);
      trends.totalViews = calcTrend(current.totalViews, prev.totalViews);
      trends.totalUniqueViews = calcTrend(current.totalUniqueViews, prev.totalUniqueViews);
      trends.totalLikes = calcTrend(current.totalLikes, prev.totalLikes);
      trends.totalShares = calcTrend(current.totalShares, prev.totalShares);
      trends.totalComments = calcTrend(current.totalComments, prev.totalComments);
      trends.totalNewFollowers = calcTrend(current.totalNewFollowers, prev.totalNewFollowers);
      trends.overallScore = calcTrend(current.overallScore, prev.overallScore);
    }
  }

  return { ...current, trends };
}

export function getTrends(period: TimePeriod = 'day', filter: FilterParams = {}): TrendPoint[] {
  const trendFilter: FilterParams = { ...filter };

  if (!trendFilter.startDate && !trendFilter.endDate) {
    let days = 30;
    if (period === 'week') days = 90;
    if (period === 'month') days = 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    trendFilter.startDate = startDate.toISOString().split('T')[0];
  }

  const dailyData = getDailyTrends(trendFilter);

  if (period === 'day') {
    return dailyData.map(d => ({
      date: d.date,
      views: d.views ?? 0,
      uniqueViews: d.unique_views ?? 0,
      likes: d.likes ?? 0,
      shares: d.shares ?? 0,
      comments: d.comments ?? 0,
      favorites: d.favorites ?? 0,
    }));
  }

  const aggregated: Map<string, TrendPoint> = new Map();

  for (const d of dailyData) {
    const date = new Date(d.date);
    let key: string;

    if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!aggregated.has(key)) {
      aggregated.set(key, {
        date: key,
        views: 0,
        uniqueViews: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        favorites: 0,
      });
    }

    const agg = aggregated.get(key)!;
    agg.views += d.views ?? 0;
    agg.uniqueViews += d.unique_views ?? 0;
    agg.likes += d.likes ?? 0;
    agg.shares += d.shares ?? 0;
    agg.comments += d.comments ?? 0;
    agg.favorites += d.favorites ?? 0;
  }

  return Array.from(aggregated.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getCategoryStatistics(filter: FilterParams = {}): CategoryStats[] {
  const rows = getCategoryStats(filter);
  return rows.map(r => {
    const totalEngagement = (r.total_likes_sum ?? 0) + (r.total_shares ?? 0) + (r.total_comments ?? 0) + (r.total_favorites ?? 0);
    const avgEngagement = r.total_unique_views && r.total_unique_views > 0
      ? Math.round((totalEngagement / r.total_unique_views) * 10000) / 100
      : 0;
    return {
      category: r.category,
      articleCount: r.article_count,
      totalViews: r.total_views ?? 0,
      totalLikes: r.total_likes_sum ?? 0,
      avgEngagementRate: avgEngagement,
    };
  });
}

export function getRankingArticles(sortBy: FilterParams['sortBy'] = 'engagement', limit: number = 20, filter: FilterParams = {}): ArticleWithMetrics[] {
  const articles = getAllArticles({
    ...filter,
    sortBy,
    sortOrder: 'desc',
    limit,
  });
  return articles.map(enrichArticleWithMetrics);
}

export function getArticleDetail(id: string): ArticleWithMetrics | null {
  const article = getArticleById(id);
  if (!article) return null;
  return enrichArticleWithMetrics(article);
}

export function getCategoriesList(): string[] {
  return getAllCategories();
}

export function getArticlesForExport(filter: FilterParams = {}): ArticleWithMetrics[] {
  const articles = getAllArticles({
    ...filter,
    sortBy: filter.sortBy ?? 'date',
    sortOrder: filter.sortOrder ?? 'desc',
  });
  return articles.map(enrichArticleWithMetrics);
}

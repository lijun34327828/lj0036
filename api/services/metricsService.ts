import type { ArticleMetrics, AggregatedStats, ArticleWithMetrics } from '../../shared/types.js';

export function calcCompletionRate(metrics: ArticleMetrics): number {
  if (metrics.uniqueViews === 0) return 0;
  return Math.round((metrics.completedViews / metrics.uniqueViews) * 10000) / 100;
}

export function calcEngagementRate(metrics: ArticleMetrics): number {
  if (metrics.uniqueViews === 0) return 0;
  const totalEngagements = metrics.likes + metrics.shares + metrics.comments + metrics.favorites;
  return Math.round((totalEngagements / metrics.uniqueViews) * 10000) / 100;
}

export function calcEngagementScore(metrics: ArticleMetrics): number {
  const weights = {
    likes: 1,
    shares: 3,
    comments: 2,
    favorites: 2,
  };
  const weightedScore =
    metrics.likes * weights.likes +
    metrics.shares * weights.shares +
    metrics.comments * weights.comments +
    metrics.favorites * weights.favorites;

  if (metrics.uniqueViews === 0) return 0;
  return Math.round((weightedScore / metrics.uniqueViews) * 1000) / 10;
}

export function enrichArticleWithMetrics(
  article: { id: string; title: string; category: string; author: string; publishDate: string; coverUrl?: string; metrics: ArticleMetrics }
): ArticleWithMetrics {
  return {
    ...article,
    completionRate: calcCompletionRate(article.metrics),
    engagementRate: calcEngagementRate(article.metrics),
    engagementScore: calcEngagementScore(article.metrics),
  };
}

export function calcOverallScore(completionRate: number, engagementRate: number, totalNewFollowers: number, totalArticles: number): number {
  const completionWeight = 0.35;
  const engagementWeight = 0.45;
  const followerWeight = 0.20;

  const avgFollowers = totalArticles > 0 ? totalNewFollowers / totalArticles : 0;
  const followerScore = Math.min(avgFollowers / 50, 1) * 100;

  const score =
    completionRate * completionWeight +
    engagementRate * engagementWeight +
    followerScore * followerWeight;

  return Math.round(score * 10) / 10;
}

export function getScoreLevel(score: number): AggregatedStats['scoreLevel'] {
  if (score >= 75) return 'excellent';
  if (score >= 55) return 'good';
  if (score >= 35) return 'fair';
  return 'poor';
}

import { db } from './index.js';
import type { Article, ArticleMetrics, FilterParams } from '../../shared/types.js';

export interface ArticleRow {
  id: string;
  title: string;
  category: string;
  author: string;
  publish_date: string;
  cover_url: string | null;
}

export interface ArticleMetricsRow {
  id: string;
  article_id: string;
  views: number;
  unique_views: number;
  completed_views: number;
  likes: number;
  shares: number;
  comments: number;
  favorites: number;
  new_followers: number;
  avg_read_time_seconds: number;
}

export interface DailyTrendRow {
  date: string;
  views: number;
  unique_views: number;
  likes: number;
  shares: number;
  comments: number;
  favorites: number;
}

export interface CategoryStatsRow {
  category: string;
  article_count: number;
  total_views: number;
  total_likes: number;
  total_unique_views: number;
  total_likes_sum: number;
  total_shares: number;
  total_comments: number;
  total_favorites: number;
}

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    author: row.author,
    publishDate: row.publish_date,
    coverUrl: row.cover_url ?? undefined,
  };
}

function rowToArticleMetrics(row: ArticleMetricsRow): ArticleMetrics {
  return {
    articleId: row.article_id,
    views: row.views,
    uniqueViews: row.unique_views,
    completedViews: row.completed_views,
    likes: row.likes,
    shares: row.shares,
    comments: row.comments,
    favorites: row.favorites,
    newFollowers: row.new_followers,
    avgReadTime: row.avg_read_time_seconds,
  };
}

export function getArticleById(id: string): (Article & { metrics: ArticleMetrics }) | null {
  const row = db.prepare(`
    SELECT a.*, m.*, m.id as metrics_id
    FROM articles a
    LEFT JOIN article_metrics m ON a.id = m.article_id
    WHERE a.id = ?
  `).get(id) as (ArticleRow & ArticleMetricsRow) | undefined;

  if (!row) return null;

  const article = rowToArticle(row);
  const metrics = rowToArticleMetrics(row);
  return { ...article, metrics };
}

export function getAllArticles(filter: FilterParams = {}): (Article & { metrics: ArticleMetrics })[] {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter.startDate) {
    clauses.push('DATE(a.publish_date) >= ?');
    params.push(filter.startDate);
  }
  if (filter.endDate) {
    clauses.push('DATE(a.publish_date) <= ?');
    params.push(filter.endDate);
  }
  if (filter.categories && filter.categories.length > 0) {
    clauses.push(`a.category IN (${filter.categories.map(() => '?').join(',')})`);
    params.push(...filter.categories);
  }
  if (filter.minViews) {
    clauses.push('m.views >= ?');
    params.push(filter.minViews);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  let orderBy = 'a.publish_date DESC';
  if (filter.sortBy) {
    switch (filter.sortBy) {
      case 'views': orderBy = 'm.views'; break;
      case 'likes': orderBy = 'm.likes'; break;
      case 'shares': orderBy = 'm.shares'; break;
      case 'comments': orderBy = 'm.comments'; break;
      case 'engagement':
        orderBy = '(m.likes + m.shares + m.comments + m.favorites)';
        break;
      case 'date':
      default:
        orderBy = 'a.publish_date';
    }
    orderBy += filter.sortOrder === 'asc' ? ' ASC' : ' DESC';
  }

  let limit = '';
  if (filter.limit) {
    limit = `LIMIT ${filter.limit}`;
    if (filter.offset) {
      limit += ` OFFSET ${filter.offset}`;
    }
  }

  const rows = db.prepare(`
    SELECT a.*, m.*, m.id as metrics_id
    FROM articles a
    LEFT JOIN article_metrics m ON a.id = m.article_id
    ${where}
    ORDER BY ${orderBy}
    ${limit}
  `).all(...params) as (ArticleRow & ArticleMetricsRow)[];

  return rows.map(row => {
    const article = rowToArticle(row);
    const metrics = rowToArticleMetrics(row);
    return { ...article, metrics };
  });
}

export function getAllCategories(): string[] {
  const rows = db.prepare(`
    SELECT DISTINCT category FROM articles ORDER BY category
  `).all() as { category: string }[];
  return rows.map(r => r.category);
}

export function getDailyTrends(filter: FilterParams = {}): DailyTrendRow[] {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter.startDate) {
    clauses.push('DATE(a.publish_date) >= ?');
    params.push(filter.startDate);
  }
  if (filter.endDate) {
    clauses.push('DATE(a.publish_date) <= ?');
    params.push(filter.endDate);
  }
  if (filter.categories && filter.categories.length > 0) {
    clauses.push(`a.category IN (${filter.categories.map(() => '?').join(',')})`);
    params.push(...filter.categories);
  }
  if (filter.minViews) {
    clauses.push('m.views >= ?');
    params.push(filter.minViews);
  }

  if (!filter.startDate && !filter.endDate) {
    clauses.push('DATE(a.publish_date) >= DATE(\'now\', \'-30 days\')');
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  const rows = db.prepare(`
    SELECT
      DATE(a.publish_date) as date,
      SUM(m.views) as views,
      SUM(m.unique_views) as unique_views,
      SUM(m.likes) as likes,
      SUM(m.shares) as shares,
      SUM(m.comments) as comments,
      SUM(m.favorites) as favorites
    FROM articles a
    LEFT JOIN article_metrics m ON a.id = m.article_id
    ${where}
    GROUP BY DATE(a.publish_date)
    ORDER BY date ASC
  `).all(...params) as DailyTrendRow[];
  return rows;
}

export function getCategoryStats(filter: FilterParams = {}): CategoryStatsRow[] {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter.startDate) {
    clauses.push('DATE(a.publish_date) >= ?');
    params.push(filter.startDate);
  }
  if (filter.endDate) {
    clauses.push('DATE(a.publish_date) <= ?');
    params.push(filter.endDate);
  }
  if (filter.categories && filter.categories.length > 0) {
    clauses.push(`a.category IN (${filter.categories.map(() => '?').join(',')})`);
    params.push(...filter.categories);
  }
  if (filter.minViews) {
    clauses.push('m.views >= ?');
    params.push(filter.minViews);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  const rows = db.prepare(`
    SELECT
      a.category,
      COUNT(a.id) as article_count,
      SUM(m.views) as total_views,
      SUM(m.unique_views) as total_unique_views,
      SUM(m.likes) as total_likes_sum,
      SUM(m.shares) as total_shares,
      SUM(m.comments) as total_comments,
      SUM(m.favorites) as total_favorites
    FROM articles a
    LEFT JOIN article_metrics m ON a.id = m.article_id
    ${where}
    GROUP BY a.category
    ORDER BY total_views DESC
  `).all(...params) as CategoryStatsRow[];
  return rows;
}

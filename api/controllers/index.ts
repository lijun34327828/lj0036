import type { Request, Response } from 'express';
import {
  getOverviewStats,
  getTrends,
  getRankingArticles,
  getArticleDetail,
  getCategoriesList,
  getCategoryStatistics,
} from '../services/aggregationService.js';
import { cleanInvalidVisits } from '../services/cleaningService.js';
import { generateArticlesCSV } from '../services/exportService.js';
import type { FilterParams, TimePeriod } from '../../shared/types.js';

function parseFilterParams(req: Request): FilterParams {
  const filter: FilterParams = {};
  const q = req.query;

  if (q.startDate && typeof q.startDate === 'string') filter.startDate = q.startDate;
  if (q.endDate && typeof q.endDate === 'string') filter.endDate = q.endDate;
  if (q.categories && typeof q.categories === 'string') {
    filter.categories = q.categories.split(',').filter(Boolean);
  }
  if (q.minViews) filter.minViews = Number(q.minViews);
  if (q.sortBy && typeof q.sortBy === 'string') {
    filter.sortBy = q.sortBy as FilterParams['sortBy'];
  }
  if (q.sortOrder && typeof q.sortOrder === 'string') {
    filter.sortOrder = q.sortOrder as 'asc' | 'desc';
  }
  if (q.limit) filter.limit = Number(q.limit);
  if (q.offset) filter.offset = Number(q.offset);

  return filter;
}

export const statsController = {
  getOverview(req: Request, res: Response): void {
    const filter = parseFilterParams(req);
    const stats = getOverviewStats(filter);
    res.json({ success: true, data: stats });
  },

  getTrends(req: Request, res: Response): void {
    const period = (req.query.period as TimePeriod) || 'day';
    const filter = parseFilterParams(req);
    const trends = getTrends(period, filter);
    res.json({ success: true, data: trends });
  },
};

export const articlesController = {
  getList(req: Request, res: Response): void {
    const filter = parseFilterParams(req);
    const data = getRankingArticles(filter.sortBy, filter.limit ?? 100, filter);
    res.json({ success: true, data });
  },

  getById(req: Request, res: Response): void {
    const article = getArticleDetail(req.params.id);
    if (!article) {
      res.status(404).json({ success: false, error: 'Article not found' });
      return;
    }
    res.json({ success: true, data: article });
  },

  getRanking(req: Request, res: Response): void {
    const sortBy = (req.query.sortBy as FilterParams['sortBy']) || 'engagement';
    const limit = Number(req.query.limit) || 20;
    const filter = parseFilterParams(req);
    const data = getRankingArticles(sortBy, limit, filter);
    res.json({ success: true, data });
  },
};

export const categoriesController = {
  getList(_req: Request, res: Response): void {
    const categories = getCategoriesList();
    res.json({ success: true, data: categories });
  },

  getStats(req: Request, res: Response): void {
    const filter = parseFilterParams(req);
    const stats = getCategoryStatistics(filter);
    res.json({ success: true, data: stats });
  },
};

export const cleaningController = {
  clean(req: Request, res: Response): void {
    const stats = cleanInvalidVisits();
    res.json({ success: true, data: stats });
  },
};

export const exportController = {
  exportCSV(req: Request, res: Response): void {
    const filter = parseFilterParams(req);
    const csv = generateArticlesCSV(filter);
    const filename = `content-analytics-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  },
};

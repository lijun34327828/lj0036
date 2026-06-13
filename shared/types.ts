export interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  publishDate: string;
  coverUrl?: string;
}

export interface ArticleMetrics {
  articleId: string;
  views: number;
  uniqueViews: number;
  completedViews: number;
  likes: number;
  shares: number;
  comments: number;
  favorites: number;
  newFollowers: number;
  avgReadTime: number;
}

export interface ArticleWithMetrics extends Article {
  metrics: ArticleMetrics;
  completionRate: number;
  engagementRate: number;
  engagementScore: number;
}

export interface AggregatedStats {
  totalArticles: number;
  totalViews: number;
  totalUniqueViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalFavorites: number;
  totalNewFollowers: number;
  avgCompletionRate: number;
  avgEngagementRate: number;
  overallScore: number;
  scoreLevel: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TrendPoint {
  date: string;
  views: number;
  uniqueViews: number;
  likes: number;
  shares: number;
  comments: number;
  favorites: number;
}

export interface CategoryStats {
  category: string;
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  avgEngagementRate: number;
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  minViews?: number;
  sortBy?: 'views' | 'likes' | 'engagement' | 'date' | 'shares' | 'comments';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export type TimePeriod = 'day' | 'week' | 'month';

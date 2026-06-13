import { Link } from 'react-router-dom';
import { Trophy, Eye, Heart, MessageSquare, Share2, Bookmark, ChevronRight, Users } from 'lucide-react';
import type { ArticleWithMetrics } from '@shared/types';

interface Props {
  articles: ArticleWithMetrics[];
  maxItems?: number;
  showTitle?: boolean;
}

const rankColors = [
  'bg-accent-500',
  'bg-slate-400',
  'bg-amber-600',
];

export default function RankingList({ articles, maxItems, showTitle = true }: Props) {
  const displayArticles = maxItems ? articles.slice(0, maxItems) : articles;
  const maxViews = Math.max(...articles.map((a) => a.metrics.views), 1);

  return (
    <div className="bg-white rounded-lg shadow-card border border-slate-100 overflow-hidden animate-slide-up">
      {showTitle && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent-500" />
            <h3 className="font-semibold text-slate-800">热门内容排行</h3>
          </div>
          <Link to="/ranking" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
            查看全部
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="divide-y divide-slate-50">
        {displayArticles.map((article, index) => (
          <Link
            key={article.id}
            to={`/content/${article.id}`}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                index < 3 ? rankColors[index] : 'bg-slate-200 text-slate-500'
              }`}
            >
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary-600 transition-colors line-clamp-1">
                  {article.title}
                </p>
                <span className="text-xs text-slate-400 flex-shrink-0 font-mono">
                  {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium flex-shrink-0">
                  {article.category}
                </span>
                <span className="text-xs text-slate-400">{article.author}</span>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 ml-auto">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.metrics.views.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {article.metrics.likes.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {article.metrics.shares.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {article.metrics.comments.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
                    style={{ width: `${(article.metrics.views / maxViews) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">完成率</span>
                  <span className="font-mono font-medium text-slate-700">
                    {article.completionRate}%
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-400">互动率</span>
                  <span className="font-mono font-medium text-accent-600">
                    {article.engagementRate}%
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-0.5 text-primary-600">
                    <Users className="w-3 h-3" />
                    <span className="font-mono font-medium">+{article.metrics.newFollowers}</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

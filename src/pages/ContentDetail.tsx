import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Users,
  Heart,
  Share2,
  MessageSquare,
  Bookmark,
  UserPlus,
  Clock,
  Target,
  BarChart3,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ArticleWithMetrics } from '@shared/types';

interface MetricDisplayProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

function MetricDisplay({ icon: Icon, label, value, subtext, color }: MetricDisplayProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-100 p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-mono font-bold text-slate-800">{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleWithMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getArticleById(id)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400 text-sm">加载中...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">未找到该内容</p>
        <Link to="/ranking" className="text-primary-600 hover:text-primary-700 text-sm inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          返回排行榜
        </Link>
      </div>
    );
  }

  const m = article.metrics;

  return (
    <div>
      <Link to="/ranking" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回排行榜
      </Link>

      <div className="bg-white rounded-lg shadow-card border border-slate-100 p-6 mb-6 animate-slide-up">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-600">
                <Tag className="w-3 h-3" />
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                <User className="w-3 h-3" />
                {article.author}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                <Calendar className="w-3 h-3" />
                {new Date(article.publishDate).toLocaleString('zh-CN', { hour12: false })}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 leading-relaxed mb-2">
              {article.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary-500" />
                阅读完成率
                <span className="font-mono font-semibold text-slate-700">{article.completionRate}%</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-accent-500" />
                互动率
                <span className="font-mono font-semibold text-slate-700">{article.engagementRate}%</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                互动得分
                <span className="font-mono font-semibold text-slate-700">{article.engagementScore}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-700 mb-4">核心数据指标</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricDisplay
          icon={Eye}
          label="阅读量"
          value={m.views.toLocaleString()}
          color="bg-gradient-to-br from-primary-500 to-primary-700"
        />
        <MetricDisplay
          icon={Users}
          label="独立访客"
          value={m.uniqueViews.toLocaleString()}
          subtext={`访客占比 ${((m.uniqueViews / m.views) * 100).toFixed(1)}%`}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <MetricDisplay
          icon={Eye}
          label="完成阅读"
          value={m.completedViews.toLocaleString()}
          subtext={`完成率 ${article.completionRate}%`}
          color="bg-gradient-to-br from-cyan-500 to-cyan-700"
        />
        <MetricDisplay
          icon={Clock}
          label="平均阅读时长"
          value={`${m.avgReadTime}秒`}
          color="bg-gradient-to-br from-slate-500 to-slate-700"
        />
      </div>

      <h2 className="text-sm font-semibold text-slate-700 mb-4">互动与转化指标</h2>
      <div className="grid grid-cols-5 gap-4 mb-6">
        <MetricDisplay
          icon={Heart}
          label="点赞数"
          value={m.likes.toLocaleString()}
          color="bg-gradient-to-br from-rose-500 to-rose-600"
        />
        <MetricDisplay
          icon={Share2}
          label="转发数"
          value={m.shares.toLocaleString()}
          color="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
        <MetricDisplay
          icon={MessageSquare}
          label="评论数"
          value={m.comments.toLocaleString()}
          color="bg-gradient-to-br from-violet-500 to-violet-700"
        />
        <MetricDisplay
          icon={Bookmark}
          label="收藏数"
          value={m.favorites.toLocaleString()}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <MetricDisplay
          icon={UserPlus}
          label="新增粉丝"
          value={`+${m.newFollowers.toLocaleString()}`}
          subtext="粉丝引流数"
          color="bg-gradient-to-br from-accent-500 to-accent-700"
        />
      </div>

      <div className="bg-white rounded-lg shadow-card border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">互动构成分析</h3>
        <div className="space-y-4">
          {[
            { label: '点赞', value: m.likes, color: 'bg-rose-500' },
            { label: '转发', value: m.shares, color: 'bg-emerald-500' },
            { label: '评论', value: m.comments, color: 'bg-violet-500' },
            { label: '收藏', value: m.favorites, color: 'bg-amber-500' },
          ].map((item) => {
            const total = m.likes + m.shares + m.comments + m.favorites;
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="text-slate-500">
                    <span className="font-mono font-medium text-slate-700">{item.value.toLocaleString()}</span>
                    <span className="ml-2 text-slate-400">{percent}%</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

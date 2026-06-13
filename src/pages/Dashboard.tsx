import { useState, useEffect } from 'react';
import { Eye, Users, Heart, Share2, MessageSquare, Bookmark, UserPlus, TrendingUp } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import OverallScoreCard from '@/components/OverallScoreCard';
import TrendChart from '@/components/TrendChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import RankingList from '@/components/RankingList';
import FilterPanel from '@/components/FilterPanel';
import { api } from '@/lib/api';
import { useFilterStore } from '@/store/filterStore';
import type { AggregatedStats, TrendPoint, CategoryStats, ArticleWithMetrics } from '@shared/types';

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
}

export default function Dashboard() {
  const { filters, timePeriod } = useFilterStore();
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [topArticles, setTopArticles] = useState<ArticleWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [s, t, c, a] = await Promise.all([
          api.getOverview(filters),
          api.getTrends(timePeriod, filters),
          api.getCategoryStats(filters),
          api.getRanking('engagement', 8, filters),
        ]);
        setStats(s);
        setTrends(t);
        setCategoryStats(c);
        setTopArticles(a);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters, timePeriod]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">数据概览</h1>
        <p className="text-sm text-slate-500">内容运营核心指标与整体表现一览</p>
      </div>

      <FilterPanel />

      {loading && !stats ? (
        <div className="grid grid-cols-6 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-lg border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-6 gap-4 mb-6">
          <MetricCard
            title="总阅读量"
            value={formatNumber(stats.totalViews)}
            icon={Eye}
            gradient="bg-gradient-to-br from-primary-500 to-primary-700"
            trend={12.5}
            description="对比上期"
          />
          <MetricCard
            title="独立访客"
            value={formatNumber(stats.totalUniqueViews)}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            trend={8.3}
          />
          <MetricCard
            title="总点赞数"
            value={formatNumber(stats.totalLikes)}
            icon={Heart}
            gradient="bg-gradient-to-br from-rose-500 to-rose-600"
            trend={15.2}
          />
          <MetricCard
            title="总转发数"
            value={formatNumber(stats.totalShares)}
            icon={Share2}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            trend={-2.1}
          />
          <MetricCard
            title="总评论数"
            value={formatNumber(stats.totalComments)}
            icon={MessageSquare}
            gradient="bg-gradient-to-br from-violet-500 to-violet-700"
            trend={6.8}
          />
          <MetricCard
            title="粉丝引流"
            value={formatNumber(stats.totalNewFollowers)}
            icon={UserPlus}
            gradient="bg-gradient-to-br from-accent-500 to-accent-700"
            trend={21.4}
            description="新增粉丝"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-8">
          <TrendChart data={trends} loading={loading} />
        </div>
        <div className="col-span-4">
          {stats && <OverallScoreCard stats={stats} />}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5">
          <CategoryPieChart data={categoryStats} />
        </div>
        <div className="col-span-7">
          <RankingList articles={topArticles} maxItems={8} />
        </div>
      </div>
    </div>
  );
}

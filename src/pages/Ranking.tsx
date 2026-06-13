import { useState, useEffect } from 'react';
import { Trophy, ArrowUpDown } from 'lucide-react';
import RankingList from '@/components/RankingList';
import FilterPanel from '@/components/FilterPanel';
import { api } from '@/lib/api';
import { useFilterStore } from '@/store/filterStore';
import type { ArticleWithMetrics, FilterParams } from '@shared/types';

const sortOptions: { value: FilterParams['sortBy']; label: string }[] = [
  { value: 'engagement', label: '综合互动' },
  { value: 'views', label: '阅读量' },
  { value: 'likes', label: '点赞数' },
  { value: 'shares', label: '转发数' },
  { value: 'comments', label: '评论数' },
  { value: 'date', label: '发布时间' },
];

export default function Ranking() {
  const { filters, setSortBy } = useFilterStore();
  const [articles, setArticles] = useState<ArticleWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await api.getRanking(filters.sortBy ?? 'engagement', 100, filters);
        setArticles(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">内容排行榜</h1>
          <p className="text-sm text-slate-500">查看所有内容的运营表现排名</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <ArrowUpDown className="w-4 h-4" />
            <span>排序：</span>
          </div>
          <div className="flex bg-slate-100 rounded-md p-0.5">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  (filters.sortBy ?? 'engagement') === opt.value
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <FilterPanel />

      {loading ? (
        <div className="bg-white rounded-lg border border-slate-100 p-10 text-center text-slate-400 text-sm animate-pulse">
          加载中...
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-slate-700">
              共 {articles.length} 篇内容
            </span>
          </div>
          <RankingList articles={articles} showTitle={false} />
        </div>
      )}
    </div>
  );
}

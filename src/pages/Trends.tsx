import { useState, useEffect } from 'react';
import TrendChart from '@/components/TrendChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import CategoryBarChart from '@/components/CategoryBarChart';
import FilterPanel from '@/components/FilterPanel';
import { api } from '@/lib/api';
import { useFilterStore } from '@/store/filterStore';
import type { TrendPoint, CategoryStats } from '@shared/types';

export default function Trends() {
  const { filters, timePeriod } = useFilterStore();
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [t, c] = await Promise.all([
          api.getTrends(timePeriod, filters),
          api.getCategoryStats(filters),
        ]);
        setTrends(t);
        setCategoryStats(c);
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
        <h1 className="text-2xl font-bold text-slate-800 mb-1">流量趋势分析</h1>
        <p className="text-sm text-slate-500">按时间维度查看阅读与互动数据走势</p>
      </div>

      <FilterPanel />

      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12">
          <TrendChart data={trends} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5">
          <CategoryPieChart data={categoryStats} />
        </div>
        <div className="col-span-7">
          <CategoryBarChart data={categoryStats} />
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Filter, X, Download, RotateCcw } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { api } from '@/lib/api';

export default function FilterPanel() {
  const {
    filters,
    setDateRange,
    setCategories,
    setMinViews,
    resetFilters,
  } = useFilterStore();

  const [categories, setCategoriesList] = useState<string[]>([]);
  const [localStartDate, setLocalStartDate] = useState(filters.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(filters.endDate || '');
  const [localCategories, setLocalCategories] = useState<string[]>(filters.categories || []);
  const [localMinViews, setLocalMinViews] = useState<number | ''>(filters.minViews ?? '');

  useEffect(() => {
    api.getCategories().then(setCategoriesList).catch(() => {});
  }, []);

  const toggleCategory = (cat: string) => {
    setLocalCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const applyFilters = () => {
    setDateRange(localStartDate || undefined, localEndDate || undefined);
    setCategories(localCategories);
    setMinViews(localMinViews === '' ? undefined : Number(localMinViews));
  };

  const handleReset = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setLocalCategories([]);
    setLocalMinViews('');
    resetFilters();
  };

  const handleExport = () => {
    const exportFilters = {
      ...filters,
      startDate: localStartDate || undefined,
      endDate: localEndDate || undefined,
      categories: localCategories,
      minViews: localMinViews === '' ? undefined : Number(localMinViews),
    };
    window.location.href = api.getExportUrl(exportFilters);
  };

  const hasActiveFilters =
    localStartDate ||
    localEndDate ||
    localCategories.length > 0 ||
    localMinViews !== '';

  return (
    <div className="bg-white rounded-lg shadow-card border border-slate-100 p-5 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-slate-800">数据筛选</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            导出数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">开始日期</label>
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">结束日期</label>
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">最小阅读量</label>
          <input
            type="number"
            placeholder="例如：1000"
            value={localMinViews}
            onChange={(e) => setLocalMinViews(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          />
        </div>
        <div className="col-span-3 flex items-end">
          <button
            onClick={applyFilters}
            className="w-full px-4 py-2 text-sm font-medium bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors shadow-sm hover:shadow"
          >
            应用筛选
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <label className="block text-xs font-medium text-slate-500 mb-2">内容分类</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = localCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
                {active && <X className="w-3 h-3" />}
              </button>
            );
          })}
          {categories.length === 0 && (
            <span className="text-xs text-slate-400">正在加载分类...</span>
          )}
        </div>
      </div>
    </div>
  );
}

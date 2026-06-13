import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import type { TrendPoint, TimePeriod } from '@shared/types';

interface Props {
  data: TrendPoint[];
  loading?: boolean;
}

const CHART_COLORS = {
  views: '#2E66A1',
  uniqueViews: '#4F85BF',
  likes: '#F59E0B',
  shares: '#10B981',
  comments: '#8B5CF6',
  favorites: '#EC4899',
};

export default function TrendChart({ data, loading }: Props) {
  const { timePeriod, setTimePeriod } = useFilterStore();
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({
    views: true,
    likes: true,
    shares: true,
    comments: false,
    favorites: false,
  });

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'day', label: '按日' },
    { value: 'week', label: '按周' },
    { value: 'month', label: '按月' },
  ];

  const toggleLine = (key: string) => {
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatDate = (dateStr: string) => {
    if (timePeriod === 'day') {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
    if (timePeriod === 'week') {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}周`;
    }
    const [y, m] = dateStr.split('-');
    return `${y}/${m}`;
  };

  const formattedData = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <div className="bg-white rounded-lg shadow-card border border-slate-100 p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-slate-800">流量与互动趋势</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-md p-0.5">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setTimePeriod(p.value)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  timePeriod === p.value
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { key: 'views', label: '阅读量' },
          { key: 'likes', label: '点赞数' },
          { key: 'shares', label: '转发数' },
          { key: 'comments', label: '评论数' },
          { key: 'favorites', label: '收藏数' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => toggleLine(item.key)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
              activeLines[item.key]
                ? 'border-transparent bg-slate-50'
                : 'border-slate-200 bg-white opacity-50'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{
                backgroundColor: activeLines[item.key]
                  ? CHART_COLORS[item.key as keyof typeof CHART_COLORS]
                  : '#CBD5E1',
              }}
            />
            {item.label}
          </button>
        ))}
      </div>

      <div className="h-72">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm animate-pulse">
            加载中...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            暂无数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                {Object.keys(CHART_COLORS).map((key) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS[key as keyof typeof CHART_COLORS]}
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS[key as keyof typeof CHART_COLORS]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                width={50}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  {
                    views: '阅读量',
                    uniqueViews: '独立访客',
                    likes: '点赞数',
                    shares: '转发数',
                    comments: '评论数',
                    favorites: '收藏数',
                  }[name],
                ]}
              />
              {activeLines.views && (
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke={CHART_COLORS.views}
                  strokeWidth={2}
                  fill="url(#gradient-views)"
                />
              )}
              {activeLines.likes && (
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke={CHART_COLORS.likes}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activeLines.shares && (
                <Line
                  type="monotone"
                  dataKey="shares"
                  stroke={CHART_COLORS.shares}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activeLines.comments && (
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke={CHART_COLORS.comments}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {activeLines.favorites && (
                <Line
                  type="monotone"
                  dataKey="favorites"
                  stroke={CHART_COLORS.favorites}
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

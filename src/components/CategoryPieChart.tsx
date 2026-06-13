import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { CategoryStats } from '@shared/types';

const COLORS = ['#1E3A5F', '#2E66A1', '#4F85BF', '#7DA6D1', '#F59E0B', '#D97706', '#10B981'];

interface Props {
  data: CategoryStats[];
}

export default function CategoryPieChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.totalViews, 0);

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.totalViews,
    articleCount: d.articleCount,
    avgEngagementRate: d.avgEngagementRate,
    percent: total > 0 ? ((d.totalViews / total) * 100).toFixed(1) : '0',
  }));

  return (
    <div className="bg-white rounded-lg shadow-card border border-slate-100 p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <PieIcon className="w-4 h-4 text-primary-600" />
        <h3 className="font-semibold text-slate-800">分类流量占比</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 max-h-48 overflow-auto pr-1">
          {chartData.map((entry, index) => (
            <div
              key={entry.name}
              className={`flex items-center justify-between gap-3 py-1.5 px-2 rounded transition-all cursor-pointer ${
                activeIndex === index ? 'bg-slate-50' : ''
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-slate-600 truncate">{entry.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-slate-500">{entry.percent}%</span>
                <span className="text-xs font-mono font-medium text-slate-700 w-16 text-right">
                  {entry.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { CategoryStats } from '@shared/types';

interface Props {
  data: CategoryStats[];
}

export default function CategoryBarChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.category,
    阅读量: d.totalViews,
    点赞数: d.totalLikes,
    篇数: d.articleCount,
  }));

  return (
    <div className="bg-white rounded-lg shadow-card border border-slate-100 p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary-600" />
        <h3 className="font-semibold text-slate-800">分类数据对比</h3>
      </div>

      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            暂无数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                angle={-25}
                textAnchor="end"
                height={50}
                interval={0}
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
                formatter={(value: number) => value.toLocaleString()}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="阅读量" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="点赞数" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

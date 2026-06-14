import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { AggregatedStats } from '@shared/types';

const levelConfig = {
  excellent: { label: '优秀', color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  good: { label: '良好', color: '#3B82F6', bg: 'bg-blue-50', text: 'text-blue-600' },
  fair: { label: '一般', color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-600' },
  poor: { label: '待提升', color: '#EF4444', bg: 'bg-rose-50', text: 'text-rose-600' },
};

interface Props {
  stats: AggregatedStats;
}

export default function OverallScoreCard({ stats }: Props) {
  const level = levelConfig[stats.scoreLevel];
  const scorePercent = Math.min(stats.overallScore, 100);
  const scoreTrend = stats.trends?.overallScore;

  const data = [
    { name: '得分', value: scorePercent },
    { name: '剩余', value: 100 - scorePercent },
  ];
  const COLORS = [level.color, '#E2E8F0'];

  return (
    <div className="bg-white rounded-lg shadow-card border border-slate-100 p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-slate-800">整体运营表现</h3>
        </div>
        <div className="flex items-center gap-2">
          {scoreTrend !== undefined && scoreTrend !== null && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                scoreTrend === null
                  ? 'bg-slate-50 text-slate-500'
                  : scoreTrend >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {scoreTrend === null ? (
                <Minus className="w-3 h-3" />
              ) : scoreTrend >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  +
                </>
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {scoreTrend === null ? '—' : `${Math.abs(scoreTrend)}%`}
            </span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${level.bg} ${level.text}`}>
            {level.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                startAngle={180}
                endAngle={0}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span className="text-4xl font-mono font-bold text-slate-800">
              {stats.overallScore}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">综合评分</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>平均阅读完成率</span>
              <span className="font-mono font-medium text-slate-700">{stats.avgCompletionRate}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.avgCompletionRate, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>平均互动率</span>
              <span className="font-mono font-medium text-slate-700">{stats.avgEngagementRate}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.avgEngagementRate * 5, 100)}%` }}
              />
            </div>
          </div>
          <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>累计发文</span>
              <span className="font-mono font-semibold text-slate-700">{stats.totalArticles} 篇</span>
            </div>
            <div>
              粉丝引流
              <span className="font-mono font-semibold text-slate-700 ml-1">
                {stats.totalNewFollowers.toLocaleString()} 人
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

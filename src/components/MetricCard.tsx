import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  trend?: number;
  gradient: string;
  description?: string;
}

export default function MetricCard({
  title,
  value,
  suffix,
  icon: Icon,
  trend,
  gradient,
  description,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-card border border-slate-100 p-5 hover:shadow-card-hover transition-all duration-300 group animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold text-slate-800 tracking-tight">
              {value}
            </span>
            {suffix && <span className="text-sm text-slate-400 font-medium">{suffix}</span>}
          </div>
        </div>
        <div
          className={`w-11 h-11 rounded-md flex items-center justify-center ${gradient} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend >= 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
        {description && (
          <span className="text-xs text-slate-400">{description}</span>
        )}
      </div>
    </div>
  );
}

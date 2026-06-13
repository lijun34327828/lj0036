import { BarChart3, TrendingUp, Trophy, FileText, Home } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '数据概览', icon: Home },
  { path: '/trends', label: '流量趋势', icon: TrendingUp },
  { path: '/ranking', label: '内容排行', icon: Trophy },
];

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 bg-primary-600 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-primary-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-white/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-base">内容数据分析</h1>
              <p className="text-xs text-white/60">运营报表系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  active
                    ? 'bg-white/15 text-white shadow-inner'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-500/30">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center font-medium">
              运
            </div>
            <div>
              <p className="font-medium">运营管理员</p>
              <p className="text-xs text-white/50">admin@analytics</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileText className="w-4 h-4" />
            <span>内容运营数据报表 · 实时更新</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>数据更新时间：{new Date().toLocaleString('zh-CN')}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

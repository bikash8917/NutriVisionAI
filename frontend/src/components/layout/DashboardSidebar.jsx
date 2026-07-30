import { NavLink } from 'react-router-dom';
import { Activity, ScanLine, History, ChartColumnBig, UserRound, Settings, Goal, LayoutDashboard } from 'lucide-react';
import { dashboardLinks } from '../../constants/navigation';

const icons = {
  Dashboard: LayoutDashboard,
  Scanner: ScanLine,
  History,
  Analytics: ChartColumnBig,
  Goals: Goal,
  Profile: UserRound,
  Settings,
};

export default function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/95 px-4 py-6 lg:block">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold">NutriVisionAI</p>
          <p className="text-xs text-slate-500">Dashboard</p>
        </div>
      </div>
      <nav className="mt-8 space-y-1">
        {dashboardLinks.map((item) => {
          const Icon = icons[item.label];
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

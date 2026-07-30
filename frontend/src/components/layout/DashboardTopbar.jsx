import { Bell, LogOut, Search, SunMedium } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSearch = (event) => {
    event.preventDefault();
    const search = query.trim();
    navigate(search ? `/dashboard/history?q=${encodeURIComponent(search)}` : '/dashboard/history');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <form className="relative hidden max-w-md flex-1 md:block" onSubmit={handleSearch}>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search meals"
            placeholder="Search meals, history, analytics..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-400"
          />
        </form>

        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full border border-slate-200 bg-white p-3 text-slate-600">
            <SunMedium className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full border border-slate-200 bg-white p-3 text-slate-600">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
            <div className="flex h-9 w-9 overflow-hidden rounded-full bg-brand-600 text-sm font-semibold text-white">
              {user?.avatar || user?.profileImage ? (
                <img src={user.avatar || user.profileImage} alt={user?.name || user?.fullName || 'User'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {user?.name?.slice(0, 1) || user?.fullName?.slice(0, 1) || 'N'}
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-950">{user?.name || user?.fullName || 'User'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'Signed in'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}

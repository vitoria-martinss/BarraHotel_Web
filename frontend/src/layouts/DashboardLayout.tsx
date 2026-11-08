import { ReactNode, useState } from 'react';
import { useApp, type Page } from '../store';
import logo from './images/logo.png';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  page: Page;
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
  area: 'guest' | 'staff' | 'admin';
}

export default function DashboardLayout({ children, title, navItems, area }: DashboardLayoutProps) {
  const { navigate, currentUser, logout, page } = useApp();  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const areaColors: Record<string, { bg: string; accent: string; light: string }> = {
    guest: { bg: '#1B2B4B', accent: '#B8963E', light: '#2D4270' },
    staff: { bg: '#0D1520', accent: '#B8963E', light: '#1B2B4B' },
    admin: { bg: '#070E14', accent: '#B8963E', light: '#0E1825' },
  };
  const colors = areaColors[area];

  const userName = currentUser?.data.name ?? 'Usuário';
  const userInitials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="painel flex h-screen bg-[#F8F7F4] overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside
        className="=shrink-0 flex flex-col transition-all duration-200"
        style={{ width: sidebarOpen ? 240 : 64, background: colors.bg }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <img src={logo} alt="Barra Hotel" className="w-10 h-10 object-contain rounded-lg bg-white/5" /> 
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate" style={{ fontFamily: 'var(--font-display)' }}>Barra Hotel</p>
                <p className="text-xs truncate" style={{ color: colors.accent }}>{title}</p>
              </div>
            </div>
          ) : (
            <img src="/images/logo.png" alt="Barra Hotel" className="w-8 h-8 mx-auto rounded-lg object-contain bg-white/5" />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <div className="space-y-0.5 px-2">
            {navItems.map(item => {
              const isActive = page.id === item.page.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.page)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                  style={isActive ? { background: colors.accent } : {}}
                >
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center"></span>
                  {sidebarOpen && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {sidebarOpen && item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Collapse button */}
        <div className="px-2 py-3 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white/40 hover:text-white/70 transition-colors text-sm rounded-lg hover:bg-white/5"
          >
            {sidebarOpen ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                <span className="text-xs">Recolher</span>
              </>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>
              {navItems.find(n => n.page.id === page.id)?.label ?? 'Painel'}
            </h1>
          </div>

          <div className="flex items-center gap-3">

            {/* Profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: colors.accent }}>
                {userInitials}
              </div>
              {sidebarOpen && (
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-800 leading-none">{userName.split(' ').slice(0, 2).join(' ')}</p>
                  <p className="text-xs text-slate-400 mt-0.5 capitalize">{currentUser?.type}</p>
                </div>
              )}
              <button
                onClick={logout}
                title="Sair"
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

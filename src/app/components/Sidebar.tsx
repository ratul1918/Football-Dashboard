import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Gamepad2,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/teams', label: 'Players', icon: Users },
  { to: '/matches', label: 'Matches', icon: Calendar },
  { to: '/standings', label: 'Standings', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}
        style={{
          background: 'rgba(8, 14, 28, 0.97)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #3B82F6, #7c3aed)',
              boxShadow: '0 0 18px rgba(59,130,246,0.55)',
            }}
          >
            <Gamepad2 size={20} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', fontFamily: 'Lexend, sans-serif' }}>
                Elite Pitch
              </div>
              <div style={{ color: '#4ade80', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Elite Pitch Hub
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-lg transition-all hover:bg-white/10"
            style={{ color: '#6b7280' }}
          >
            <ChevronRight size={16} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {!collapsed && (
            <div style={{ color: '#4b5563', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
              Navigation
            </div>
          )}
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-xl transition-all duration-200 relative"
                style={{
                  padding: '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.22), rgba(124,58,237,0.12))'
                    : 'transparent',
                  color: isActive ? '#60a5fa' : '#9ca3af',
                  boxShadow: isActive ? '0 0 14px rgba(59,130,246,0.12)' : 'none',
                  border: isActive ? '1px solid rgba(59,130,246,0.28)' : '1px solid transparent',
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} />
                {!collapsed && (
                  <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, fontFamily: 'Lexend, sans-serif' }}>
                    {label}
                  </span>
                )}
                {isActive && !collapsed && (
                  <div style={{
                    width: 3, height: 16, borderRadius: 4,
                    background: '#3B82F6', boxShadow: '0 0 8px #3B82F6',
                    marginLeft: 'auto',
                  }} />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Tournament Badge */}
        {!collapsed && (
          <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ color: '#4b5563', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ⚽ Tournament
              </div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginTop: 3, fontFamily: 'Lexend, sans-serif' }}>
                Elite Cup 2026
              </div>
              <div style={{ color: '#4ade80', fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                ● Round 15 — Live
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
        style={{
          background: 'rgba(6,10,20,0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '8px 0 12px',
        }}
      >
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1"
              style={{ color: isActive ? '#3B82F6' : '#6b7280', minWidth: 48 }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, fontFamily: 'Lexend, sans-serif' }}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
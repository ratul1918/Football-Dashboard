import { Bell, Search, ChevronDown, Zap } from 'lucide-react';
import { useState } from 'react';
import { useLeague } from '../context/LeagueContext';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const { teams, matches } = useLeague();

  const recentCompleted = matches.filter(m => m.status === 'completed').slice(0, 3);

  const notifications = recentCompleted.map(m => {
    const home = teams.find(t => t.id === m.homeTeamId);
    const away = teams.find(t => t.id === m.awayTeamId);
    return `${home?.name} ${m.homeScore} - ${m.awayScore} ${away?.name}`;
  });

  const searchResults = query.length > 1
    ? teams.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.realName.includes(query) ||
        t.shortName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 px-6 py-4"
      style={{
        background: 'rgba(6,10,20,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Title */}
      <div className="flex-1">
        <h1 style={{ color: '#fff', fontFamily: 'Lexend, sans-serif', fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 400, marginTop: 2 }}>{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <div
          className="flex items-center gap-2 rounded-xl cursor-pointer transition-all"
          style={{
            background: searchOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 14px',
            minWidth: searchOpen ? 240 : 'auto',
          }}
          onClick={() => setSearchOpen(true)}
        >
          <Search size={15} color="#6b7280" />
          {searchOpen ? (
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onBlur={() => { setTimeout(() => { setSearchOpen(false); setQuery(''); }, 200); }}
              placeholder="Search players or IDs..."
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 13, width: '100%', fontFamily: 'Lexend, sans-serif',
              }}
            />
          ) : (
            <span style={{ color: '#6b7280', fontSize: 13, fontFamily: 'Lexend, sans-serif' }}>Search players…</span>
          )}
        </div>
        {searchResults.length > 0 && (
          <div
            className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-50"
            style={{ background: 'rgba(10,16,36,0.99)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', minWidth: 280 }}
          >
            {searchResults.map(team => (
              <div key={team.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-all">
                <span style={{ fontSize: 20 }}>{team.badge}</span>
                <div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>
                    {team.name}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 11 }}>{team.realName}</div>
                </div>
                <span style={{
                  marginLeft: 'auto', color: '#3B82F6', fontSize: 10, fontWeight: 700,
                  background: 'rgba(59,130,246,0.12)', borderRadius: 6, padding: '2px 7px',
                }}>
                  {team.shortName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative flex items-center justify-center rounded-xl transition-all"
          style={{
            width: 40, height: 40,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >
          <Bell size={16} color="#9ca3af" />
          <span className="absolute top-2 right-2 rounded-full" style={{ width: 6, height: 6, background: '#3B82F6', boxShadow: '0 0 6px #3B82F6' }} />
        </button>
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div
              className="absolute top-full right-0 mt-2 rounded-xl overflow-hidden z-50"
              style={{ width: 320, background: 'rgba(10,16,36,0.99)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>
                  ⚽ Tournament Alerts
                </div>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-all">
                  <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: 32, height: 32, background: 'rgba(59,130,246,0.15)', marginTop: 1 }}>
                    <Zap size={14} color="#3B82F6" />
                  </div>
                  <div>
                    <div style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 500 }}>Match Result</div>
                    <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2, fontFamily: 'Lexend, sans-serif' }}>{n}</div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="px-4 py-6 text-center" style={{ color: '#6b7280', fontSize: 13 }}>No alerts yet</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Admin Profile */}
      <div
        className="flex items-center gap-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 px-3 py-2"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3B82F6, #7c3aed)', color: '#fff', fontSize: 12, fontWeight: 700 }}
        >
          BD
        </div>
        <div className="hidden sm:block">
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>Admin</div>
          <div style={{ color: '#22C55E', fontSize: 11, fontWeight: 500 }}>● Online</div>
        </div>
        <ChevronDown size={14} color="#6b7280" />
      </div>
    </header>
  );
}
import { Header } from '../components/Header';
import { useLeague } from '../context/LeagueContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, BarChart2, Target, Zap, ChevronRight, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';

function FormBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors = { W: '#22C55E', D: '#EAB308', L: '#EF4444' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: 4,
      background: `${colors[result]}20`, border: `1px solid ${colors[result]}40`,
      color: colors[result], fontSize: 10, fontWeight: 700,
    }}>{result}</span>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(10,16,36,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(20px)' }}>
        <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 4, fontFamily: 'Lexend, sans-serif' }}>{payload[0]?.payload?.fullName}</div>
        <div style={{ color: '#3B82F6', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{payload[0]?.value} PTS</div>
      </div>
    );
  }
  return null;
};

const GRAD_COLORS = ['#3B82F6', '#22C55E', '#8b5cf6', '#f59e0b', '#ef4444'];

export function Dashboard() {
  const { teams, matches, standings } = useLeague();
  const navigate = useNavigate();
  const top5 = standings.slice(0, 5);

  const totalGoals = standings.reduce((a, t) => a + t.gf, 0);
  const totalMatchesDone = matches.filter(m => m.status === 'completed').length;
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  const chartData = top5.map(t => ({ name: t.shortName, fullName: t.name, pts: t.pts }));

  const kpis = [
    { label: 'Total Players', value: teams.length, icon: Users, color: '#3B82F6', sub: 'In tournament' },
    { label: 'Matches Played', value: totalMatchesDone, icon: BarChart2, color: '#22C55E', sub: `${upcomingMatches.length} remaining` },
    { label: 'Total Goals', value: totalGoals, icon: Target, color: '#f59e0b', sub: `${(totalGoals / Math.max(totalMatchesDone, 1)).toFixed(1)} per match` },
    { label: 'Live Now', value: liveMatches.length, icon: Zap, color: '#ef4444', sub: `${upcomingMatches.length} upcoming` },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="Football Tournament — Live Overview" />
      <div className="flex-1 p-6 flex flex-col gap-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(kpi => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-2xl p-5 relative overflow-hidden transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${kpi.color}12`, filter: 'blur(20px)' }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}>
                    <Icon size={19} color={kpi.color} />
                  </div>
                  {kpi.label === 'Live Now' && liveMatches.length > 0 && (
                    <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 700, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 5, height: 5, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
                      LIVE
                    </span>
                  )}
                  {kpi.label === 'Matches Played' && <TrendingUp size={14} color="#22C55E" />}
                </div>
                <div style={{ color: '#fff', fontSize: 28, fontWeight: 700, fontFamily: 'Lexend, sans-serif', lineHeight: 1 }}>{kpi.value}</div>
                <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 500, marginTop: 4 }}>{kpi.label}</div>
                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>Top 5 Players by Points</div>
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>⚽ Elite Football Tournament</div>
              </div>
              <button onClick={() => navigate('/standings')} className="flex items-center gap-1 rounded-lg px-3 py-2 transition-all" style={{ color: '#3B82F6', fontSize: 12, fontWeight: 500, border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer', background: 'transparent' }}>
                Full Table <ChevronRight size={13} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={38} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Lexend, sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Lexend, sans-serif' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="pts" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${entry.name}`} fill={GRAD_COLORS[i % GRAD_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {top5.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: GRAD_COLORS[i] }} />
                  <span style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'Lexend, sans-serif' }}>{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Match Feed */}
          <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center justify-between">
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>Match Feed</div>
              <button onClick={() => navigate('/matches')} className="flex items-center gap-1 rounded-lg px-3 py-2 transition-all" style={{ color: '#3B82F6', fontSize: 12, fontWeight: 500, border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer', background: 'transparent' }}>
                All <ChevronRight size={13} />
              </button>
            </div>

            {liveMatches.map(m => {
              const home = teams.find(t => t.id === m.homeTeamId);
              const away = teams.find(t => t.id === m.awayTeamId);
              return (
                <div key={m.id} className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.28)', boxShadow: '0 0 20px rgba(239,68,68,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 5, height: 5, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
                      LIVE — {m.minute}'
                    </span>
                    <span style={{ color: '#6b7280', fontSize: 10 }}>⚽ Tournament</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div style={{ fontSize: 24 }}>{home?.badge}</div>
                      <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, marginTop: 2, fontFamily: 'Lexend, sans-serif' }}>{home?.shortName}</div>
                      <div style={{ color: '#6b7280', fontSize: 9, marginTop: 1 }}>{home?.realName}</div>
                    </div>
                    <div className="flex items-center gap-1 rounded-xl px-4 py-2 mx-2" style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <span style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: 'Lexend, sans-serif' }}>{m.homeScore}</span>
                      <span style={{ color: '#ef4444', fontSize: 16, margin: '0 4px' }}>:</span>
                      <span style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: 'Lexend, sans-serif' }}>{m.awayScore}</span>
                    </div>
                    <div className="text-center flex-1">
                      <div style={{ fontSize: 24 }}>{away?.badge}</div>
                      <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, marginTop: 2, fontFamily: 'Lexend, sans-serif' }}>{away?.shortName}</div>
                      <div style={{ color: '#6b7280', fontSize: 9, marginTop: 1 }}>{away?.realName}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {upcomingMatches.slice(0, 5).map(m => {
              const home = teams.find(t => t.id === m.homeTeamId);
              const away = teams.find(t => t.id === m.awayTeamId);
              return (
                <div key={m.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Clock size={13} color="#6b7280" style={{ flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 500, fontFamily: 'Lexend, sans-serif' }}>
                      {home?.badge} {home?.shortName} <span style={{ color: '#4b5563' }}>vs</span> {away?.shortName} {away?.badge}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 11, marginTop: 1 }}>{m.date}</div>
                  </div>
                  <span style={{ color: '#3B82F6', fontSize: 10, fontWeight: 600, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini Standings Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between p-5 pb-4 flex-wrap gap-3">
            <div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>🏆 Tournament Standings</div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Top 8 · Auto-updates on every result change</div>
            </div>
            <button onClick={() => navigate('/standings')} className="flex items-center gap-1 rounded-lg px-3 py-2" style={{ color: '#3B82F6', fontSize: 12, fontWeight: 500, border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer', background: 'transparent' }}>
              Full Table <ChevronRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {['#', 'Player', 'MP', 'W', 'D', 'L', 'GD', 'PTS', 'Form'].map(h => (
                    <th key={h} style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '10px 16px', textAlign: h === 'Player' ? 'left' : 'center', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.slice(0, 8).map(team => {
                  const zone = team.rank <= 4 ? 'top4' : team.rank <= 6 ? 'playoff' : 'normal';
                  const zoneColor = zone === 'top4' ? '#22C55E' : zone === 'playoff' ? '#EAB308' : 'rgba(255,255,255,0.1)';
                  return (
                    <tr key={team.id} className="transition-all hover:bg-white/4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div className="flex items-center justify-center gap-2">
                          <div style={{ width: 3, height: 20, borderRadius: 4, background: zoneColor, boxShadow: zone !== 'normal' ? `0 0 6px ${zoneColor}` : 'none', flexShrink: 0 }} />
                          <span style={{ color: zone === 'top4' ? '#22C55E' : zone === 'playoff' ? '#EAB308' : '#9ca3af', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{team.rank}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: 20 }}>{team.badge}</span>
                          <div>
                            <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{team.name}</div>
                            <div style={{ color: '#6b7280', fontSize: 11 }}>{team.realName}</div>
                          </div>
                        </div>
                      </td>
                      {[team.mp, team.w, team.d, team.l].map((v, j) => (
                        <td key={j} style={{ padding: '12px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13, fontFamily: 'Lexend, sans-serif' }}>{v}</td>
                      ))}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ color: team.gd > 0 ? '#22C55E' : team.gd < 0 ? '#ef4444' : '#9ca3af', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
                          {team.gd > 0 ? `+${team.gd}` : team.gd}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Lexend, sans-serif', background: team.rank === 1 ? 'rgba(59,130,246,0.22)' : 'rgba(255,255,255,0.07)', border: team.rank === 1 ? '1px solid rgba(59,130,246,0.45)' : '1px solid transparent', borderRadius: 6, padding: '2px 10px', boxShadow: team.rank === 1 ? '0 0 10px rgba(59,130,246,0.3)' : 'none' }}>
                          {team.pts}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-1">
                          {team.form.length > 0
                            ? team.form.slice(0, 5).map((f, fi) => <FormBadge key={fi} result={f} />)
                            : <span style={{ color: '#4b5563', fontSize: 10 }}>—</span>
                          }
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-6 px-5 py-3 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
            {[
              { color: '#22C55E', label: 'Knockout Top 4' },
              { color: '#EAB308', label: 'Playoff Zone (5–6)' },
              { color: 'rgba(255,255,255,0.15)', label: 'Group Stage' },
            ].map(z => (
              <div key={z.label} className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: z.color }} />
                <span style={{ color: '#6b7280', fontSize: 11 }}>{z.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { Header } from '../components/Header';
import { useLeague } from '../context/LeagueContext';
import { TeamWithStats } from '../data/leagueData';
import { useState } from 'react';
import { ChevronUp, ChevronDown, Trophy, TrendingUp, Gamepad2 } from 'lucide-react';

type SortKey = 'rank' | 'mp' | 'w' | 'd' | 'l' | 'gf' | 'ga' | 'gd' | 'pts';

function FormBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors = { W: '#22C55E', D: '#EAB308', L: '#EF4444' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 4, background: `${colors[result]}18`, border: `1px solid ${colors[result]}35`, color: colors[result], fontSize: 9, fontWeight: 700 }}>
      {result}
    </span>
  );
}

export function Standings() {
  const { standings, matches } = useLeague();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'rank' ? 'asc' : 'desc'); }
  }

  const sorted = [...standings].sort((a, b) => {
    const av: number = (a as any)[sortKey] ?? a.rank;
    const bv: number = (b as any)[sortKey] ?? b.rank;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={11} style={{ opacity: 0.25 }} />;
    return sortDir === 'asc' ? <ChevronUp size={11} color="#3B82F6" /> : <ChevronDown size={11} color="#3B82F6" />;
  };

  const cols: { key: SortKey; label: string; highlight?: boolean }[] = [
    { key: 'mp', label: 'MP' }, { key: 'w', label: 'W' }, { key: 'd', label: 'D' }, { key: 'l', label: 'L' },
    { key: 'gf', label: 'GF' }, { key: 'ga', label: 'GA' },
    { key: 'gd', label: 'GD', highlight: true }, { key: 'pts', label: 'PTS', highlight: true },
  ];

  const leader = standings[0];
  const totalGoals = standings.reduce((a, t) => a + t.gf, 0);
  const totalMatchesDone = matches.filter(m => m.status === 'completed').length;
  const bestGD = standings.reduce((best, t) => t.gd > best.gd ? t : best, standings[0] ?? { gd: 0, name: '—' } as TeamWithStats);

  return (
    <div className="flex flex-col h-full">
      <Header title="Standings" subtitle="Football Tournament — Full Table · Auto-updates in real time" />
      <div className="flex-1 p-6 flex flex-col gap-6">

        {/* Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tournament Leader', value: leader?.name ?? '—', sub: `${leader?.pts ?? 0} pts · ${leader?.realName ?? ''}`, color: '#f59e0b', icon: <Trophy size={16} color="#f59e0b" /> },
            { label: 'Most Goals', value: standings[0]?.gf ?? 0, sub: standings[0]?.name ?? '', color: '#22C55E', icon: <TrendingUp size={16} color="#22C55E" /> },
            { label: 'Best GD', value: bestGD?.gd != null ? (bestGD.gd > 0 ? `+${bestGD.gd}` : `${bestGD.gd}`) : '—', sub: bestGD?.name ?? '', color: '#3B82F6', icon: <ChevronUp size={16} color="#3B82F6" /> },
            { label: 'Total Goals', value: totalGoals, sub: `${(totalGoals / Math.max(totalMatchesDone, 1)).toFixed(1)} avg/match`, color: '#8b5cf6', icon: <Gamepad2 size={16} color="#8b5cf6" /> },
          ].map(card => (
            <div key={card.label} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
              <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 40, height: 40, background: `${card.color}15`, border: `1px solid ${card.color}25` }}>{card.icon}</div>
              <div className="min-w-0">
                <div style={{ color: '#6b7280', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{card.label}</div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: 'Lexend, sans-serif', lineHeight: 1.2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.value}</div>
                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div className="p-5 pb-0 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>⚽ Elite Football Tournament</div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 1 }}>Click column headers to sort · Stats auto-computed from all match results</div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { color: '#22C55E', label: 'Knockout (1–4)' },
                { color: '#EAB308', label: 'Playoff (5–6)' },
                { color: '#ef4444', label: 'Eliminated (14–16)' },
              ].map(z => (
                <div key={z.label} className="flex items-center gap-2">
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: z.color, boxShadow: `0 0 6px ${z.color}` }} />
                  <span style={{ color: '#9ca3af', fontSize: 11 }}>{z.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th onClick={() => handleSort('rank')} className="cursor-pointer hover:bg-white/4 transition-all select-none" style={{ padding: '12px 16px', textAlign: 'left', minWidth: 200 }}>
                    <div className="flex items-center gap-1">
                      <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Player</span>
                      <SortIcon col="rank" />
                    </div>
                  </th>
                  {cols.map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} className="cursor-pointer hover:bg-white/4 transition-all select-none" style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div className="flex items-center justify-center gap-1">
                        <span style={{ color: col.highlight && sortKey === col.key ? '#3B82F6' : col.highlight ? '#a78bfa' : '#6b7280', fontSize: 11, fontWeight: col.highlight ? 700 : 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{col.label}</span>
                        <SortIcon col={col.key} />
                      </div>
                    </th>
                  ))}
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                    <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Form</span>
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Stage</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((team, idx) => {
                  const zone = team.rank <= 4 ? 'knockout' : team.rank <= 6 ? 'playoff' : team.rank >= 14 ? 'eliminated' : 'normal';
                  const zoneColor = zone === 'knockout' ? '#22C55E' : zone === 'playoff' ? '#EAB308' : zone === 'eliminated' ? '#EF4444' : 'transparent';
                  const isHovered = hoveredRow === team.id;
                  return (
                    <tr key={team.id} onMouseEnter={() => setHoveredRow(team.id)} onMouseLeave={() => setHoveredRow(null)} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: isHovered ? 'rgba(255,255,255,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: 3, height: 24, borderRadius: 4, background: zoneColor, boxShadow: zone !== 'normal' ? `0 0 6px ${zoneColor}` : 'none', flexShrink: 0 }} />
                          <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700, fontFamily: 'Lexend, sans-serif', minWidth: 20, textAlign: 'right' }}>{team.rank}</span>
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{team.badge}</span>
                          <div>
                            <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{team.name}</div>
                            <div style={{ color: team.color, fontSize: 11, marginTop: 1, fontWeight: 500 }}>{team.realName}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 13, fontFamily: 'Lexend, sans-serif' }}>{team.mp}</td>
                      <td style={{ padding: '13px 14px', textAlign: 'center', color: '#22C55E', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{team.w}</td>
                      <td style={{ padding: '13px 14px', textAlign: 'center', color: '#EAB308', fontSize: 13, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>{team.d}</td>
                      <td style={{ padding: '13px 14px', textAlign: 'center', color: '#EF4444', fontSize: 13, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>{team.l}</td>
                      <td style={{ padding: '13px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 13, fontFamily: 'Lexend, sans-serif' }}>{team.gf}</td>
                      <td style={{ padding: '13px 14px', textAlign: 'center', color: '#9ca3af', fontSize: 13, fontFamily: 'Lexend, sans-serif' }}>{team.ga}</td>
                      <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                        <span style={{ color: team.gd > 0 ? '#22C55E' : team.gd < 0 ? '#ef4444' : '#9ca3af', fontSize: 13, fontWeight: 800, fontFamily: 'Lexend, sans-serif', background: team.gd > 0 ? 'rgba(34,197,94,0.09)' : team.gd < 0 ? 'rgba(239,68,68,0.09)' : 'transparent', padding: '2px 7px', borderRadius: 5 }}>
                          {team.gd > 0 ? `+${team.gd}` : team.gd}
                        </span>
                      </td>
                      <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Lexend, sans-serif', background: team.rank <= 3 ? 'linear-gradient(135deg, rgba(59,130,246,0.28), rgba(124,58,237,0.15))' : 'rgba(255,255,255,0.07)', border: team.rank <= 3 ? '1px solid rgba(59,130,246,0.38)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', boxShadow: team.rank === 1 ? '0 0 14px rgba(59,130,246,0.35)' : 'none' }}>
                          {team.pts}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div className="flex items-center gap-1">
                          {team.form.length > 0
                            ? team.form.map((f, fi) => <FormBadge key={fi} result={f} />)
                            : <span style={{ color: '#4b5563', fontSize: 10 }}>—</span>
                          }
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        {zone !== 'normal' && (
                          <span style={{ color: zoneColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: `${zoneColor}12`, border: `1px solid ${zoneColor}30`, borderRadius: 20, padding: '3px 8px', whiteSpace: 'nowrap' }}>
                            {zone === 'knockout' ? '✦ Knockout' : zone === 'playoff' ? '↕ Playoff' : '✕ Elim.'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ color: '#4b5563', fontSize: 11 }}>⚽ Elite Football Tournament · Round-Robin · {standings.length} Players</div>
            <div style={{ color: '#4b5563', fontSize: 11 }}>Sorted by: PTS → GD → GF</div>
          </div>
        </div>
      </div>
    </div>
  );
}
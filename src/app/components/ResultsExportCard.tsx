import React from 'react';
import type { TeamWithStats, Match, Team } from '../data/leagueData';
import type { TournamentRules } from '../context/TournamentRulesContext';

interface Props {
  standings: TeamWithStats[];
  matches: Match[];
  teams: Team[];
  rules: TournamentRules;
}

const C = {
  bg:        '#070c18',
  surface:   '#0d1526',
  border:    '#1a2540',
  borderSub: '#111b30',
  text:      '#e5e7eb',
  muted:     '#6b7280',
  faint:     '#374151',
  blue:      '#3B82F6',
  green:     '#22C55E',
  gold:      '#f59e0b',
  red:       '#ef4444',
  purple:    '#8b5cf6',
};

function fmt(n: number, plus = false) {
  if (plus && n > 0) return `+${n}`;
  return String(n);
}
function fmtDate(s: string) {
  try {
    return new Date(s + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return s; }
}

export const ResultsExportCard = React.forwardRef<HTMLDivElement, Props>(
  ({ standings, matches, teams, rules }, ref) => {

    const completed = [...matches]
      .filter(m => m.status === 'completed')
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalGoals = completed.reduce((s, m) => s + m.homeScore + m.awayScore, 0);

    // Group by date → label as Matchday 1, 2, …
    const dateOrder: string[] = [];
    const byDate = new Map<string, Match[]>();
    completed.forEach(m => {
      if (!byDate.has(m.date)) { byDate.set(m.date, []); dateOrder.push(m.date); }
      byDate.get(m.date)!.push(m);
    });

    const getTeam = (id: string) => teams.find(t => t.id === id);
    const generated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const zoneColor = (rank: number) => {
      if (rank === 1) return C.gold;
      if (rank <= rules.zones.knockout) return C.blue;
      if (rank <= rules.zones.knockout + rules.zones.playoff) return C.green;
      const bottom = standings.length - rules.zones.relegation + 1;
      if (rank >= bottom && rules.zones.relegation > 0) return C.red;
      return C.muted;
    };

    const px = (n: number) => `${n}px`;

    return (
      <div ref={ref} style={{
        width: 900, background: C.bg, fontFamily: 'Lexend, Inter, sans-serif',
        padding: 0, overflow: 'hidden', position: 'relative',
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ padding: '32px 40px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#3B82F6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚽</div>
              <div>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>ELITE PITCH</div>
                <div style={{ color: C.blue, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', marginTop: 3 }}>TOURNAMENT MANAGEMENT</div>
              </div>
            </div>
            <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{rules.tournamentName}</div>
            <div style={{ color: C.muted, fontSize: 14 }}>Season {rules.season}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: C.muted, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Official Report</div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{generated}</div>
            <div style={{ marginTop: 12, display: 'inline-block', fontSize: 11, fontWeight: 700, color: C.blue, background: 'rgba(59,130,246,0.12)', border: `1px solid rgba(59,130,246,0.3)`, borderRadius: 8, padding: '4px 12px' }}>
              {standings.length === 0 ? 'Pre-Season' : completed.length > 0 ? 'In Progress' : 'Scheduled'}
            </div>
          </div>
        </div>

        {/* ── Overview Stats ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: C.border, borderBottom: `1px solid ${C.border}` }}>
          {[
            { icon: '👥', label: 'Players', value: teams.length },
            { icon: '⚽', label: 'Matches Played', value: completed.length },
            { icon: '🎯', label: 'Total Goals', value: totalGoals },
            { icon: '📅', label: 'Matchdays', value: dateOrder.length },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: C.surface, padding: '20px 24px' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Standings ───────────────────────────────────────────── */}
        <div style={{ padding: '32px 40px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.blue }} />
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>FINAL STANDINGS</div>
          </div>

          {standings.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 14, padding: '32px 0' }}>No players registered yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.borderSub }}>
                  {['#', 'Player', 'MP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 12px', fontSize: 10, fontWeight: 800, color: C.muted,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      textAlign: i <= 1 ? 'left' : 'center',
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((t, i) => {
                  const zc = zoneColor(t.rank);
                  const isChamp = t.rank === 1;
                  return (
                    <tr key={t.id} style={{ background: i % 2 === 0 ? C.bg : C.surface }}>
                      <td style={{ padding: '11px 12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 3, height: 18, borderRadius: 2, background: zc, flexShrink: 0 }} />
                          <span style={{ color: zc, fontSize: 13, fontWeight: 800 }}>{t.rank}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{t.badge}</span>
                          <div>
                            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                            <div style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{t.realName}</div>
                          </div>
                          {isChamp && (
                            <div style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, color: C.gold, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '2px 7px' }}>LEADER</div>
                          )}
                        </div>
                      </td>
                      {[t.mp, t.w, t.d, t.l, t.gf, t.ga].map((v, j) => (
                        <td key={j} style={{ padding: '11px 12px', textAlign: 'center', color: C.muted, fontSize: 13 }}>{v}</td>
                      ))}
                      <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                        <span style={{ color: t.gd > 0 ? C.green : t.gd < 0 ? C.red : C.muted, fontSize: 13, fontWeight: 700 }}>
                          {fmt(t.gd, true)}
                        </span>
                      </td>
                      <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', color: '#fff', fontSize: 14, fontWeight: 900,
                          background: isChamp ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.07)',
                          border: isChamp ? `1px solid rgba(59,130,246,0.4)` : '1px solid transparent',
                          borderRadius: 6, padding: '3px 10px',
                          boxShadow: isChamp ? '0 0 10px rgba(59,130,246,0.25)' : 'none',
                        }}>{t.pts}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Zone legend */}
          {standings.length > 0 && (
            <div style={{ display: 'flex', gap: 20, padding: '14px 0', borderTop: `1px solid ${C.border}`, marginTop: 0, flexWrap: 'wrap' }}>
              {[
                { color: C.gold,   label: '🥇 Champion' },
                { color: C.blue,   label: `🔵 Knockout (Top ${rules.zones.knockout})` },
                { color: C.green,  label: `🟢 Playoff (+${rules.zones.playoff})` },
                { color: C.red,    label: `🔴 Relegation (Bottom ${rules.zones.relegation})` },
              ].filter(z => {
                if (z.color === C.red && rules.zones.relegation === 0) return false;
                if (z.color === C.green && rules.zones.playoff === 0) return false;
                return true;
              }).map(z => (
                <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: z.color }} />
                  <span style={{ color: C.muted, fontSize: 11 }}>{z.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Match Results ────────────────────────────────────────── */}
        <div style={{ padding: '28px 40px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.green }} />
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>MATCH RESULTS</div>
            <div style={{ marginLeft: 6, color: C.muted, fontSize: 12 }}>({completed.length} completed)</div>
          </div>

          {completed.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 14, padding: '32px 0' }}>No results to display yet</div>
          ) : (
            dateOrder.map((date, di) => {
              const dayMatches = byDate.get(date)!;
              return (
                <div key={date} style={{ marginBottom: 20 }}>
                  {/* Matchday header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.blue, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 6, padding: '3px 10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Matchday {di + 1}
                    </div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{fmtDate(date)}</div>
                    <div style={{ flex: 1, height: 1, background: C.borderSub }} />
                    <div style={{ color: C.faint, fontSize: 11 }}>{dayMatches.length} match{dayMatches.length !== 1 ? 'es' : ''}</div>
                  </div>

                  {/* Matches grid — 2 columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {dayMatches.map(m => {
                      const home = getTeam(m.homeTeamId);
                      const away = getTeam(m.awayTeamId);
                      const hw = m.homeScore > m.awayScore;
                      const aw = m.awayScore > m.homeScore;
                      return (
                        <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          {/* Home */}
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ color: hw ? '#fff' : C.muted, fontSize: 12, fontWeight: hw ? 700 : 400 }}>{home?.name ?? '?'}</div>
                              <div style={{ color: C.faint, fontSize: 10 }}>{home?.realName ?? ''}</div>
                            </div>
                            <span style={{ fontSize: 18 }}>{home?.badge ?? '⚽'}</span>
                          </div>
                          {/* Score */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px' }}>
                            <span style={{ color: hw ? '#fff' : C.muted, fontSize: 16, fontWeight: 900, minWidth: 14, textAlign: 'center' }}>{m.homeScore}</span>
                            <span style={{ color: C.faint, fontSize: 13 }}>–</span>
                            <span style={{ color: aw ? '#fff' : C.muted, fontSize: 16, fontWeight: 900, minWidth: 14, textAlign: 'center' }}>{m.awayScore}</span>
                          </div>
                          {/* Away */}
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{away?.badge ?? '⚽'}</span>
                            <div>
                              <div style={{ color: aw ? '#fff' : C.muted, fontSize: 12, fontWeight: aw ? 700 : 400 }}>{away?.name ?? '?'}</div>
                              <div style={{ color: C.faint, fontSize: 10 }}>{away?.realName ?? ''}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Tournament Format Summary ────────────────────────────── */}
        <div style={{ margin: '28px 40px 0', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 24px' }}>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Tournament Format</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px 24px' }}>
            {[
              ['Format', rules.format.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
              ['Legs', rules.legs === 2 ? '2 (Home & Away)' : '1'],
              ['Points', `Win=${rules.points.win} · Draw=${rules.points.draw} · Loss=${rules.points.loss}`],
              ['Max Players', String(rules.maxPlayers)],
              ['Tiebreaker', rules.tiebreakers.slice(0, 3).map(t => t.toUpperCase()).join(' → ')],
              ['Zones', `Top ${rules.zones.knockout} advance`],
            ].map(([label, value]) => (
              <div key={label}>
                <span style={{ color: C.faint, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}: </span>
                <span style={{ color: C.text, fontSize: 11 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div style={{ padding: '20px 40px 28px', marginTop: 28, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#3B82F6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚽</div>
            <div>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Elite Pitch</div>
              <div style={{ color: C.muted, fontSize: 10 }}>Tournament Management System</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', color: C.faint, fontSize: 11 }}>
            <div>Generated on {generated}</div>
            <div style={{ marginTop: 2 }}>{rules.tournamentName} · {rules.season}</div>
          </div>
        </div>
      </div>
    );
  }
);
ResultsExportCard.displayName = 'ResultsExportCard';

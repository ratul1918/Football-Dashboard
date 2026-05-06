import { Header } from '../components/Header';
import { useLeague } from '../context/LeagueContext';
import { EditMatchModal } from '../components/EditMatchModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Match } from '../data/leagueData';
import { useState, CSSProperties, FormEvent } from 'react';
import { Plus, CheckCircle, Clock, Zap, ChevronDown, Gamepad2, Pencil, Trash2, ShieldCheck } from 'lucide-react';

type ActiveModal = { type: 'edit'; match: Match } | { type: 'delete'; match: Match };

function FormBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors = { W: '#22C55E', D: '#EAB308', L: '#EF4444' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 4, background: `${colors[result]}18`, border: `1px solid ${colors[result]}35`, color: colors[result], fontSize: 9, fontWeight: 700 }}>{result}</span>
  );
}

export function Matches() {
  const { teams, matches, addMatchResult, deleteMatch } = useLeague();
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming' | 'live'>('all');
  const [modal, setModal] = useState<ActiveModal | null>(null);

  const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!homeTeamId || !awayTeamId) { setError('Please select both players.'); return; }
    if (homeTeamId === awayTeamId) { setError('Home and away players must be different.'); return; }
    if (homeScore === '' || awayScore === '') { setError('Please enter both scores.'); return; }
    const hs = parseInt(homeScore), as_ = parseInt(awayScore);
    if (isNaN(hs) || isNaN(as_) || hs < 0 || as_ < 0) { setError('Scores must be valid numbers (0 or above).'); return; }
    setSaving(true);
    try {
      await addMatchResult(homeTeamId, awayTeamId, hs, as_, date);
      setHomeTeamId(''); setAwayTeamId(''); setHomeScore(''); setAwayScore('');
      setDate(new Date().toISOString().split('T')[0]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(`Failed to save match: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const selectStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
    color: '#fff', padding: '12px 16px', fontSize: 13, fontFamily: 'Lexend, sans-serif',
    outline: 'none', width: '100%', appearance: 'none', cursor: 'pointer',
  };
  const inputStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
    color: '#fff', padding: '12px', fontSize: 24, fontFamily: 'Lexend, sans-serif', fontWeight: 800,
    outline: 'none', width: '100%', textAlign: 'center',
  };

  const homePlayer = teams.find(t => t.id === homeTeamId);
  const awayPlayer = teams.find(t => t.id === awayTeamId);

  return (
    <div className="flex flex-col h-full">
      <Header title="Matches" subtitle="Enter results, edit scores & manage fixtures — auto-recalculates standings" />
      <div className="flex-1 p-6 flex flex-col gap-6">

        {/* Admin badge */}
        <div className="flex items-center gap-2 rounded-xl px-4 py-2 w-fit" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <ShieldCheck size={14} color="#3B82F6" />
          <span style={{ color: '#3B82F6', fontSize: 12, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>
            Admin Mode · Hover any match to edit or delete
          </span>
        </div>

        {/* ── Submit Form ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <Gamepad2 size={19} color="#3B82F6" />
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>Submit Match Result</h2>
              <p style={{ color: '#6b7280', fontSize: 12, marginTop: 1 }}>Standings auto-update on submission · ⚽ Football Tournament</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
              {[
                { label: 'Player 1 (Home)', value: homeTeamId, set: setHomeTeamId },
                { label: 'Player 2 (Away)', value: awayTeamId, set: setAwayTeamId },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{f.label}</label>
                  <div className="relative">
                    <select value={f.value} onChange={e => f.set(e.target.value)} style={selectStyle}>
                      <option value="" style={{ background: '#0d1428' }}>Select player…</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id} style={{ background: '#0d1428' }}>
                          {t.badge} {t.name} ({t.realName})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} color="#6b7280" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Score Preview */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center">
                  {homePlayer ? (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 6 }}>{homePlayer.badge}</div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{homePlayer.name}</div>
                      <div style={{ color: homePlayer.color, fontSize: 11, marginTop: 2 }}>{homePlayer.realName}</div>
                      <div style={{ color: '#4b5563', fontSize: 10, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>HOME</div>
                    </>
                  ) : (
                    <div style={{ color: '#374151', fontSize: 13 }}>Home Player</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" min="0" max="20" value={homeScore} onChange={e => setHomeScore(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 76 }} />
                  <div style={{ color: '#1f2937', fontSize: 22 }}>—</div>
                  <input type="number" min="0" max="20" value={awayScore} onChange={e => setAwayScore(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 76 }} />
                </div>
                <div className="flex-1 text-center">
                  {awayPlayer ? (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 6 }}>{awayPlayer.badge}</div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{awayPlayer.name}</div>
                      <div style={{ color: awayPlayer.color, fontSize: 11, marginTop: 2 }}>{awayPlayer.realName}</div>
                      <div style={{ color: '#4b5563', fontSize: 10, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AWAY</div>
                    </>
                  ) : (
                    <div style={{ color: '#374151', fontSize: 13 }}>Away Player</div>
                  )}
                </div>
              </div>
              {homeScore !== '' && awayScore !== '' && homeTeamId && awayTeamId && (
                <div className="mt-4 text-center">
                  {parseInt(homeScore) > parseInt(awayScore) ? (
                    <div style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>🏆 {homePlayer?.name} Wins!</div>
                  ) : parseInt(awayScore) > parseInt(homeScore) ? (
                    <div style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>🏆 {awayPlayer?.name} Wins!</div>
                  ) : (
                    <div style={{ color: '#EAB308', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>🤝 Draw</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <label style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Match Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...selectStyle, fontSize: 13, fontWeight: 400, colorScheme: 'dark' }} />
              </div>
              <button type="submit" className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #3B82F6, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Lexend, sans-serif', border: 'none', cursor: 'pointer', boxShadow: '0 0 24px rgba(59,130,246,0.35)', whiteSpace: 'nowrap' }}>
                <Plus size={16} /> Submit Result
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span style={{ color: '#ef4444', fontSize: 13 }}>{error}</span>
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <CheckCircle size={15} color="#22C55E" />
                <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600 }}>✅ Result saved! Tournament standings updated automatically.</span>
              </div>
            )}
          </form>
        </div>

        {/* ── Match History ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between p-5 pb-4 flex-wrap gap-3">
            <div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>Match History</div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{filteredMatches.length} matches · Hover to edit or delete</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'live', 'upcoming', 'completed'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className="rounded-lg px-3 py-1.5 transition-all capitalize" style={{ background: filter === f ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', border: filter === f ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)', color: filter === f ? '#3B82F6' : '#6b7280', fontSize: 12, fontWeight: 500, fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            {filteredMatches.map(m => {
              const home = teams.find(t => t.id === m.homeTeamId);
              const away = teams.find(t => t.id === m.awayTeamId);
              const statusColor = m.status === 'live' ? '#ef4444' : m.status === 'completed' ? '#22C55E' : '#3B82F6';
              const statusBg = m.status === 'live' ? 'rgba(239,68,68,0.1)' : m.status === 'completed' ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)';
              const icon = m.status === 'live' ? <Zap size={11} /> : m.status === 'completed' ? <CheckCircle size={11} /> : <Clock size={11} />;
              const homeWin = m.status === 'completed' && m.homeScore > m.awayScore;
              const awayWin = m.status === 'completed' && m.awayScore > m.homeScore;

              return (
                <div key={m.id} className="group flex items-center gap-3 px-5 py-3.5 transition-all hover:bg-white/4 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {/* Status */}
                  <div style={{ minWidth: 100 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: statusColor, fontSize: 10, fontWeight: 700, background: statusBg, border: `1px solid ${statusColor}30`, borderRadius: 20, padding: '3px 8px' }}>
                      {icon} {m.status === 'live' ? `LIVE ${m.minute}'` : m.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Match */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                      <span style={{ color: homeWin ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: homeWin ? 700 : 400, fontFamily: 'Lexend, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {home?.name ?? '—'}
                      </span>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{home?.badge ?? '?'}</span>
                    </div>
                    {m.status !== 'upcoming' ? (
                      <div className="flex items-center gap-2 rounded-xl px-4 py-2 shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 80, justifyContent: 'center' }}>
                        <span style={{ color: homeWin ? '#22C55E' : '#fff', fontSize: 18, fontWeight: 800, fontFamily: 'Lexend, sans-serif' }}>{m.homeScore}</span>
                        <span style={{ color: '#4b5563', fontSize: 14 }}>-</span>
                        <span style={{ color: awayWin ? '#22C55E' : '#fff', fontSize: 18, fontWeight: 800, fontFamily: 'Lexend, sans-serif' }}>{m.awayScore}</span>
                      </div>
                    ) : (
                      <div className="rounded-xl px-4 py-2 shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', minWidth: 80, textAlign: 'center', color: '#4b5563', fontSize: 12 }}>
                        vs
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{away?.badge ?? '?'}</span>
                      <span style={{ color: awayWin ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: awayWin ? 700 : 400, fontFamily: 'Lexend, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {away?.name ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div style={{ color: '#6b7280', fontSize: 11, flexShrink: 0, minWidth: 80, textAlign: 'right' }}>{m.date}</div>

                  {/* Admin actions — visible on hover */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      title="Edit Result"
                      onClick={() => setModal({ type: 'edit', match: m })}
                      className="rounded-lg flex items-center justify-center transition-all hover:bg-blue-500/20"
                      style={{ width: 30, height: 30, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.28)', cursor: 'pointer' }}
                    >
                      <Pencil size={13} color="#3B82F6" />
                    </button>
                    <button
                      title="Delete Match"
                      onClick={() => setModal({ type: 'delete', match: m })}
                      className="rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20"
                      style={{ width: 30, height: 30, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredMatches.length === 0 && (
              <div className="py-12 text-center" style={{ color: '#6b7280', fontSize: 14 }}>
                No matches to display
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'edit' && (
        <EditMatchModal match={modal.match} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'delete' && (() => {
        const m = modal.match;
        const home = teams.find(t => t.id === m.homeTeamId);
        const away = teams.find(t => t.id === m.awayTeamId);
        return (
          <ConfirmModal
            title="Delete Match?"
            message={`Remove the match "${home?.name ?? '?'} vs ${away?.name ?? '?'}" (${m.date})? This will recalculate all player standings.`}
            confirmLabel="🗑️ Delete Match"
            onConfirm={() => deleteMatch(m.id)}
            onClose={() => setModal(null)}
          />
        );
      })()}
    </div>
  );
}
import { Header } from '../components/Header';
import { useLeague } from '../context/LeagueContext';
import { PlayerFormModal } from '../components/PlayerFormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Team, TeamWithStats } from '../data/leagueData';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Gamepad2, TrendingUp, ShieldCheck } from 'lucide-react';

function FormBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors = { W: '#22C55E', D: '#EAB308', L: '#EF4444' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: 4,
      background: `${colors[result]}18`, border: `1px solid ${colors[result]}35`,
      color: colors[result], fontSize: 10, fontWeight: 700, fontFamily: 'Lexend, sans-serif',
    }}>
      {result}
    </span>
  );
}

type Modal =
  | { type: 'add' }
  | { type: 'edit'; team: TeamWithStats }
  | { type: 'delete'; team: TeamWithStats };

export function Teams() {
  const { standings, addTeam, editTeam, removeTeam } = useLeague();
  const [modal, setModal] = useState<Modal | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedTeam = selected ? standings.find(t => t.id === selected) : null;

  async function handleEditSave(data: Omit<Team, 'id'>) {
    setSaving(true);
    try {
      if (modal?.type === 'edit') await editTeam(modal.team.id, data);
      if (modal?.type === 'add') await addTeam(data);
      setModal(null);
    } catch (err) {
      console.error('Save team error:', err);
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete() {
    if (modal?.type !== 'delete') return;
    setSaving(true);
    try {
      await removeTeam(modal.team.id);
      setModal(null);
    } catch (err) {
      console.error('Delete team error:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Players" subtitle="Tournament participants — Admin can add, edit, and remove players" />
      <div className="flex-1 p-6 flex flex-col gap-6">

        {/* Admin toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <ShieldCheck size={14} color="#3B82F6" />
            <span style={{ color: '#3B82F6', fontSize: 12, fontWeight: 600, fontFamily: 'Lexend, sans-serif' }}>
              Admin Mode · {standings.length} Players
            </span>
          </div>
          <button
            onClick={() => setModal({ type: 'add' })}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #7c3aed)',
              color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif',
              border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.3)',
            }}
          >
            <Plus size={15} /> Add Player
          </button>
        </div>

        {/* Player Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {standings.map((team) => {
            const isSelected = selected === team.id;
            const zone = team.rank <= 4 ? 'top4' : team.rank <= 6 ? 'playoff' : 'normal';
            const zoneColor = zone === 'top4' ? '#22C55E' : zone === 'playoff' ? '#EAB308' : '#6b7280';
            const zoneLabel = zone === 'top4' ? '✦ Knockout' : zone === 'playoff' ? '↕ Playoff' : 'Group';
            const winRate = Math.round((team.w / Math.max(team.mp, 1)) * 100);
            return (
              <div
                key={team.id}
                className="rounded-2xl p-5 transition-all group relative"
                style={{
                  background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1px solid rgba(59,130,246,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: isSelected ? '0 0 28px rgba(59,130,246,0.14)' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setSelected(isSelected ? null : team.id)}
              >
                {/* Admin action buttons */}
                <div
                  className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    title="Edit Player"
                    onClick={() => setModal({ type: 'edit', team })}
                    className="rounded-lg flex items-center justify-center transition-all hover:bg-blue-500/20"
                    style={{ width: 28, height: 28, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer' }}
                  >
                    <Pencil size={12} color="#3B82F6" />
                  </button>
                  <button
                    title="Remove Player"
                    onClick={() => setModal({ type: 'delete', team })}
                    className="rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20"
                    style={{ width: 28, height: 28, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} color="#ef4444" />
                  </button>
                </div>

                {/* Rank & Zone */}
                <div className="flex items-center gap-2 mb-4" style={{ paddingRight: 68 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 7px', fontFamily: 'Lexend, sans-serif', flexShrink: 0 }}>
                    #{team.rank}
                  </span>
                  <span style={{ color: zoneColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: `${zoneColor}15`, border: `1px solid ${zoneColor}35`, borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
                    {zoneLabel}
                  </span>
                </div>

                {/* Badge & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 50, height: 50, fontSize: 28, background: `${team.color}15`, border: `1px solid ${team.color}30`, boxShadow: isSelected ? `0 0 14px ${team.color}30` : 'none' }}>
                    {team.badge}
                  </div>
                  <div className="min-w-0">
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif', lineHeight: 1.2 }}>{team.name}</div>
                    <div style={{ color: team.color, fontSize: 11, marginTop: 2, fontWeight: 500 }}>{team.realName}</div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'PTS', value: team.pts, highlight: true },
                    { label: 'GD', value: team.gd > 0 ? `+${team.gd}` : `${team.gd}`, highlight: false },
                    { label: 'W', value: team.w, highlight: false },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-lg py-2 text-center" style={{ background: stat.highlight ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', border: stat.highlight ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ color: stat.highlight ? '#3B82F6' : '#fff', fontSize: 17, fontWeight: 800, fontFamily: 'Lexend, sans-serif' }}>{stat.value}</div>
                      <div style={{ color: '#6b7280', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Win rate mini bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span style={{ color: '#6b7280', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Win Rate</span>
                    <span style={{ color: '#22C55E', fontSize: 9, fontWeight: 700 }}>{winRate}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${winRate}%`, background: `linear-gradient(90deg, ${team.color}, #22C55E)`, borderRadius: 999, transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* Form */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span style={{ color: '#6b7280', fontSize: 10, marginRight: 4 }}>Form:</span>
                  {team.form.length > 0
                    ? team.form.map((f, i) => <FormBadge key={i} result={f} />)
                    : <span style={{ color: '#4b5563', fontSize: 10 }}>No matches yet</span>
                  }
                </div>
              </div>
            );
          })}

          {/* Add player placeholder */}
          <button
            onClick={() => setModal({ type: 'add' })}
            className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all hover:border-blue-500/40 hover:bg-white/3"
            style={{ background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.12)', cursor: 'pointer', minHeight: 200 }}
          >
            <div className="rounded-2xl flex items-center justify-center" style={{ width: 50, height: 50, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <Plus size={22} color="#3B82F6" />
            </div>
            <span style={{ color: '#4b5563', fontSize: 13, fontWeight: 500, fontFamily: 'Lexend, sans-serif' }}>Add New Player</span>
          </button>
        </div>

        {/* Detail Panel */}
        {selectedTeam && (
          <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.07), rgba(124,58,237,0.05))', border: '1px solid rgba(59,130,246,0.22)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-5 mb-6 flex-wrap">
              <div className="rounded-2xl flex items-center justify-center" style={{ width: 70, height: 70, fontSize: 40, background: `${selectedTeam.color}18`, border: `2px solid ${selectedTeam.color}35`, boxShadow: `0 0 20px ${selectedTeam.color}25` }}>
                {selectedTeam.badge}
              </div>
              <div className="flex-1">
                <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                  ⚽ Player Profile
                </div>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, fontFamily: 'Lexend, sans-serif', lineHeight: 1.1 }}>
                  {selectedTeam.name}
                </h2>
                <div style={{ color: selectedTeam.color, fontSize: 14, fontWeight: 600, marginTop: 2 }}>{selectedTeam.realName}</div>
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 3 }}>Rank #{selectedTeam.rank} · {selectedTeam.mp} Matches Played</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal({ type: 'edit', team: selectedTeam })}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:opacity-80"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => setModal({ type: 'delete', team: selectedTeam })}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:opacity-80"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
              <div className="text-right">
                <div style={{ color: '#3B82F6', fontSize: 42, fontWeight: 800, fontFamily: 'Lexend, sans-serif', lineHeight: 1 }}>{selectedTeam.pts}</div>
                <div style={{ color: '#6b7280', fontSize: 11 }}>Points</div>
                <div style={{ color: '#22C55E', fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                  {Math.round((selectedTeam.w / Math.max(selectedTeam.mp, 1)) * 100)}% Win Rate
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">
              {[
                { label: 'MP', value: selectedTeam.mp, color: '#9ca3af' },
                { label: 'W', value: selectedTeam.w, color: '#22C55E' },
                { label: 'D', value: selectedTeam.d, color: '#EAB308' },
                { label: 'L', value: selectedTeam.l, color: '#EF4444' },
                { label: 'GF', value: selectedTeam.gf, color: '#3B82F6' },
                { label: 'GA', value: selectedTeam.ga, color: '#EF4444' },
                { label: 'GD', value: selectedTeam.gd > 0 ? `+${selectedTeam.gd}` : selectedTeam.gd, color: selectedTeam.gd >= 0 ? '#22C55E' : '#EF4444' },
                { label: 'PTS', value: selectedTeam.pts, color: '#3B82F6' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl py-3 px-2 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ color: stat.color, fontSize: 22, fontWeight: 800, fontFamily: 'Lexend, sans-serif' }}>{stat.value}</div>
                  <div style={{ color: '#6b7280', fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: '#9ca3af', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={13} /> Win Rate
                </span>
                <span style={{ color: '#3B82F6', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
                  {Math.round((selectedTeam.w / Math.max(selectedTeam.mp, 1)) * 100)}%
                </span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 7, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', width: `${Math.round((selectedTeam.w / Math.max(selectedTeam.mp, 1)) * 100)}%`, background: 'linear-gradient(90deg, #3B82F6, #8b5cf6)', borderRadius: 999, boxShadow: '0 0 10px rgba(59,130,246,0.4)', transition: 'width 0.6s ease' }} />
              </div>
              <div className="mt-3 flex items-center gap-4 flex-wrap">
                <span style={{ color: '#4b5563', fontSize: 11 }}>Recent Form:</span>
                {selectedTeam.form.length > 0
                  ? selectedTeam.form.map((f, i) => <FormBadge key={i} result={f} />)
                  : <span style={{ color: '#4b5563', fontSize: 11 }}>No completed matches yet</span>
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'add' && (
        <PlayerFormModal mode="add" onSave={handleEditSave} onClose={() => setModal(null)} saving={saving} />
      )}
      {modal?.type === 'edit' && (
        <PlayerFormModal mode="edit" initial={modal.team} onSave={handleEditSave} onClose={() => setModal(null)} saving={saving} />
      )}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Remove Player?"
          message={`This will permanently remove ${modal.team.name} (${modal.team.realName}) from the tournament and delete all their match records. This cannot be undone.`}
          confirmLabel="⚠️ Remove Player"
          onConfirm={handleDelete}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
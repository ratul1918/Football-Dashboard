import { useState } from 'react';
import { Modal, FieldLabel, ModalBtn, modalInputStyle } from './Modal';
import { Team } from '../data/leagueData';
import { Check } from 'lucide-react';

const BADGE_OPTIONS = [
  '⚡','🔥','💎','🌟','⚔️','🎯','🔮','🛡️','🦁','🐉',
  '🦅','🌊','⭐','💫','🎮','🏆','🎪','🏅','🥇','🦊',
  '🐯','🦋','🌀','💥','🔑','🎲','🎯','🏹','⚽','🎖️',
];

const COLOR_OPTIONS = [
  '#3B82F6','#22C55E','#8b5cf6','#f59e0b','#ef4444',
  '#06b6d4','#ec4899','#84cc16','#f97316','#14b8a6',
  '#a855f7','#1d4ed8','#059669','#d97706','#dc2626','#0ea5e9',
];

interface Props {
  initial?: Partial<Team>;
  onSave: (data: Omit<Team, 'id'>) => void;
  onClose: () => void;
  mode: 'add' | 'edit';
  saving?: boolean;
}

export function PlayerFormModal({ initial, onSave, onClose, mode, saving = false }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [shortName, setShortName] = useState(initial?.shortName ?? '');
  const [realName, setRealName] = useState(initial?.realName ?? '');
  const [badge, setBadge] = useState(initial?.badge ?? '🎮');
  const [color, setColor] = useState(initial?.color ?? '#3B82F6');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!name.trim()) { setError('Player name is required.'); return; }
    if (!shortName.trim()) { setError('Short tag is required.'); return; }
    if (!realName.trim()) { setError('Full name is required.'); return; }
    if (shortName.trim().length > 6) { setError('Short tag must be ≤ 6 characters.'); return; }
    setError('');
    onSave({
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      realName: realName.trim(),
      badge,
      color,
    });
    // Parent closes modal after async save completes
  }

  return (
    <Modal
      title={mode === 'add' ? '➕ Add New Player' : '✏️ Edit Player'}
      subtitle={mode === 'add' ? 'Register a new player to the tournament' : 'Update player details — stats are auto-computed from matches'}
      onClose={onClose}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FieldLabel>Player Name / Username</FieldLabel>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Marcus_FC"
            style={modalInputStyle}
          />
        </div>
        <div>
          <FieldLabel>Short Tag (≤ 6 chars)</FieldLabel>
          <input
            value={shortName} onChange={e => setShortName(e.target.value.toUpperCase())}
            placeholder="e.g. MARKUS"
            maxLength={6}
            style={modalInputStyle}
          />
        </div>
        <div>
          <FieldLabel>Full Name</FieldLabel>
          <input
            value={realName} onChange={e => setRealName(e.target.value)}
            placeholder="e.g. Marcus Johnson"
            style={modalInputStyle}
          />
        </div>
      </div>

      {/* Badge Picker */}
      <div>
        <FieldLabel>Badge / Avatar</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {BADGE_OPTIONS.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setBadge(b)}
              className="rounded-xl transition-all hover:scale-110"
              style={{
                width: 42, height: 42, fontSize: 22,
                background: badge === b ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.05)',
                border: badge === b ? '2px solid #3B82F6' : '2px solid transparent',
                cursor: 'pointer',
                boxShadow: badge === b ? '0 0 10px rgba(59,130,246,0.35)' : 'none',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <FieldLabel>Player Color</FieldLabel>
        <div className="flex flex-wrap gap-2 items-center">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="rounded-full transition-all hover:scale-110"
              style={{
                width: 32, height: 32,
                background: c,
                border: color === c ? '3px solid #fff' : '3px solid transparent',
                boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                cursor: 'pointer',
              }}
            >
              {color === c && <Check size={14} color="#fff" style={{ margin: 'auto' }} />}
            </button>
          ))}
          {/* Live preview */}
          <div className="ml-3 flex items-center gap-3 rounded-xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 24 }}>{badge}</span>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
                {name || 'Player Name'}
              </div>
              <div style={{ color, fontSize: 11 }}>{realName || 'Real Name'}</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <span style={{ color: '#ef4444', fontSize: 12 }}>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <ModalBtn variant="secondary" onClick={onClose} disabled={saving}>Cancel</ModalBtn>
        <ModalBtn variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? '⏳ Saving…' : mode === 'add' ? '➕ Add Player' : '✅ Save Changes'}
        </ModalBtn>
      </div>
    </Modal>
  );
}
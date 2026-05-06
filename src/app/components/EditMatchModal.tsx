import { useState } from 'react';
import { Modal, FieldLabel, ModalBtn, modalInputStyle } from './Modal';
import { Match } from '../data/leagueData';
import { useLeague } from '../context/LeagueContext';
import { ChevronDown } from 'lucide-react';

interface Props {
  match: Match;
  onClose: () => void;
}

export function EditMatchModal({ match, onClose }: Props) {
  const { teams, editMatchResult } = useLeague();
  const [homeScore, setHomeScore] = useState(String(match.homeScore));
  const [awayScore, setAwayScore] = useState(String(match.awayScore));
  const [date, setDate] = useState(match.date);
  const [status, setStatus] = useState<'completed' | 'upcoming'>(
    match.status === 'live' ? 'completed' : match.status,
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);

  async function handleSave() {
    const hs = parseInt(homeScore);
    const as_ = parseInt(awayScore);
    if (status === 'completed') {
      if (isNaN(hs) || isNaN(as_) || hs < 0 || as_ < 0) {
        setError('Scores must be valid non-negative numbers.'); return;
      }
    }
    setError('');
    setSaving(true);
    try {
      await editMatchResult(match.id, hs || 0, as_ || 0, date, status);
      onClose();
    } catch (err: any) {
      setError(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const scoreStyle = {
    ...modalInputStyle,
    fontSize: 28, fontWeight: 800 as const,
    textAlign: 'center' as const,
    padding: '10px 8px',
  };

  const homeWin = parseInt(homeScore) > parseInt(awayScore);
  const awayWin = parseInt(awayScore) > parseInt(homeScore);
  const isDraw = parseInt(homeScore) === parseInt(awayScore) && homeScore !== '' && awayScore !== '';

  return (
    <Modal
      title="✏️ Edit Match Result"
      subtitle="Changes auto-recalculate all standings immediately"
      onClose={onClose}
      width={520}
    >
      {/* Teams & Score */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-4">
          {/* Home */}
          <div className="flex-1 text-center">
            <div style={{ fontSize: 36, marginBottom: 6 }}>{homeTeam?.badge}</div>
            <div style={{ color: homeWin ? '#22C55E' : '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
              {homeTeam?.name}
            </div>
            <div style={{ color: homeTeam?.color, fontSize: 11, marginTop: 2 }}>{homeTeam?.realName}</div>
            <div style={{ color: '#4b5563', fontSize: 10, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>HOME</div>
          </div>
          {/* Score inputs */}
          <div className="flex items-center gap-2">
            <input
              type="number" min="0" max="20"
              value={homeScore} onChange={e => setHomeScore(e.target.value)}
              style={{ ...scoreStyle, width: 72, color: homeWin ? '#22C55E' : '#fff' }}
            />
            <span style={{ color: '#374151', fontSize: 20 }}>—</span>
            <input
              type="number" min="0" max="20"
              value={awayScore} onChange={e => setAwayScore(e.target.value)}
              style={{ ...scoreStyle, width: 72, color: awayWin ? '#22C55E' : '#fff' }}
            />
          </div>
          {/* Away */}
          <div className="flex-1 text-center">
            <div style={{ fontSize: 36, marginBottom: 6 }}>{awayTeam?.badge}</div>
            <div style={{ color: awayWin ? '#22C55E' : '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
              {awayTeam?.name}
            </div>
            <div style={{ color: awayTeam?.color, fontSize: 11, marginTop: 2 }}>{awayTeam?.realName}</div>
            <div style={{ color: '#4b5563', fontSize: 10, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AWAY</div>
          </div>
        </div>

        {/* Result indicator */}
        {(homeScore !== '' && awayScore !== '' && !isNaN(parseInt(homeScore)) && !isNaN(parseInt(awayScore))) && (
          <div className="mt-4 text-center rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {homeWin ? (
              <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
                🏆 {homeTeam?.name} wins
              </span>
            ) : awayWin ? (
              <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
                🏆 {awayTeam?.name} wins
              </span>
            ) : isDraw ? (
              <span style={{ color: '#EAB308', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
                🤝 Draw
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Date & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Match Date</FieldLabel>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ ...modalInputStyle, colorScheme: 'dark' }}
          />
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <div className="relative">
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'completed' | 'upcoming')}
              style={{ ...modalInputStyle, appearance: 'none', cursor: 'pointer' }}
            >
              <option value="completed" style={{ background: '#0d1428' }}>✅ Completed</option>
              <option value="upcoming" style={{ background: '#0d1428' }}>🕐 Upcoming</option>
            </select>
            <ChevronDown size={13} color="#6b7280" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)' }}>
        <p style={{ color: '#60a5fa', fontSize: 11, lineHeight: 1.6 }}>
          ⚡ All player stats (MP, W, D, L, GF, GA, GD, PTS) and the full standings table will recalculate instantly after saving.
        </p>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <span style={{ color: '#ef4444', fontSize: 12 }}>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <ModalBtn variant="secondary" onClick={onClose} disabled={saving}>Cancel</ModalBtn>
        <ModalBtn variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Saving…' : '💾 Save & Recalculate'}
        </ModalBtn>
      </div>
    </Modal>
  );
}
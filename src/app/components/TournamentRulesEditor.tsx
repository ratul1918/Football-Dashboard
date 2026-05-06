import { useState } from 'react';
import React from 'react';
import { ChevronUp, ChevronDown, Check, Trophy, Zap, Users, GitBranch, RotateCcw, Settings2 } from 'lucide-react';
import type { TournamentRules, SystemId, FormatType, TiebreakerKey } from '../context/TournamentRulesContext';

// ─── Preset definitions ────────────────────────────────────────────────────
type PresetDef = {
  id: SystemId;
  name: string;
  icon: string;
  subtitle: string;
  color: string;
  badge: string;
  partial: Partial<TournamentRules>;
};

const PRESETS: PresetDef[] = [
  {
    id: 'league', name: 'Premier League', icon: '🏆', subtitle: 'Single Round-Robin',
    color: '#3B82F6', badge: 'Top Flight',
    partial: {
      format: 'single-rr', legs: 1, numGroups: 1, teamsPerGroup: 20,
      points: { win: 3, draw: 1, loss: 0, bonusGoal: false, cleanSheetBonus: false },
      tiebreakers: ['points', 'gd', 'gf', 'h2h', 'wins', 'alpha'],
      zones: { champion: 1, knockout: 4, playoff: 2, relegation: 3 },
      awayGoalsRule: false, extraTimeEnabled: false, penaltiesEnabled: false,
    },
  },
  {
    id: 'ucl', name: 'Champions League', icon: '⭐', subtitle: 'Groups + Knockout',
    color: '#f59e0b', badge: 'UEFA',
    partial: {
      format: 'group-knockout', legs: 2, numGroups: 8, teamsPerGroup: 4,
      points: { win: 3, draw: 1, loss: 0, bonusGoal: false, cleanSheetBonus: false },
      tiebreakers: ['points', 'h2h', 'gd', 'gf', 'wins', 'alpha'],
      zones: { champion: 1, knockout: 2, playoff: 1, relegation: 0 },
      awayGoalsRule: false, extraTimeEnabled: true, penaltiesEnabled: true,
    },
  },
  {
    id: 'worldcup', name: 'World Cup', icon: '🌍', subtitle: '8 Groups + Knockout',
    color: '#22C55E', badge: 'FIFA',
    partial: {
      format: 'group-knockout', legs: 1, numGroups: 8, teamsPerGroup: 4,
      points: { win: 3, draw: 1, loss: 0, bonusGoal: false, cleanSheetBonus: false },
      tiebreakers: ['points', 'gd', 'gf', 'h2h', 'wins', 'alpha'],
      zones: { champion: 1, knockout: 2, playoff: 1, relegation: 0 },
      awayGoalsRule: false, extraTimeEnabled: true, penaltiesEnabled: true,
    },
  },
  {
    id: 'double-rr', name: 'Double Round-Robin', icon: '🔄', subtitle: 'Home & Away',
    color: '#8b5cf6', badge: 'Derby',
    partial: {
      format: 'double-rr', legs: 2, numGroups: 1, teamsPerGroup: 16,
      points: { win: 3, draw: 1, loss: 0, bonusGoal: false, cleanSheetBonus: false },
      tiebreakers: ['points', 'gd', 'gf', 'h2h', 'wins', 'alpha'],
      zones: { champion: 1, knockout: 4, playoff: 2, relegation: 2 },
      awayGoalsRule: true, extraTimeEnabled: false, penaltiesEnabled: false,
    },
  },
  {
    id: 'swiss', name: 'Swiss System', icon: '♟️', subtitle: 'Performance Pairs',
    color: '#ef4444', badge: 'Chess-Style',
    partial: {
      format: 'swiss', legs: 1, numGroups: 1, teamsPerGroup: 8,
      points: { win: 1, draw: 0.5, loss: 0, bonusGoal: false, cleanSheetBonus: false },
      tiebreakers: ['points', 'h2h', 'gd', 'wins', 'alpha'],
      zones: { champion: 1, knockout: 4, playoff: 0, relegation: 0 },
      awayGoalsRule: false, extraTimeEnabled: false, penaltiesEnabled: false,
    },
  },
  {
    id: 'custom', name: 'Custom System', icon: '⚙️', subtitle: 'Build Your Own',
    color: '#06b6d4', badge: 'Freestyle',
    partial: {},
  },
];

const TIEBREAKER_META: Record<TiebreakerKey, { label: string; icon: string; desc: string }> = {
  points:     { label: 'Total Points',    icon: '🏅', desc: 'Primary ranking by points' },
  gd:         { label: 'Goal Difference', icon: '⚖️', desc: 'Goals scored minus goals conceded' },
  gf:         { label: 'Goals For',       icon: '⚽', desc: 'Total goals scored' },
  h2h:        { label: 'Head-to-Head',    icon: '🤝', desc: 'Result of direct matches' },
  wins:       { label: 'Most Wins',       icon: '✅', desc: 'Total wins' },
  away_goals: { label: 'Away Goals',      icon: '✈️', desc: 'Goals scored away from home' },
  alpha:      { label: 'Alphabetical',    icon: '🔤', desc: 'Last resort: name order' },
};

const ALL_TIEBREAKERS: TiebreakerKey[] = ['points', 'gd', 'gf', 'h2h', 'wins', 'away_goals', 'alpha'];

const FORMAT_OPTIONS: { value: FormatType; label: string; desc: string; icon: string }[] = [
  { value: 'single-rr',     label: 'Single Round-Robin',      desc: 'Each team plays every other team once', icon: '🔁' },
  { value: 'double-rr',     label: 'Double Round-Robin',      desc: 'Home and away matches for every pair',  icon: '🔄' },
  { value: 'group-knockout',label: 'Group Stage + Knockout',  desc: 'Groups feed into knockout bracket',     icon: '🏗️' },
  { value: 'swiss',         label: 'Swiss System',            desc: 'Paired by win record, no elimination', icon: '♟️' },
];

const ZONE_META = [
  { key: 'champion' as const,  label: 'Champion Spot',     color: '#f59e0b', icon: '🥇', desc: 'Title winner(s)' },
  { key: 'knockout' as const,  label: 'Knockout / UCL',    color: '#3B82F6', icon: '🔵', desc: 'Advance to knockout round' },
  { key: 'playoff' as const,   label: 'Playoff / Europa',  color: '#22C55E', icon: '🟢', desc: 'Playoff qualifier spots' },
  { key: 'relegation' as const,label: 'Relegation',        color: '#ef4444', icon: '🔴', desc: 'Drop out / eliminated' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function NumberStepper({
  value, onChange, min = 0, max = 99, step = 1, suffix = '',
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <button onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
        style={{ width: 32, height: 36, color: '#9ca3af', background: 'transparent', border: 'none', cursor: value <= min ? 'not-allowed' : 'pointer', fontSize: 18, opacity: value <= min ? 0.4 : 1 }}>−</button>
      <span style={{ minWidth: 36, textAlign: 'center', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{value}{suffix}</span>
      <button onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
        style={{ width: 32, height: 36, color: '#9ca3af', background: 'transparent', border: 'none', cursor: value >= max ? 'not-allowed' : 'pointer', fontSize: 18, opacity: value >= max ? 0.4 : 1 }}>+</button>
    </div>
  );
}

function GlassToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 12, position: 'relative',
      background: checked ? 'linear-gradient(135deg,#3B82F6,#7c3aed)' : 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
      boxShadow: checked ? '0 0 10px rgba(59,130,246,0.4)' : 'none',
      flexShrink: 0, transition: 'all 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color="#3B82F6" />
          </div>
          <span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{title}</span>
        </div>
        <div style={{ color: '#6b7280', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <ChevronDown size={16} />
        </div>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export function TournamentRulesEditor({
  rules,
  onChange,
}: { rules: TournamentRules; onChange: (r: TournamentRules) => void }) {
  const [appliedPreset, setAppliedPreset] = useState<SystemId>(rules.system);

  function set<K extends keyof TournamentRules>(key: K, val: TournamentRules[K]) {
    onChange({ ...rules, [key]: val });
  }

  function setPoints(key: keyof TournamentRules['points'], val: any) {
    onChange({ ...rules, points: { ...rules.points, [key]: val } });
  }

  function setZone(key: keyof TournamentRules['zones'], val: number) {
    onChange({ ...rules, zones: { ...rules.zones, [key]: val } });
  }

  function applyPreset(p: PresetDef) {
    setAppliedPreset(p.id);
    onChange({ ...rules, ...p.partial, system: p.id });
  }

  function moveTiebreaker(idx: number, dir: -1 | 1) {
    const next = [...rules.tiebreakers];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    set('tiebreakers', next);
  }

  function toggleTiebreaker(key: TiebreakerKey) {
    if (rules.tiebreakers.includes(key)) {
      if (key === 'points') return; // always keep points
      set('tiebreakers', rules.tiebreakers.filter(t => t !== key));
    } else {
      set('tiebreakers', [...rules.tiebreakers, key]);
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', padding: '10px 14px',
    fontSize: 13, fontFamily: 'Lexend, sans-serif', outline: 'none', width: '100%',
  } as React.CSSProperties;

  // Build summary text
  const activePreset = PRESETS.find(p => p.id === appliedPreset) || PRESETS[5];
  const fmtLabel = FORMAT_OPTIONS.find(f => f.value === rules.format)?.label || rules.format;
  const tbLabels = rules.tiebreakers.map(k => TIEBREAKER_META[k]?.label || k).join(' → ');

  return (
    <div className="flex flex-col gap-4">

      {/* ── Preset Cards ─────────────────────────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 }}>
        <div className="flex items-center gap-2 mb-4">
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Lexend, sans-serif' }}>Quick Presets</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: 11, color: '#4b5563', fontFamily: 'Lexend, sans-serif' }}>Click to apply, then customize below</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRESETS.map(p => {
            const isActive = appliedPreset === p.id;
            return (
              <button key={p.id} onClick={() => applyPreset(p)}
                className="relative rounded-2xl p-4 text-left transition-all"
                style={{
                  background: isActive ? `${p.color}14` : 'rgba(255,255,255,0.03)',
                  border: isActive ? `1.5px solid ${p.color}50` : '1.5px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  boxShadow: isActive ? `0 0 20px ${p.color}20` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </div>
                )}
                <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? p.color : '#e5e7eb', fontFamily: 'Lexend, sans-serif', lineHeight: 1.3, marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: 10, color: '#6b7280', fontFamily: 'Lexend, sans-serif' }}>{p.subtitle}</div>
                <div style={{
                  display: 'inline-block', marginTop: 8, fontSize: 9, fontWeight: 700,
                  color: p.color, background: `${p.color}18`, border: `1px solid ${p.color}30`,
                  borderRadius: 6, padding: '2px 6px', fontFamily: 'Lexend, sans-serif',
                  letterSpacing: '0.05em',
                }}>{p.badge}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Basic Info ────────────────────────────────────────────── */}
      <SectionCard title="Basic Info" icon={Trophy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8, fontFamily: 'Lexend, sans-serif' }}>Tournament Name</label>
            <input value={rules.tournamentName} onChange={e => set('tournamentName', e.target.value)} style={inputStyle} placeholder="e.g. Elite Football Tournament" />
          </div>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8, fontFamily: 'Lexend, sans-serif' }}>Season / Year</label>
            <input value={rules.season} onChange={e => set('season', e.target.value)} style={inputStyle} placeholder="e.g. 2025–2026" />
          </div>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8, fontFamily: 'Lexend, sans-serif' }}>Max Players</label>
            <div className="flex items-center gap-3">
              <NumberStepper value={rules.maxPlayers} onChange={v => set('maxPlayers', v)} min={2} max={64} />
              <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Lexend, sans-serif' }}>players in tournament</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Format & Structure ────────────────────────────────────── */}
      <SectionCard title="Format & Structure" icon={GitBranch}>
        {/* Format picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {FORMAT_OPTIONS.map(opt => {
            const isActive = rules.format === opt.value;
            return (
              <button key={opt.value} onClick={() => set('format', opt.value)}
                className="flex items-start gap-3 rounded-xl p-3 text-left transition-all"
                style={{
                  background: isActive ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#3B82F6' : '#e5e7eb', fontFamily: 'Lexend, sans-serif' }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, fontFamily: 'Lexend, sans-serif' }}>{opt.desc}</div>
                </div>
                {isActive && (
                  <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={9} color="#fff" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Match legs */}
        <div className="flex flex-wrap gap-6 items-center mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Lexend, sans-serif' }}>Match Legs</div>
            <div className="flex gap-2">
              {([1, 2] as const).map(leg => (
                <button key={leg} onClick={() => set('legs', leg)}
                  className="rounded-xl px-4 py-2 transition-all"
                  style={{
                    background: rules.legs === leg ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                    border: rules.legs === leg ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    color: rules.legs === leg ? '#3B82F6' : '#9ca3af',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Lexend, sans-serif',
                  }}
                >
                  {leg === 1 ? '1 Leg' : '2 Legs (H&A)'}
                </button>
              ))}
            </div>
          </div>

          {rules.format === 'group-knockout' && (
            <>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Lexend, sans-serif' }}>Number of Groups</div>
                <NumberStepper value={rules.numGroups} onChange={v => set('numGroups', v)} min={1} max={16} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'Lexend, sans-serif' }}>Teams per Group</div>
                <NumberStepper value={rules.teamsPerGroup} onChange={v => set('teamsPerGroup', v)} min={2} max={8} />
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* ── Scoring System ────────────────────────────────────────── */}
      <SectionCard title="Scoring System" icon={Zap}>
        <div className="flex flex-wrap gap-6 mb-5">
          {([
            { key: 'win' as const,  label: 'Win',  color: '#22C55E' },
            { key: 'draw' as const, label: 'Draw', color: '#f59e0b' },
            { key: 'loss' as const, label: 'Loss', color: '#ef4444' },
          ]).map(({ key, label, color }) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div style={{ fontSize: 11, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Lexend, sans-serif' }}>{label}</div>
              <NumberStepper
                value={rules.points[key]}
                onChange={v => setPoints(key, v)}
                min={0} max={10}
                step={key === 'draw' && rules.system === 'swiss' ? 0.5 : 1}
                suffix="pt"
              />
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }} className="flex flex-col gap-3">
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'Lexend, sans-serif' }}>Bonus Rules</div>
          {[
            { key: 'bonusGoal' as const,      label: '+1 pt Bonus Goal Award',     desc: 'Extra point when a team scores 4 or more goals' },
            { key: 'cleanSheetBonus' as const, label: '+0.5 pt Clean Sheet Bonus',  desc: 'Fraction point for keeping a clean sheet' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 500, fontFamily: 'Lexend, sans-serif' }}>{label}</div>
                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{desc}</div>
              </div>
              <GlassToggle checked={rules.points[key] as boolean} onChange={() => setPoints(key, !rules.points[key])} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Tiebreakers ───────────────────────────────────────────── */}
      <SectionCard title="Tiebreaker Order" icon={Settings2}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, fontFamily: 'Lexend, sans-serif' }}>
          Drag priority order — first rule is applied first. Toggle to include/exclude.
        </div>

        {/* Active ordered list */}
        <div className="flex flex-col gap-2 mb-4">
          {rules.tiebreakers.map((key, idx) => {
            const meta = TIEBREAKER_META[key];
            return (
              <div key={key} className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#3B82F6', fontFamily: 'Lexend, sans-serif' }}>{idx + 1}</span>
                </div>
                <span style={{ fontSize: 16 }}>{meta?.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', fontFamily: 'Lexend, sans-serif' }}>{meta?.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{meta?.desc}</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveTiebreaker(idx, -1)} disabled={idx === 0}
                    style={{ width: 22, height: 22, background: idx === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronUp size={12} color="#9ca3af" />
                  </button>
                  <button onClick={() => moveTiebreaker(idx, 1)} disabled={idx === rules.tiebreakers.length - 1}
                    style={{ width: 22, height: 22, background: idx === rules.tiebreakers.length - 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: idx === rules.tiebreakers.length - 1 ? 'default' : 'pointer', opacity: idx === rules.tiebreakers.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronDown size={12} color="#9ca3af" />
                  </button>
                </div>
                {key !== 'points' && (
                  <button onClick={() => toggleTiebreaker(key)}
                    style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Inactive tiebreakers to add */}
        {ALL_TIEBREAKERS.filter(k => !rules.tiebreakers.includes(k)).length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: 'Lexend, sans-serif' }}>+ Add tiebreaker</div>
            <div className="flex flex-wrap gap-2">
              {ALL_TIEBREAKERS.filter(k => !rules.tiebreakers.includes(k)).map(key => (
                <button key={key} onClick={() => toggleTiebreaker(key)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12 }}>{TIEBREAKER_META[key]?.icon}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'Lexend, sans-serif' }}>{TIEBREAKER_META[key]?.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Qualification Zones ───────────────────────────────────── */}
      <SectionCard title="Qualification Zones" icon={Users}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, fontFamily: 'Lexend, sans-serif' }}>
          Set how many spots each zone covers in the final standings.
        </div>
        <div className="flex flex-col gap-3">
          {ZONE_META.map(({ key, label, color, icon, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: `${color}09`, border: `1px solid ${color}25` }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}80` }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', fontFamily: 'Lexend, sans-serif' }}>{icon} {label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{desc}</div>
                </div>
              </div>
              <NumberStepper
                value={rules.zones[key]}
                onChange={v => setZone(key, v)}
                min={0} max={key === 'champion' ? 4 : 32}
              />
            </div>
          ))}
        </div>
        {/* Visual zone preview bar */}
        <div style={{ marginTop: 16, borderRadius: 8, overflow: 'hidden', height: 8, display: 'flex', gap: 2 }}>
          {ZONE_META.map(({ key, color }) =>
            rules.zones[key] > 0 ? (
              <div key={key} style={{ flex: rules.zones[key], background: color, minWidth: 4 }} title={`${key}: ${rules.zones[key]}`} />
            ) : null
          )}
          <div style={{ flex: Math.max(0, rules.maxPlayers - Object.values(rules.zones).reduce((a, b) => a + b, 0)), background: 'rgba(255,255,255,0.08)', minWidth: 0 }} />
        </div>
        <div style={{ fontSize: 10, color: '#4b5563', marginTop: 6, fontFamily: 'Lexend, sans-serif' }}>
          Occupied: {Object.values(rules.zones).reduce((a, b) => a + b, 0)} / {rules.maxPlayers} spots
        </div>
      </SectionCard>

      {/* ── Extra Rules ───────────────────────────────────────────── */}
      <SectionCard title="Extra Match Rules" icon={RotateCcw}>
        <div className="flex flex-col gap-3">
          {[
            { key: 'awayGoalsRule' as const,      label: 'Away Goals Rule',       desc: 'In 2-legged ties, away goals act as tiebreaker' },
            { key: 'extraTimeEnabled' as const,   label: 'Extra Time in Knockouts', desc: '30 minutes added when knockout match is level' },
            { key: 'penaltiesEnabled' as const,   label: 'Penalty Shootout',      desc: 'Penalties after extra time in knockout rounds' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 500, fontFamily: 'Lexend, sans-serif' }}>{label}</div>
                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{desc}</div>
              </div>
              <GlassToggle checked={rules[key] as boolean} onChange={() => set(key, !rules[key])} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Live Summary Card ─────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(34,197,94,0.05))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: 20 }}>
        <div className="flex items-center gap-2 mb-3">
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14 }}>{activePreset.icon}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6', fontFamily: 'Lexend, sans-serif' }}>Current Format Summary</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          {[
            ['Tournament', `${rules.tournamentName} · ${rules.season}`],
            ['System', activePreset.name],
            ['Format', `${fmtLabel}, ${rules.legs === 2 ? '2 legs (H&A)' : '1 leg'}`],
            ['Points', `Win=${rules.points.win} · Draw=${rules.points.draw} · Loss=${rules.points.loss}`],
            ['Groups', rules.format === 'group-knockout' ? `${rules.numGroups} groups × ${rules.teamsPerGroup} teams` : 'N/A'],
            ['Tiebreaks', tbLabels],
          ].map(([label, val]) => (
            <div key={label}>
              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Lexend, sans-serif' }}>{label}: </span>
              <span style={{ fontSize: 11, color: '#d1d5db', fontFamily: 'Lexend, sans-serif' }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {ZONE_META.filter(z => rules.zones[z.key] > 0).map(({ key, label, color, icon }) => (
            <div key={key} style={{ fontSize: 11, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 8, padding: '3px 10px', fontFamily: 'Lexend, sans-serif', fontWeight: 600 }}>
              {icon} {rules.zones[key]} {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
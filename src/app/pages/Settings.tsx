import { Header } from '../components/Header';
import { useState, ReactNode, CSSProperties } from 'react';
import { User, Bell, Shield, Palette, Database, Save, Check, Trophy, Sliders, Download } from 'lucide-react';
import { useTournamentRules } from '../context/TournamentRulesContext';
import { TournamentRulesEditor } from '../components/TournamentRulesEditor';
import { ExportModal } from '../components/ExportModal';
import { useLeague } from '../context/LeagueContext';

const sections = [
  { id: 'profile',      label: 'Profile',       icon: User },
  { id: 'tournament',   label: 'Tournament',     icon: Sliders },
  { id: 'notifications',label: 'Notifications',  icon: Bell },
  { id: 'security',     label: 'Security',       icon: Shield },
  { id: 'appearance',   label: 'Appearance',     icon: Palette },
  { id: 'data',         label: 'Data & Export',  icon: Database },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 12, position: 'relative',
      background: checked ? 'linear-gradient(135deg,#3B82F6,#7c3aed)' : 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
      boxShadow: checked ? '0 0 10px rgba(59,130,246,0.4)' : 'none', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 500, fontFamily: 'Lexend, sans-serif' }}>{label}</div>
        {desc && <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  const [activeSection, setActiveSection] = useState('tournament');
  const [saved, setSaved]   = useState(false);
  const [saving, setSavingLocal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const { rules, setRules, saveRules, saving: ctxSaving } = useTournamentRules();
  const { standings, matches, teams, resetAll } = useLeague();

  async function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return; }
    setResetting(true);
    try {
      await resetAll();
      setResetConfirm(false);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  }

  const [misc, setMisc] = useState({
    adminName: 'Tournament Admin',
    email: 'admin@elitepitch.com',
    notifyResults: true,
    notifyStandings: true,
    notifySystem: false,
    twoFactor: false,
    autoSave: true,
    compactTable: false,
    showForm: true,
    showRealNames: true,
    accentColor: '#3B82F6',
  });

  function toggleMisc(key: keyof typeof misc) {
    setMisc(s => ({ ...s, [key]: !s[key as keyof typeof misc] }));
  }

  async function handleSave() {
    setSavingLocal(true);
    try {
      if (activeSection === 'tournament') {
        await saveRules();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSavingLocal(false);
    }
  }

  const isBusy = saving || ctxSaving;

  const inputStyle: CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', padding: '10px 14px',
    fontSize: 14, fontFamily: 'Lexend, sans-serif', outline: 'none', width: '100%',
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="System & tournament configurations" />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex gap-6 max-w-6xl">

          {/* Sidebar Nav — desktop */}
          <div className="hidden lg:flex flex-col gap-1 rounded-2xl p-3 shrink-0"
            style={{ width: 200, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', alignSelf: 'flex-start' }}>
            {sections.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button key={id} onClick={() => setActiveSection(id)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-left transition-all"
                  style={{
                    background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                    color: isActive ? '#3B82F6' : '#9ca3af', cursor: 'pointer',
                  }}
                >
                  <Icon size={16} />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, fontFamily: 'Lexend, sans-serif' }}>{label}</span>
                  {id === 'tournament' && (
                    <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 5, padding: '1px 5px', fontFamily: 'Lexend, sans-serif' }}>NEW</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Nav */}
          <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-1 w-full" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 shrink-0 transition-all"
                style={{
                  background: activeSection === id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                  border: activeSection === id ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  color: activeSection === id ? '#3B82F6' : '#9ca3af', cursor: 'pointer',
                }}
              >
                <Icon size={14} />
                <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'Lexend, sans-serif' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-4">

            {/* ── Profile ─────────────────────────────────────────── */}
            {activeSection === 'profile' && (
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif', marginBottom: 20 }}>Admin Profile</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-2xl flex items-center justify-center" style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #3B82F6, #7c3aed)', color: '#fff', fontSize: 22, fontWeight: 800 }}>⚽</div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>{misc.adminName}</div>
                    <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{misc.email}</div>
                    <div style={{ color: '#22C55E', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Trophy size={11} /> Football Tournament Admin</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Admin Display Name', value: misc.adminName, key: 'adminName' as const },
                    { label: 'Email Address',       value: misc.email,     key: 'email' as const },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 }}>{field.label}</label>
                      <input value={field.value} onChange={e => setMisc(s => ({ ...s, [field.key]: e.target.value }))} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tournament Rules ──────────────────────────────────── */}
            {activeSection === 'tournament' && (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18 }}>⚙️</span>
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>Tournament Rules</div>
                    <div style={{ color: '#6b7280', fontSize: 12, fontFamily: 'Lexend, sans-serif' }}>Pick a preset or build a fully custom format</div>
                  </div>
                </div>
                <TournamentRulesEditor rules={rules} onChange={setRules} />
              </>
            )}

            {/* ── Notifications ─────────────────────────────────────── */}
            {activeSection === 'notifications' && (
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif', marginBottom: 20 }}>Notification Preferences</h3>
                <SettingRow label="Match Results" desc="Notify when a new match result is entered">
                  <Toggle checked={misc.notifyResults} onChange={() => toggleMisc('notifyResults')} />
                </SettingRow>
                <SettingRow label="Standings Changes" desc="Alert when player qualification zones change">
                  <Toggle checked={misc.notifyStandings} onChange={() => toggleMisc('notifyStandings')} />
                </SettingRow>
                <SettingRow label="System Alerts" desc="Platform news and maintenance notifications">
                  <Toggle checked={misc.notifySystem} onChange={() => toggleMisc('notifySystem')} />
                </SettingRow>
              </div>
            )}

            {/* ── Security ───────────────────────────────────────────── */}
            {activeSection === 'security' && (
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif', marginBottom: 20 }}>Security</h3>
                <SettingRow label="Two-Factor Authentication" desc="Extra layer of security for admin access">
                  <Toggle checked={misc.twoFactor} onChange={() => toggleMisc('twoFactor')} />
                </SettingRow>
                <SettingRow label="Change Password" desc="Update your admin account password">
                  <button className="rounded-lg px-4 py-2" style={{ color: '#3B82F6', fontSize: 12, fontWeight: 500, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)', cursor: 'pointer' }}>Update</button>
                </SettingRow>
              </div>
            )}

            {/* ── Appearance ─────────────────────────────────────────── */}
            {activeSection === 'appearance' && (
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif', marginBottom: 20 }}>Appearance</h3>
                <SettingRow label="Compact Table View" desc="Reduce row height in standings table">
                  <Toggle checked={misc.compactTable} onChange={() => toggleMisc('compactTable')} />
                </SettingRow>
                <SettingRow label="Show Form Column" desc="Display recent 5-match form in standings">
                  <Toggle checked={misc.showForm} onChange={() => toggleMisc('showForm')} />
                </SettingRow>
                <SettingRow label="Show Player Full Names" desc="Display full names below player usernames">
                  <Toggle checked={misc.showRealNames} onChange={() => toggleMisc('showRealNames')} />
                </SettingRow>
                <SettingRow label="Auto-save Changes" desc="Auto-save when table changes">
                  <Toggle checked={misc.autoSave} onChange={() => toggleMisc('autoSave')} />
                </SettingRow>
                <div className="mt-5">
                  <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Accent Color</div>
                  <div className="flex items-center gap-3">
                    {['#3B82F6', '#22C55E', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'].map(color => (
                      <button key={color} onClick={() => setMisc(s => ({ ...s, accentColor: color }))}
                        className="rounded-full transition-all"
                        style={{ width: 32, height: 32, background: color, border: misc.accentColor === color ? '3px solid #fff' : '3px solid transparent', boxShadow: misc.accentColor === color ? `0 0 12px ${color}` : 'none', cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Data & Export ──────────────────────────────────────── */}
            {activeSection === 'data' && (
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif', marginBottom: 8 }}>Data & Export</h3>
                <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 20, fontFamily: 'Lexend, sans-serif' }}>
                  Download your tournament data as an image or spreadsheet-ready CSV files.
                </p>

                {/* Full report PNG */}
                <div className="rounded-xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.06))', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Lexend, sans-serif', marginBottom: 4 }}>
                        📊 Full Tournament Report
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: 12, lineHeight: 1.6 }}>
                        Complete standings + every match result (who vs who, scores) as a high-resolution PNG image. 2× retina quality, ready to share on WhatsApp, Instagram or print.
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {['Standings table', 'All match results', 'Zone legend', 'Tournament format', 'Stats summary'].map(tag => (
                          <span key={tag} style={{ fontSize: 10, color: '#3B82F6', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 6, padding: '2px 8px', fontFamily: 'Lexend, sans-serif', fontWeight: 600 }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowExport(true)}
                      className="flex items-center gap-2 rounded-xl px-5 py-3 shrink-0 transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg,#3B82F6,#7c3aed)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                    >
                      <Download size={15} /> Preview & Export
                    </button>
                  </div>
                </div>

                {/* Quick CSV exports */}
                {[
                  {
                    label: 'Standings CSV',
                    desc: 'Rank, Player, MP, W, D, L, GF, GA, GD, PTS — opens in Excel & Google Sheets',
                    color: '#22C55E',
                    onClick: () => {
                      const headers = ['Rank','Player','Full Name','MP','W','D','L','GF','GA','GD','PTS'];
                      const rows = standings.map(t => [t.rank,t.name,t.realName,t.mp,t.w,t.d,t.l,t.gf,t.ga,t.gd,t.pts]);
                      const csv = [headers,...rows].map(r=>r.join(',')).join('\n');
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
                      a.download = `standings.csv`; a.click();
                    },
                  },
                  {
                    label: 'Match History CSV',
                    desc: 'Date, Matchday, Home player, Score, Away player, Result, Winner — all matches',
                    color: '#f59e0b',
                    onClick: () => {
                      const getTeam = (id: string) => teams.find(t => t.id === id);
                      const headers = ['Date','Matchday','Home Player','Home Score','Away Score','Away Player','Status','Winner'];
                      const dateOrder: string[] = [];
                      const seen = new Set<string>();
                      [...matches].sort((a,b)=>a.date.localeCompare(b.date)).forEach(m=>{ if(!seen.has(m.date)){seen.add(m.date);dateOrder.push(m.date);} });
                      const rows = [...matches].sort((a,b)=>a.date.localeCompare(b.date)).map(m=>{
                        const home=getTeam(m.homeTeamId); const away=getTeam(m.awayTeamId);
                        const dayNum = dateOrder.indexOf(m.date)+1;
                        const winner = m.status!=='completed'?'-':m.homeScore>m.awayScore?(home?.name??'Home'):m.awayScore>m.homeScore?(away?.name??'Away'):'Draw';
                        return [m.date,`Matchday ${dayNum}`,home?.name??'?',m.homeScore,m.awayScore,away?.name??'?',m.status,winner];
                      });
                      const csv=[headers,...rows].map(r=>r.join(',')).join('\n');
                      const a=document.createElement('a');
                      a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
                      a.download='matches.csv'; a.click();
                    },
                  },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 500, fontFamily: 'Lexend, sans-serif' }}>{item.label}</div>
                      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <button onClick={item.onClick} style={{ color: item.color, fontSize: 12, fontWeight: 600, fontFamily: 'Lexend, sans-serif', background: `${item.color}12`, border: `1px solid ${item.color}30`, borderRadius: 8, padding: '7px 16px', cursor: 'pointer' }}>
                      ↓ CSV
                    </button>
                  </div>
                ))}

                {/* Stats snapshot */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Players', value: teams.length, color: '#3B82F6' },
                    { label: 'Matches played', value: matches.filter(m=>m.status==='completed').length, color: '#22C55E' },
                    { label: 'Total goals', value: matches.filter(m=>m.status==='completed').reduce((s,m)=>s+m.homeScore+m.awayScore,0), color: '#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}0a`, border: `1px solid ${s.color}20` }}>
                      <div style={{ color: s.color, fontSize: 22, fontWeight: 800, fontFamily: 'Lexend, sans-serif' }}>{s.value}</div>
                      <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2, fontFamily: 'Lexend, sans-serif' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>⚠️ Danger Zone</div>
                  <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 12 }}>Permanently delete all match results and reset all player stats to zero.</div>
                  <button
                    onClick={handleReset}
                    style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '6px 16px', cursor: 'pointer' }}
                  >
                    {resetting ? 'Resetting…' : resetConfirm ? 'Confirm Reset' : 'Reset Tournament Data'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Save Button ────────────────────────────────────────── */}
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={isBusy}
                className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all hover:opacity-90"
                style={{
                  background: saved ? 'linear-gradient(135deg,#22C55E,#15803d)' : 'linear-gradient(135deg,#3B82F6,#7c3aed)',
                  color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Lexend, sans-serif',
                  border: 'none', cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.7 : 1,
                  boxShadow: saved ? '0 0 20px rgba(34,197,94,0.35)' : '0 0 20px rgba(59,130,246,0.35)',
                }}
              >
                {isBusy ? (
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                ) : saved ? (
                  <Check size={16} />
                ) : (
                  <Save size={16} />
                )}
                {isBusy ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
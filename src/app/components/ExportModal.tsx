import { useRef, useState, CSSProperties } from 'react';
import { toPng } from 'html-to-image';
import { Download, X, FileText, Table2, ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { useLeague } from '../context/LeagueContext';
import { useTournamentRules } from '../context/TournamentRulesContext';
import { ResultsExportCard } from './ResultsExportCard';

interface Props { onClose: () => void; }

type DownloadState = 'idle' | 'generating' | 'done' | 'error';

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function ExportModal({ onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pngState, setPngState] = useState<DownloadState>('idle');
  const { standings, matches, teams } = useLeague();
  const { rules } = useTournamentRules();

  const completed  = matches.filter(m => m.status === 'completed');
  const upcoming   = matches.filter(m => m.status === 'upcoming');
  const totalGoals = completed.reduce((s, m) => s + m.homeScore + m.awayScore, 0);
  const filename   = `${slugify(rules.tournamentName)}-${slugify(rules.season)}`;

  // ── PNG download ─────────────────────────────────────────────────────────
  async function downloadPng() {
    if (!cardRef.current || pngState === 'generating') return;
    setPngState('generating');
    try {
      // Double-render to ensure fonts/images are loaded
      await toPng(cardRef.current, { pixelRatio: 1 });
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#070c18',
        style: { fontFamily: 'Lexend, Inter, sans-serif' },
      });
      const a = document.createElement('a');
      a.download = `${filename}.png`;
      a.href = dataUrl;
      a.click();
      setPngState('done');
      setTimeout(() => setPngState('idle'), 3000);
    } catch (err) {
      console.error('PNG export failed:', err);
      setPngState('error');
      setTimeout(() => setPngState('idle'), 3000);
    }
  }

  // ── CSV: standings ────────────────────────────────────────────────────────
  function downloadStandingsCSV() {
    const headers = ['Rank', 'Player', 'Full Name', 'MP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'];
    const rows = standings.map(t => [
      t.rank, t.name, t.realName, t.mp, t.w, t.d, t.l, t.gf, t.ga, t.gd, t.pts,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    triggerCSV(csv, `${filename}-standings.csv`);
  }

  // ── CSV: full match history ───────────────────────────────────────────────
  function downloadMatchesCSV() {
    const getTeam = (id: string) => teams.find(t => t.id === id);
    const headers = ['Date', 'Matchday', 'Home Player', 'Home Name', 'Home Score', 'Away Score', 'Away Name', 'Away Player', 'Status', 'Winner'];

    // Group by date to assign matchday numbers
    const dateOrder: string[] = [];
    const byDate = new Map<string, true>();
    [...matches]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(m => {
        if (!byDate.has(m.date)) { byDate.set(m.date, true); dateOrder.push(m.date); }
      });

    const rows = [...matches]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(m => {
        const home = getTeam(m.homeTeamId);
        const away = getTeam(m.awayTeamId);
        const dayNum = dateOrder.indexOf(m.date) + 1;
        const winner =
          m.status !== 'completed' ? '-'
          : m.homeScore > m.awayScore ? (home?.name ?? 'Home')
          : m.awayScore > m.homeScore ? (away?.name ?? 'Away')
          : 'Draw';
        return [
          m.date, `Matchday ${dayNum}`,
          home?.name ?? '?', home?.realName ?? '?',
          m.homeScore, m.awayScore,
          away?.realName ?? '?', away?.name ?? '?',
          m.status, winner,
        ];
      });

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    triggerCSV(csv, `${filename}-matches.csv`);
  }

  function triggerCSV(csv: string, name: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  // ─── UI helpers ───────────────────────────────────────────────────────────
  const btnBase: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
    fontSize: 13, fontWeight: 700, fontFamily: 'Lexend, sans-serif',
    border: 'none', transition: 'opacity 0.15s',
  };

  const pngLabel =
    pngState === 'generating' ? 'Generating…'
    : pngState === 'done' ? 'Downloaded!'
    : pngState === 'error' ? 'Error — retry'
    : 'Download PNG';

  const pngIcon =
    pngState === 'generating' ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
    : pngState === 'done'     ? <CheckCircle2 size={15} />
    : <ImageIcon size={15} />;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(4,8,20,0.92)', backdropFilter: 'blur(14px)',
        overflowY: 'auto', padding: '24px 16px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>

        {/* ── Top bar ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, fontFamily: 'Lexend, sans-serif', letterSpacing: '-0.02em' }}>
              📊 Export Tournament Report
            </div>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4, fontFamily: 'Lexend, sans-serif' }}>
              {rules.tournamentName} · Season {rules.season}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* PNG */}
            <button onClick={downloadPng} disabled={pngState === 'generating'} style={{
              ...btnBase,
              background: pngState === 'done' ? 'linear-gradient(135deg,#22C55E,#15803d)' : 'linear-gradient(135deg,#3B82F6,#7c3aed)',
              color: '#fff', opacity: pngState === 'generating' ? 0.7 : 1,
              boxShadow: pngState === 'done' ? '0 0 18px rgba(34,197,94,0.3)' : '0 0 18px rgba(59,130,246,0.3)',
            }}>
              {pngIcon} {pngLabel}
            </button>

            {/* CSV Standings */}
            <button onClick={downloadStandingsCSV} style={{ ...btnBase, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}>
              <Table2 size={15} /> Standings CSV
            </button>

            {/* CSV Matches */}
            <button onClick={downloadMatchesCSV} style={{ ...btnBase, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
              <FileText size={15} /> Matches CSV
            </button>

            {/* Close */}
            <button onClick={onClose} style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Quick stats bar ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 20 }}>
          {[
            { icon: '👥', label: 'Players',       value: teams.length },
            { icon: '✅', label: 'Completed',      value: completed.length },
            { icon: '⏳', label: 'Upcoming',       value: upcoming.length },
            { icon: '⚽', label: 'Total Goals',    value: totalGoals },
            { icon: '📅', label: 'Matchdays',      value: new Set(completed.map(m => m.date)).size },
            { icon: '🏆', label: 'Leader',         value: standings[0]?.name ?? '—' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'Lexend, sans-serif', lineHeight: 1 }}>{value}</div>
              <div style={{ color: '#6b7280', fontSize: 11, marginTop: 3, fontFamily: 'Lexend, sans-serif' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Card preview ──────────────────────────────────────────── */}
        <div style={{ overflowX: 'auto', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 60px rgba(59,130,246,0.08)' }}>
          <ResultsExportCard
            ref={cardRef}
            standings={standings}
            matches={matches}
            teams={teams}
            rules={rules}
          />
        </div>

        {/* ── Footer note ───────────────────────────────────────────── */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ color: '#4b5563', fontSize: 11, fontFamily: 'Lexend, sans-serif' }}>
            📸 PNG exported at 2× resolution (1800px) — sharp for sharing & printing.
          </div>
          <div style={{ color: '#4b5563', fontSize: 11, fontFamily: 'Lexend, sans-serif' }}>
            CSV files are UTF-8 encoded and open in Excel, Google Sheets & Numbers.
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
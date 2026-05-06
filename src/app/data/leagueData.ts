// ── Types ──────────────────────────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;       // Username / Tag
  shortName: string;  // Short tag (≤6 chars)
  realName: string;   // Full Name
  color: string;
  badge: string;      // Emoji badge
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  status: 'completed' | 'upcoming' | 'live';
  minute?: number;
}

export interface TeamStats {
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: ('W' | 'D' | 'L')[];
  rank: number;
}

export type TeamWithStats = Team & TeamStats;

// ── Compute all stats from matches (edit/delete auto-recalculates) ─────────
export function computeAllStats(teams: Team[], matches: Match[]): TeamWithStats[] {
  type RawStats = Omit<TeamStats, 'gd' | 'pts' | 'rank'>;
  const map = new Map<string, RawStats>();
  teams.forEach(t => map.set(t.id, { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, form: [] }));

  const done = [...matches]
    .filter(m => m.status === 'completed')
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const m of done) {
    const h = map.get(m.homeTeamId);
    const a = map.get(m.awayTeamId);
    if (!h || !a) continue;
    const hw = m.homeScore > m.awayScore;
    const aw = m.awayScore > m.homeScore;
    const dr = m.homeScore === m.awayScore;
    const hf: 'W' | 'D' | 'L' = hw ? 'W' : dr ? 'D' : 'L';
    const af: 'W' | 'D' | 'L' = aw ? 'W' : dr ? 'D' : 'L';
    map.set(m.homeTeamId, {
      mp: h.mp + 1, w: h.w + (hw ? 1 : 0), d: h.d + (dr ? 1 : 0), l: h.l + (!hw && !dr ? 1 : 0),
      gf: h.gf + m.homeScore, ga: h.ga + m.awayScore,
      form: [hf, ...h.form].slice(0, 5),
    });
    map.set(m.awayTeamId, {
      mp: a.mp + 1, w: a.w + (aw ? 1 : 0), d: a.d + (dr ? 1 : 0), l: a.l + (!aw && !dr ? 1 : 0),
      gf: a.gf + m.awayScore, ga: a.ga + m.homeScore,
      form: [af, ...a.form].slice(0, 5),
    });
  }

  const list: TeamWithStats[] = teams.map(t => {
    const s = map.get(t.id) || { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, form: [] };
    return { ...t, ...s, gd: s.gf - s.ga, pts: s.w * 3 + s.d, rank: 0 };
  });
  list.sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.gd !== a.gd ? b.gd - a.gd : b.gf - a.gf);
  return list.map((t, i) => ({ ...t, rank: i + 1 }));
}

// ── Initial data — empty on first boot, admin adds everything via UI ─────────
export const initialTeams: Team[] = [];
export const initialMatches: Match[] = [];
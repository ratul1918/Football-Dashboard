import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Team, Match, TeamWithStats, computeAllStats } from '../data/leagueData';
import { API_BASE, API_HEADERS } from '../config/supabase';

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...API_HEADERS, ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

interface LeagueContextType {
  teams: Team[];
  matches: Match[];
  standings: TeamWithStats[];
  loading: boolean;
  error: string | null;
  // Match operations
  addMatchResult: (homeTeamId: string, awayTeamId: string, homeScore: number, awayScore: number, date: string) => Promise<void>;
  editMatchResult: (matchId: string, homeScore: number, awayScore: number, date: string, status: 'completed' | 'upcoming') => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  // Player (team) operations
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  editTeam: (id: string, updates: Partial<Omit<Team, 'id'>>) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;
  // Admin reset
  resetAll: () => Promise<void>;
}

const LeagueContext = createContext<LeagueContextType | null>(null);

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const standings = useMemo(() => computeAllStats(teams, matches), [teams, matches]);

  // ── Bootstrap: migrate (wipes stale dummy data once), then load ───────────
  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        setError(null);

        // Migration is idempotent — only wipes data when schema version changes.
        // This is what clears the old dummy data on first run.
        await apiFetch('/migrate', { method: 'POST' });

        // Load current data
        const [fetchedTeams, fetchedMatches] = await Promise.all([
          apiFetch('/teams'),
          apiFetch('/matches'),
        ]);

        setTeams(fetchedTeams);
        setMatches(fetchedMatches);
      } catch (err: any) {
        console.error('Elite Pitch bootstrap error:', err);
        setError(`Failed to connect to database: ${err.message}`);
        setTeams([]);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  // ── Matches ───────────────────────────────────────────────────────────────
  const addMatchResult = useCallback(async (
    homeTeamId: string, awayTeamId: string,
    homeScore: number, awayScore: number, date: string,
  ) => {
    const created = await apiFetch('/matches', {
      method: 'POST',
      body: JSON.stringify({ homeTeamId, awayTeamId, homeScore, awayScore, date, status: 'completed' }),
    });
    setMatches(prev => [created, ...prev]);
  }, []);

  const editMatchResult = useCallback(async (
    matchId: string, homeScore: number, awayScore: number,
    date: string, status: 'completed' | 'upcoming',
  ) => {
    const updated = await apiFetch(`/matches/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify({ homeScore, awayScore, date, status }),
    });
    setMatches(prev => prev.map(m => m.id === matchId ? updated : m));
  }, []);

  const deleteMatch = useCallback(async (matchId: string) => {
    await apiFetch(`/matches/${matchId}`, { method: 'DELETE' });
    setMatches(prev => prev.filter(m => m.id !== matchId));
  }, []);

  // ── Players ───────────────────────────────────────────────────────────────
  const addTeam = useCallback(async (team: Omit<Team, 'id'>) => {
    const created = await apiFetch('/teams', {
      method: 'POST',
      body: JSON.stringify(team),
    });
    setTeams(prev => [...prev, created]);
  }, []);

  const editTeam = useCallback(async (id: string, updates: Partial<Omit<Team, 'id'>>) => {
    const updated = await apiFetch(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    setTeams(prev => prev.map(t => t.id === id ? updated : t));
  }, []);

  const removeTeam = useCallback(async (id: string) => {
    await apiFetch(`/teams/${id}`, { method: 'DELETE' });
    setTeams(prev => prev.filter(t => t.id !== id));
    setMatches(prev => prev.filter(m => m.homeTeamId !== id && m.awayTeamId !== id));
  }, []);

  // ── Admin Reset ───────────────────────────────────────────────────────────
  const resetAll = useCallback(async () => {
    await apiFetch('/reset', { method: 'POST' });
    setTeams([]);
    setMatches([]);
  }, []);

  return (
    <LeagueContext.Provider value={{
      teams, matches, standings, loading, error,
      addMatchResult, editMatchResult, deleteMatch,
      addTeam, editTeam, removeTeam,
      resetAll,
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider');
  return ctx;
}

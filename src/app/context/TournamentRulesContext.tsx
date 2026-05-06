import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE, API_HEADERS } from '../config/supabase';

export type SystemId = 'league' | 'ucl' | 'worldcup' | 'double-rr' | 'swiss' | 'custom';
export type FormatType = 'single-rr' | 'double-rr' | 'group-knockout' | 'swiss';
export type TiebreakerKey = 'points' | 'gd' | 'gf' | 'h2h' | 'wins' | 'away_goals' | 'alpha';

export interface TournamentRules {
  system: SystemId;
  tournamentName: string;
  season: string;
  format: FormatType;
  legs: 1 | 2;
  numGroups: number;
  teamsPerGroup: number;
  points: {
    win: number;
    draw: number;
    loss: number;
    bonusGoal: boolean;
    cleanSheetBonus: boolean;
  };
  tiebreakers: TiebreakerKey[];
  zones: {
    champion: number;
    knockout: number;
    playoff: number;
    relegation: number;
  };
  awayGoalsRule: boolean;
  extraTimeEnabled: boolean;
  penaltiesEnabled: boolean;
  maxPlayers: number;
}

export const DEFAULT_RULES: TournamentRules = {
  system: 'league',
  tournamentName: 'Elite Football Tournament',
  season: '2025–2026',
  format: 'single-rr',
  legs: 1,
  numGroups: 1,
  teamsPerGroup: 16,
  points: { win: 3, draw: 1, loss: 0, bonusGoal: false, cleanSheetBonus: false },
  tiebreakers: ['points', 'gd', 'gf', 'h2h', 'wins', 'alpha'],
  zones: { champion: 1, knockout: 4, playoff: 2, relegation: 2 },
  awayGoalsRule: false,
  extraTimeEnabled: false,
  penaltiesEnabled: false,
  maxPlayers: 16,
};

interface TournamentRulesContextType {
  rules: TournamentRules;
  setRules: (rules: TournamentRules) => void;
  saveRules: () => Promise<void>;
  saving: boolean;
}

const TournamentRulesContext = createContext<TournamentRulesContextType | null>(null);

export function TournamentRulesProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRulesState] = useState<TournamentRules>(DEFAULT_RULES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/rules`, { headers: API_HEADERS });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && !data.error) {
            setRulesState(prev => ({ ...prev, ...data }));
          }
        }
      } catch (err) {
        console.error('TournamentRulesContext load error:', err);
      }
    }
    load();
  }, []);

  const setRules = useCallback((r: TournamentRules) => setRulesState(r), []);

  const saveRules = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/rules`, {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify(rules),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('Failed to save tournament rules:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [rules]);

  return (
    <TournamentRulesContext.Provider value={{ rules, setRules, saveRules, saving }}>
      {children}
    </TournamentRulesContext.Provider>
  );
}

export function useTournamentRules() {
  const ctx = useContext(TournamentRulesContext);
  if (!ctx) throw new Error('useTournamentRules must be used within TournamentRulesProvider');
  return ctx;
}

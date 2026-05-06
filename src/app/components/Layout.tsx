import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { LeagueProvider } from '../context/LeagueContext';
import { TournamentRulesProvider } from '../context/TournamentRulesContext';
import { DBLoader } from './DBLoader';

export function Layout() {
  return (
    <TournamentRulesProvider>
      <LeagueProvider>
        <DBLoader>
          <div
            className="flex min-h-screen"
            style={{
              background: 'linear-gradient(135deg, #060a14 0%, #0a1020 50%, #080d1c 100%)',
              fontFamily: 'Lexend, sans-serif',
            }}
          >
            {/* Ambient Background Effects */}
            <div
              style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
                background: `
                  radial-gradient(ellipse 60% 40% at 20% 20%, rgba(59,130,246,0.06) 0%, transparent 60%),
                  radial-gradient(ellipse 50% 40% at 80% 80%, rgba(34,197,94,0.04) 0%, transparent 60%)
                `,
              }}
            />
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen relative z-10 overflow-x-hidden pb-20 lg:pb-0">
              <Outlet />
            </main>
          </div>
        </DBLoader>
      </LeagueProvider>
    </TournamentRulesProvider>
  );
}
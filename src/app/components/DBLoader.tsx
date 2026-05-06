import { useLeague } from '../context/LeagueContext';

export function DBLoader({ children }: { children: React.ReactNode }) {
  const { loading, error } = useLeague();

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6" style={{ background: '#060d1f' }}>
        {/* Animated logo */}
        <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
          <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }} />
          <span style={{ fontSize: 36 }}>⚽</span>
          {/* Spinning ring */}
          <svg className="absolute inset-0" width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="2" />
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="56 170"
              strokeLinecap="round"
              style={{ transformOrigin: '40px 40px', animation: 'spin 1.1s linear infinite' }}
            />
          </svg>
        </div>
        <div className="text-center">
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: 'Lexend, sans-serif', letterSpacing: '-0.01em' }}>
            Elite Pitch
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 6, fontFamily: 'Lexend, sans-serif' }}>
            Connecting to database…
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 p-6" style={{ background: '#060d1f' }}>
        <div className="rounded-2xl p-6 max-w-md w-full text-center" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif', marginBottom: 8 }}>
            Database Connection Error
          </div>
          <div style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
            {error}
          </div>
          <div style={{ color: '#6b7280', fontSize: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
            Showing cached data — changes won't persist until connection is restored.
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            color: '#3B82F6', fontSize: 13, fontWeight: 600,
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 10, padding: '8px 20px', cursor: 'pointer',
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

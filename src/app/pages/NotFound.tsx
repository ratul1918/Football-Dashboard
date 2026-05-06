import { useNavigate } from 'react-router';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 p-6"
      style={{ background: 'linear-gradient(135deg, #060a14 0%, #0a1020 50%, #080d1c 100%)', fontFamily: 'Lexend, sans-serif' }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />

      <div
        className="rounded-2xl p-8 max-w-md w-full text-center relative"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-5">
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ width: 72, height: 72, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 30px rgba(239,68,68,0.1)' }}
          >
            <AlertTriangle size={32} color="#ef4444" />
          </div>
        </div>

        {/* Error code */}
        <div
          style={{ color: '#3B82F6', fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 8 }}
        >
          404
        </div>

        {/* Headline */}
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Page Not Found
        </div>

        {/* Sub-text */}
        <div style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          The page you're looking for doesn't exist or has been moved.
          Head back to the dashboard to manage your tournament.
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-xl px-6 py-3 mx-auto transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #7c3aed)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 0 24px rgba(59,130,246,0.35)',
          }}
        >
          <Home size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Branding */}
      <div style={{ color: '#374151', fontSize: 12 }}>
        ⚽ Elite Pitch · Tournament Management
      </div>
    </div>
  );
}

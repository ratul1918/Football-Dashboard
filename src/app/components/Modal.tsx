import { ReactNode, CSSProperties, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function Modal({ title, subtitle, onClose, children, width = 560 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full rounded-2xl overflow-hidden flex flex-col"
        style={{
          maxWidth: width,
          maxHeight: '90vh',
          background: 'rgba(10,16,36,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700, fontFamily: 'Lexend, sans-serif', lineHeight: 1.2 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg flex items-center justify-center transition-all hover:bg-white/10 shrink-0 ml-4"
            style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          >
            <X size={15} color="#9ca3af" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex flex-col gap-4" style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Shared styled input ───────────────────────────────────────────────────
export const modalInputStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10, color: '#fff',
  padding: '11px 14px', fontSize: 13,
  fontFamily: 'Lexend, sans-serif', outline: 'none', width: '100%',
};

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>
      {children}
    </div>
  );
}

export function ModalBtn({
  children, onClick, variant = 'primary', type = 'button', disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const bg = variant === 'primary'
    ? 'linear-gradient(135deg, #3B82F6, #7c3aed)'
    : variant === 'danger'
    ? 'rgba(239,68,68,0.12)'
    : 'rgba(255,255,255,0.07)';
  const border = variant === 'primary'
    ? '1px solid rgba(59,130,246,0.4)'
    : variant === 'danger'
    ? '1px solid rgba(239,68,68,0.3)'
    : '1px solid rgba(255,255,255,0.12)';
  const color = variant === 'primary' ? '#fff' : variant === 'danger' ? '#ef4444' : '#d1d5db';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 transition-all hover:opacity-85"
      style={{
        background: bg, border, color,
        fontSize: 13, fontWeight: 600, fontFamily: 'Lexend, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: variant === 'primary' ? '0 0 16px rgba(59,130,246,0.25)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}
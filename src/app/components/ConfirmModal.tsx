import { Modal, ModalBtn } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  variant?: 'danger' | 'warning';
  saving?: boolean;
}

export function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onClose, variant = 'danger', saving = false }: Props) {
  const color = variant === 'danger' ? '#ef4444' : '#f59e0b';
  return (
    <Modal title="" onClose={onClose} width={440}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{ width: 60, height: 60, background: `${color}15`, border: `2px solid ${color}30` }}
        >
          <AlertTriangle size={28} color={color} />
        </div>
        <div>
          <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, fontFamily: 'Lexend, sans-serif', marginBottom: 8 }}>
            {title}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6 }}>{message}</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <ModalBtn variant="secondary" onClick={onClose} disabled={saving}>Cancel</ModalBtn>
        <ModalBtn
          variant={variant === 'danger' ? 'danger' : 'secondary'}
          onClick={onConfirm}
          disabled={saving}
        >
          {saving ? '⏳ Saving…' : confirmLabel}
        </ModalBtn>
      </div>
    </Modal>
  );
}
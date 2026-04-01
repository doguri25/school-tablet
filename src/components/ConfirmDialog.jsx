import { useEffect, useRef } from 'react';

// onSecondary / secondaryLabel: 선택적 두 번째 버튼 (반납/취소 등 두 가지 액션이 필요할 때)
export default function ConfirmDialog({
  message,
  onConfirm, confirmLabel = '확인',
  onSecondary, secondaryLabel,
  onCancel, cancelLabel = '닫기',
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onConfirm, onCancel]);

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={e => e.stopPropagation()}>
        <div style={styles.icon}>⚠️</div>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
          {onSecondary && (
            <button style={styles.secondaryBtn} onClick={onSecondary}>{secondaryLabel}</button>
          )}
          <button ref={confirmRef} style={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  dialog: {
    background: '#fff', borderRadius: 14, padding: '32px 32px 24px',
    minWidth: 300, maxWidth: 380, textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  icon: { fontSize: 36, marginBottom: 12 },
  message: {
    fontSize: 16, color: '#1F2937', lineHeight: 1.6,
    marginBottom: 24, whiteSpace: 'pre-line',
  },
  buttons: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  cancelBtn: {
    padding: '10px 20px', borderRadius: 8, background: '#F3F4F6',
    color: '#374151', fontWeight: 600, fontSize: 15,
    border: '2px solid #E5E7EB', cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '10px 20px', borderRadius: 8, background: '#FEF2F2',
    color: '#DC2626', fontWeight: 600, fontSize: 15,
    border: '2px solid #FECACA', cursor: 'pointer',
  },
  confirmBtn: {
    padding: '10px 20px', borderRadius: 8, background: '#1E40AF',
    color: '#fff', fontWeight: 600, fontSize: 15,
    border: '2px solid #1E40AF', cursor: 'pointer',
  },
};

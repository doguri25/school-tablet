const CLASS_COLORS = {
  1: { bg: '#EFF6FF', border: '#BFDBFE', active: '#1D4ED8', text: '#1D4ED8', name: '1반' },
  2: { bg: '#F0FDF4', border: '#BBF7D0', active: '#15803D', text: '#15803D', name: '2반' },
  3: { bg: '#FAF5FF', border: '#E9D5FF', active: '#7E22CE', text: '#7E22CE', name: '3반' },
  4: { bg: '#FFF7ED', border: '#FED7AA', active: '#C2410C', text: '#C2410C', name: '4반' },
  5: { bg: '#FFF1F2', border: '#FECDD3', active: '#BE123C', text: '#BE123C', name: '5반' },
  6: { bg: '#F0FDFA', border: '#99F6E4', active: '#0F766E', text: '#0F766E', name: '6반' },
};

export default function ClassSelector({ selectedClass, onSelectClass }) {
  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>내 반 선택</span>
      <div style={styles.pills}>
        {[1, 2, 3, 4, 5, 6].map(num => {
          const c = CLASS_COLORS[num];
          const isActive = selectedClass === num;
          return (
            <button
              key={num}
              onClick={() => onSelectClass(num)}
              style={{
                ...styles.pill,
                background: isActive ? c.active : c.bg,
                border: `1.5px solid ${isActive ? c.active : c.border}`,
                color: isActive ? '#fff' : c.text,
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? `0 2px 8px ${c.active}44` : 'none',
              }}
            >
              {isActive && <span style={styles.dot}>✓ </span>}
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const LABEL_WIDTH = 60;

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 8px',
    background: '#fff',
    borderBottom: '1px solid #F3F4F6',
  },
  label: {
    width: LABEL_WIDTH,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 600,
    color: '#9CA3AF',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  pills: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 6,
  },
  pill: {
    padding: '6px 0',
    borderRadius: 10,
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    letterSpacing: '-0.2px',
    textAlign: 'center',
  },
  dot: {
    fontSize: 11,
  },
};

export { LABEL_WIDTH };

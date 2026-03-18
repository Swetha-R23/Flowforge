const COLORS = {
  active:       { bg: '#00d68f22', color: '#00d68f', border: '#00d68f44' },
  inactive:     { bg: '#ff4d6d22', color: '#ff4d6d', border: '#ff4d6d44' },
  completed:    { bg: '#00d68f22', color: '#00d68f', border: '#00d68f44' },
  failed:       { bg: '#ff4d6d22', color: '#ff4d6d', border: '#ff4d6d44' },
  pending:      { bg: '#ffd16622', color: '#ffd166', border: '#ffd16644' },
  in_progress:  { bg: '#4d79ff22', color: '#4d79ff', border: '#4d79ff44' },
  canceled:     { bg: '#5a5a7222', color: '#9898b0', border: '#2a2a38' },
  task:         { bg: '#4d79ff22', color: '#4d79ff', border: '#4d79ff44' },
  approval:     { bg: '#b48efe22', color: '#b48efe', border: '#b48efe44' },
  notification: { bg: '#ffd16622', color: '#ffd166', border: '#ffd16644' },
}

export default function Badge({ value }) {
  const s = COLORS[value] || { bg: '#2a2a38', color: '#9898b0', border: '#363648' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      fontFamily: 'var(--mono)', letterSpacing: '.05em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {value}
    </span>
  )
}
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      height: 56, background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text)',
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{subtitle}</div>
        )}
      </div>
      {action && <div style={{ marginLeft: 'auto' }}>{action}</div>}
    </div>
  )
}
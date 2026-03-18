const VARIANTS = {
  primary:   { background: 'var(--accent)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--surface3)', color: 'var(--text)', border: '1px solid var(--border2)' },
  ghost:     { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' },
  danger:    { background: 'transparent', color: '#ff4d6d', border: '1px solid #ff4d6d44' },
  green:     { background: 'var(--green)', color: '#000', border: 'none' },
  blue:      { background: 'var(--blue)', color: '#fff', border: 'none' },
}

export default function Btn({ children, variant = 'ghost', size = 'md', onClick, disabled, type = 'button', style = {} }) {
  const v = VARIANTS[variant] || VARIANTS.ghost
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: size === 'sm' ? '4px 10px' : '7px 14px',
        borderRadius: 'var(--radius)',
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 500, fontFamily: 'var(--sans)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
        ...v, ...style,
      }}
    >
      {children}
    </button>
  )
}
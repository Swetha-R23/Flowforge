import { Outlet, NavLink } from 'react-router-dom'

const navStyle = ({ isActive }) => ({
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '9px 12px', borderRadius: 8,
  color: isActive ? 'var(--accent)' : 'var(--text2)',
  background: isActive ? 'var(--surface3)' : 'transparent',
  border: isActive ? '1px solid var(--border2)' : '1px solid transparent',
  fontSize: 13, fontWeight: 500, marginBottom: 2,
  transition: 'all 0.15s', textDecoration: 'none',
})

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220, background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 100,
      }}>
        <div style={{
          padding: '20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)',
            borderRadius: 6, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
          }}>⚙</div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 }}>
            Flow<span style={{ color: 'var(--accent)' }}>Forge</span>
          </span>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {[
            ['/', '◈', 'Dashboard'],
            ['/workflows', '⬡', 'Workflows'],
            ['/executions', '▶', 'Executions'],
            ['/audit', '⊟', 'Audit Log'],
          ].map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === '/'} style={navStyle}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>
                {icon}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{
          padding: 16, borderTop: '1px solid var(--border)',
          fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)',
        }}>
          v1.0.0 · FlowForge Engine
        </div>
      </aside>

      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}
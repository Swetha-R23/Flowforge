import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { workflowsApi, executionsApi } from '../services/api'
import PageHeader from './PageHeader'
import Badge from './Badge'
import Btn from './Btn'

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: wfData } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsApi.list(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  })

  const { data: exData } = useQuery({
    queryKey: ['executions'],
    queryFn: () => executionsApi.list(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  })

  // Handle both paginated {results:[]} and direct array []
  const wfs = wfData?.data?.results || wfData?.data || []
  const exs = exData?.data?.results || exData?.data || []

  const completed = exs.filter(e => e.status === 'completed').length
  const failed = exs.filter(e => e.status === 'failed').length

  const Stat = ({ value, label, color, sub }) => (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 20,
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 32,
        fontWeight: 700, color: color || 'var(--text)',
      }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>{sub}</div>}
    </div>
  )

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="FlowForge Workflow Engine" />
      <div style={{ padding: 24 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: 16, marginBottom: 24,
        }}>
          <Stat value={wfs.length} label="Total Workflows"
                sub={`${wfs.filter(w => w.is_active).length} active`} />
          <Stat value={exs.length} label="Total Executions"
                sub={`✓ ${completed} completed`} />
          <Stat value={failed} label="Failed Executions" color="var(--accent)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16,
            }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', color: 'var(--text2)',
              }}>Recent Executions</span>
              <Btn size="sm" onClick={() => navigate('/executions')}>View All</Btn>
            </div>
            <table>
              <thead>
                <tr><th>Workflow</th><th>Status</th><th>Started</th></tr>
              </thead>
              <tbody>
                {exs.slice(0, 5).map(e => (
                  <tr key={e.id} style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/executions/${e.id}`)}>
                    <td><strong>{e.workflow_name}</strong></td>
                    <td><Badge value={e.status} /></td>
                    <td style={{ color: 'var(--text3)', fontSize: 11 }}>
                      {new Date(e.started_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {exs.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{
                      textAlign: 'center', color: 'var(--text3)', padding: 20,
                    }}>No executions yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16,
            }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', color: 'var(--text2)',
              }}>Workflows</span>
              <Btn size="sm" onClick={() => navigate('/workflows')}>Manage</Btn>
            </div>
            {wfs.map(wf => (
              <div key={wf.id} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{wf.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    v{wf.version} · {wf.step_count} steps
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge value={wf.is_active ? 'active' : 'inactive'} />
                  <Btn variant="primary" size="sm"
                       onClick={() => navigate(`/workflows/${wf.id}/edit`)}>
                    Edit
                  </Btn>
                </div>
              </div>
            ))}
            {wfs.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 30 }}>
                No workflows yet.{' '}
                <span style={{ color: 'var(--accent)', cursor: 'pointer' }}
                      onClick={() => navigate('/workflows/new')}>
                  Create one →
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
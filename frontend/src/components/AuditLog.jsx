import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { executionsApi } from '../services/api'
import PageHeader from './PageHeader'
import Badge from './Badge'
import Btn from './Btn'

export default function AuditLog() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: () => executionsApi.list(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  // Change this line in both files
  const exs = data?.data?.results || data?.data || []

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle={`${exs.length} execution records`}
      />
      <div style={{ padding: 24 }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
              Loading...
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Execution ID</th><th>Workflow</th><th>Version</th>
                  <th>Status</th><th>Steps</th><th>Triggered By</th>
                  <th>Start Time</th><th>End Time</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exs.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{
                      textAlign: 'center', padding: 40, color: 'var(--text3)',
                    }}>
                      No audit records yet.
                    </td>
                  </tr>
                )}
                {exs.map(e => (
                  <tr key={e.id}>
                    <td style={{
                      fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)',
                    }}>
                      {e.id}
                    </td>
                    <td><strong>{e.workflow_name}</strong></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                      v{e.workflow_version}
                    </td>
                    <td><Badge value={e.status} /></td>
                    <td>{e.logs?.length || 0}</td>
                    <td style={{ color: 'var(--text3)' }}>
                      {e.triggered_by || 'anonymous'}
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 11 }}>
                      {new Date(e.started_at).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 11 }}>
                      {e.ended_at
                        ? new Date(e.ended_at).toLocaleString() : '—'}
                    </td>
                    <td>
                      <Btn size="sm"
                           onClick={() => navigate(`/executions/${e.id}`)}>
                        View Logs
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
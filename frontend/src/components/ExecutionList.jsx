import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { executionsApi } from '../services/api'
import PageHeader from './PageHeader'
import Badge from './Badge'
import Btn from './Btn'

export default function ExecutionList() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: () => executionsApi.list(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 10000,
  })

  const cancelMut = useMutation({
    mutationFn: id => executionsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries(['executions'])
      toast.success('Execution canceled')
    },
    onError: () => toast.error('Cancel failed'),
  })

  const retryMut = useMutation({
    mutationFn: id => executionsApi.retry(id),
    onSuccess: () => {
      qc.invalidateQueries(['executions'])
      toast.success('Retry triggered')
    },
    onError: () => toast.error('Retry failed'),
  })

  // Change this line in both files
  const exs = data?.data?.results || data?.data || []

  return (
    <div>
      <PageHeader title="Executions" subtitle={`${exs.length} total executions`} />
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
                  <th>ID</th><th>Workflow</th><th>Version</th>
                  <th>Status</th><th>Steps</th><th>Triggered By</th>
                  <th>Started</th><th>Ended</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exs.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{
                      textAlign: 'center', padding: 40, color: 'var(--text3)',
                    }}>
                      No executions yet. Run a workflow to see results here.
                    </td>
                  </tr>
                )}
                {exs.map(e => (
                  <tr key={e.id}>
                    <td style={{
                      fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)',
                    }}>
                      {e.id.slice(0, 8)}…
                    </td>
                    <td><strong>{e.workflow_name}</strong></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                      v{e.workflow_version}
                    </td>
                    <td><Badge value={e.status} /></td>
                    <td>{e.logs?.length || 0}</td>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>
                      {e.triggered_by || '—'}
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 11 }}>
                      {new Date(e.started_at).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 11 }}>
                      {e.ended_at ? new Date(e.ended_at).toLocaleString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <Btn size="sm"
                             onClick={() => navigate(`/executions/${e.id}`)}>
                          View Logs
                        </Btn>
                        {e.status === 'failed' && (
                          <Btn size="sm" variant="blue"
                               onClick={() => retryMut.mutate(e.id)}>
                            ↺ Retry
                          </Btn>
                        )}
                        {['pending', 'in_progress'].includes(e.status) && (
                          <Btn size="sm" variant="danger"
                               onClick={() => cancelMut.mutate(e.id)}>
                            Cancel
                          </Btn>
                        )}
                      </div>
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
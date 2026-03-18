import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { executionsApi } from '../services/api'
import Badge from './Badge'
import Btn from './Btn'

export default function ExecutionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionsApi.get(id),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  const exec = data?.data

  if (isLoading) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>
      Loading...
    </div>
  )
  if (!exec) return null

  const statusColor = {
    completed: 'var(--green)',
    failed: 'var(--accent)',
    in_progress: 'var(--blue)',
    pending: 'var(--yellow)',
    canceled: 'var(--text3)',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14' }}>

      {/* Page Header */}
      <div style={{
        padding: '28px 40px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.1em',
            color: 'var(--text3)', marginBottom: 4,
          }}>
            EXECUTION: {exec.id?.slice(0, 8).toUpperCase()}…
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            {exec.workflow_name} · v{exec.workflow_version}
          </div>
        </div>
        <button
          onClick={() => navigate('/executions')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: 'transparent', border: '1px solid #2a2a45',
            color: '#9898b0', fontSize: 14, cursor: 'pointer',
          }}
        >Back</button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 40px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 20, marginBottom: 20,
        }}>

          {/* Execution Info */}
          <div style={{
            background: '#131320', border: '1px solid #1e1e35',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.08em',
              color: 'var(--text3)', marginBottom: 16,
            }}>Execution Info</div>

            {[
              ['Status', <Badge value={exec.status} />],
              ['Workflow', exec.workflow_name],
              ['Version', `v${exec.workflow_version}`],
              ['Triggered By', exec.triggered_by || 'anonymous'],
              ['Started', new Date(exec.started_at).toLocaleString()],
              ['Ended', exec.ended_at
                ? new Date(exec.ended_at).toLocaleString() : '—'],
              ['Retries', exec.retries],
              ['Steps Run', exec.logs?.length || 0],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: '1px solid #1e1e35',
                fontSize: 13,
              }}>
                <span style={{ color: '#6b6b8a', fontWeight: 500 }}>{k}</span>
                <span style={{ color: '#e8e8f0' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Input Data */}
          <div style={{
            background: '#131320', border: '1px solid #1e1e35',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.08em',
              color: 'var(--text3)', marginBottom: 16,
            }}>Input Data</div>

            {exec.data && Object.keys(exec.data).length > 0 ? (
              Object.entries(exec.data).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px', marginBottom: 8,
                  background: '#0d0d1a',
                  border: '1px solid #1e1e35',
                  borderRadius: 10,
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: '#6b6b8a',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                  }}>
                    {key}
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: '#e8e8f0',
                    background: '#1e1e35',
                    padding: '4px 14px',
                    borderRadius: 8,
                    fontFamily: typeof value === 'number'
                      ? 'var(--mono)' : 'var(--sans)',
                  }}>
                    {String(value)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#6b6b8a', fontSize: 13 }}>
                No input data
              </div>
            )}
          </div>
        </div>

        {/* Step Execution Logs */}
        <div style={{
          background: '#131320', border: '1px solid #1e1e35',
          borderRadius: 16, padding: 24,
        }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.08em',
            color: 'var(--text3)', marginBottom: 20,
          }}>
            Step Execution Logs ({exec.logs?.length || 0})
          </div>

          {(exec.logs || []).map((log, i) => (
            <div key={i} style={{
              borderLeft: `3px solid ${statusColor[log.status] || '#2a2a45'}`,
              padding: '16px 20px', marginBottom: 14,
              borderRadius: '0 12px 12px 0',
              background: '#0d0d1a',
              border: '1px solid #1e1e35',
              borderLeft: `3px solid ${statusColor[log.status] || '#2a2a45'}`,
            }}>
              {/* Step Header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#1e1e35', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace', fontSize: 11,
                    color: '#6b6b8a', flexShrink: 0,
                  }}>{i + 1}</div>
                  <strong style={{ color: '#e8e8f0', fontSize: 14 }}>
                    {log.step_name}
                  </strong>
                  <Badge value={log.step_type} />
                </div>
                <Badge value={log.status} />
              </div>

              {/* Rules Evaluated */}
              {log.evaluated_rules?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    fontSize: 11, color: '#6b6b8a',
                    marginBottom: 6, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>
                    Rules evaluated:
                  </div>
                  {log.evaluated_rules.map((r, j) => (
                    <div key={j} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'monospace', fontSize: 12,
                      padding: '5px 10px', marginBottom: 4,
                      background: '#13132a',
                      borderRadius: 6,
                      border: `1px solid ${r.result ? '#00d68f22' : '#ff4d6d22'}`,
                    }}>
                      <span style={{ color: '#9898b0' }}>{r.rule}</span>
                      <span style={{
                        color: r.result ? '#00d68f' : '#ff4d6d',
                        marginLeft: 16, fontWeight: 700,
                        fontSize: 11,
                      }}>
                        {r.result ? '✓ true' : '✗ false'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Step */}
              {log.selected_next_step && (
                <div style={{
                  fontSize: 12, color: '#6b6b8a', marginTop: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>→ Next:</span>
                  <span style={{
                    color: '#e8e8f0', fontWeight: 600,
                    background: '#1e1e35', padding: '2px 10px',
                    borderRadius: 6,
                  }}>
                    {log.selected_next_step}
                  </span>
                </div>
              )}

              {/* Workflow Complete */}
              {!log.selected_next_step && log.status === 'completed' && (
                <div style={{
                  fontSize: 12, color: '#00d68f', marginTop: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  ✓ Workflow complete
                </div>
              )}

              {/* Approver */}
              {log.approver_id && (
                <div style={{
                  fontSize: 12, color: '#6b6b8a', marginTop: 6,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>Approver:</span>
                  <span style={{
                    fontFamily: 'monospace', color: '#9898b0',
                    background: '#1e1e35', padding: '2px 8px', borderRadius: 4,
                  }}>
                    {log.approver_id}
                  </span>
                </div>
              )}

              {/* Error */}
              {log.error_message && (
                <div style={{
                  fontSize: 12, color: '#ff4d6d', marginTop: 8,
                  padding: '8px 12px', background: '#2a1520',
                  borderRadius: 8, border: '1px solid #ff4d6d33',
                }}>
                  ⚠ {log.error_message}
                </div>
              )}

              {/* Duration */}
              <div style={{
                fontSize: 11, color: '#4a4a6a', marginTop: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>
                  {new Date(log.started_at).toLocaleTimeString()} →{' '}
                  {new Date(log.ended_at).toLocaleTimeString()}
                </span>
                {log.duration_seconds != null && (
                  <span style={{
                    background: '#1e1e35', padding: '1px 8px',
                    borderRadius: 4, fontFamily: 'monospace',
                    color: '#6b6b8a',
                  }}>
                    {log.duration_seconds}s
                  </span>
                )}
              </div>
            </div>
          ))}

          {exec.logs?.length === 0 && (
            <div style={{
              color: '#4a4a6a', textAlign: 'center', padding: 40,
              fontSize: 13,
            }}>
              No step logs available.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
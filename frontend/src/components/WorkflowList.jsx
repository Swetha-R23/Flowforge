import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { workflowsApi } from '../services/api'
import PageHeader from './PageHeader'
import Badge from './Badge'
import Btn from './Btn'

// ── Execute Modal ─────────────────────────────────────────────────────────────
function ExecuteModal({ workflowId, workflowName, onClose }) {
  const [execData, setExecData] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Fetch full workflow details to get input_schema
  const { data: wfData, isLoading: schemaLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => workflowsApi.get(workflowId),
    staleTime: 0,
  })

  const fullWorkflow = wfData?.data
  const inputSchema = fullWorkflow?.input_schema || {}

  const handleExecute = async () => {
    setLoading(true)
    try {
      const res = await workflowsApi.execute(workflowId, execData)
      toast.success(`Execution started — status: ${res.data.status}`)
      onClose()
      navigate(`/executions/${res.data.id}`)
    } catch (err) {
      const errors = err.response?.data?.errors
      toast.error(errors ? errors.join(', ') : 'Execution failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: '#0d0d1a', border: '1px solid #2a2a45',
    borderRadius: 12, color: '#e8e8f0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#000b', zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#1a1a2e', border: '1px solid #2a2a45',
        borderRadius: 16, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0' }}>
            Execute: {workflowName}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: '#9898b0', fontSize: 20, cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 20, paddingBottom: 16,
            borderBottom: '1px solid #1e1e35',
          }}>
            <div style={{
              width: 36, height: 36, background: '#1e1e35',
              borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20,
            }}>🧾</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e8e8f0' }}>
              Input Data
            </div>
          </div>

          {/* Loading state */}
          {schemaLoading && (
            <div style={{
              textAlign: 'center', padding: 30,
              color: '#6b6b8a', fontSize: 13,
            }}>
              Loading fields...
            </div>
          )}

          {/* Fields */}
          {!schemaLoading && Object.entries(inputSchema).map(([key, cfg]) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#e8e8f0',
              }}>
                <span>{key}</span>
                {cfg.required && (
                  <span style={{ color: '#ff4d6d' }}>*</span>
                )}
                <span style={{ color: '#6b6b8a', fontSize: 12 }}>
                  ({cfg.type})
                </span>
              </div>

              {cfg.allowed_values ? (
                <select
                  value={execData[key] || ''}
                  onChange={e => setExecData(p => ({ ...p, [key]: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">-- Select --</option>
                  {cfg.allowed_values.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              ) : cfg.type === 'boolean' ? (
                <select
                  value={execData[key] ?? ''}
                  onChange={e => setExecData(p => ({
                    ...p, [key]: e.target.value === 'true'
                  }))}
                  style={inputStyle}
                >
                  <option value="">-- Select --</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  type={cfg.type === 'number' ? 'number' : 'text'}
                  value={execData[key] || ''}
                  onChange={e => setExecData(p => ({
                    ...p,
                    [key]: cfg.type === 'number'
                      ? parseFloat(e.target.value) : e.target.value,
                  }))}
                  placeholder={`Enter ${key}...`}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#7c5cbf'}
                  onBlur={e => e.target.style.borderColor = '#2a2a45'}
                />
              )}
            </div>
          ))}

          {!schemaLoading && Object.keys(inputSchema).length === 0 && (
            <div style={{
              textAlign: 'center', padding: 20,
              color: '#6b6b8a', fontSize: 13,
            }}>
              No input fields defined for this workflow.
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleExecute}
            disabled={loading || schemaLoading}
            style={{
              width: '100%', padding: '16px',
              background: '#00d68f', border: 'none',
              borderRadius: 12, color: '#000',
              fontSize: 15, fontWeight: 700,
              cursor: loading || schemaLoading ? 'not-allowed' : 'pointer',
              opacity: loading || schemaLoading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading ? 'Starting...' : '▶ Start Execution'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WorkflowList() {
  const [search, setSearch] = useState('')
  const [executeWorkflow, setExecuteWorkflow] = useState(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['workflows', search],
    queryFn: () => workflowsApi.list({ search }),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  })

  const deleteMut = useMutation({
    mutationFn: id => workflowsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries(['workflows'])
      toast.success('Workflow deleted')
    },
    onError: () => toast.error('Delete failed'),
  })

  const wfs = data?.data?.results || data?.data || []

  return (
    <div>
      <PageHeader
        title="Workflows"
        action={
          <Btn variant="primary" onClick={() => navigate('/workflows/new')}>
            + New Workflow
          </Btn>
        }
      />
      <div style={{ padding: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 12px', maxWidth: 280,
          }}>
            <span style={{ color: 'var(--text3)' }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search workflows..."
              style={{
                border: 'none', background: 'none',
                padding: 0, width: '100%', outline: 'none',
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            {wfs.length} workflow{wfs.length !== 1 ? 's' : ''}
          </span>
        </div>

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
                  <th>Name</th><th>Steps</th><th>Version</th>
                  <th>Status</th><th>Updated</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wfs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{
                      textAlign: 'center', padding: 40, color: 'var(--text3)',
                    }}>
                      No workflows found. Create your first one!
                    </td>
                  </tr>
                )}
                {wfs.map(wf => (
                  <tr key={wf.id}>
                    <td>
                      <strong>{wf.name}</strong><br />
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 10,
                        color: 'var(--text3)',
                      }}>{wf.id}</span>
                    </td>
                    <td>{wf.step_count}</td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 12,
                        background: 'var(--surface3)',
                        padding: '2px 6px', borderRadius: 4,
                      }}>v{wf.version}</span>
                    </td>
                    <td>
                      <Badge value={wf.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td style={{ color: 'var(--text3)', fontSize: 11 }}>
                      {new Date(wf.updated_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* Edit */}
                        <Btn
                          size="sm"
                          onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                        >
                          Edit
                        </Btn>

                        {/* Execute */}
                        <button
                          onClick={() => setExecuteWorkflow(wf)}
                          style={{
                            padding: '4px 12px', borderRadius: 8,
                            background: '#1a3a2a', border: '1px solid #00d68f44',
                            color: '#00d68f', fontSize: 12,
                            cursor: 'pointer', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          ▶ Run
                        </button>

                        {/* Delete */}
                        <Btn
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (confirm('Delete this workflow and all its data?')) {
                              deleteMut.mutate(wf.id)
                            }
                          }}
                        >
                          Delete
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Execute Modal */}
      {executeWorkflow && (
        <ExecuteModal
          workflowId={executeWorkflow.id}
          workflowName={executeWorkflow.name}
          onClose={() => setExecuteWorkflow(null)}
        />
      )}
    </div>
  )
}
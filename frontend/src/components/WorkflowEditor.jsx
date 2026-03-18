import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { workflowsApi, stepsApi, rulesApi } from '../services/api'
import Badge from './Badge'
import Btn from './Btn'

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
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
        borderRadius: 16, width: '100%',
        maxWidth: wide ? 700 : 520, maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{
          padding: '20px 24px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0' }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: '#9898b0', fontSize: 20, cursor: 'pointer',
          }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ title, subtitle, action, children }) {
  return (
    <div style={{
      background: '#131320', border: '1px solid #1e1e35',
      borderRadius: 16, padding: 28, marginBottom: 20,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 20,
      }}>
        <div>
          <div style={{
            fontSize: 18, fontWeight: 700,
            color: '#e8e8f0', marginBottom: 4,
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 13, color: '#6b6b8a' }}>{subtitle}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Field Label ───────────────────────────────────────────────────────────────
function FieldLabel({ label, required }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: '#6b6b8a',
      textTransform: 'uppercase', letterSpacing: '.08em',
      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {label}
      {required && <span style={{ color: '#ff4d6d' }}>*</span>}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
          background: checked ? '#7c5cbf' : '#2a2a45',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
        }} />
      </div>
      <span style={{ fontSize: 14, color: '#e8e8f0' }}>{label}</span>
    </div>
  )
}

// ── Schema Builder ────────────────────────────────────────────────────────────
function SchemaBuilder({ fields, onChange }) {
  const addField = () => {
    onChange([...fields, {
      name: '', type: 'string', required: false, allowed_values: ''
    }])
  }

  const removeField = (i) => onChange(fields.filter((_, idx) => idx !== i))

  const updateField = (i, key, value) =>
    onChange(fields.map((f, idx) => idx === i ? { ...f, [key]: value } : f))

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#0d0d1a', border: '1px solid #2a2a45',
    borderRadius: 10, color: '#e8e8f0', fontSize: 13, outline: 'none',
  }

  return (
    <div>
      {fields.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 120px 1.5fr 40px',
          gap: 10, marginBottom: 8,
        }}>
          {['FIELD NAME', 'TYPE', 'REQUIRED', 'ALLOWED VALUES', ''].map(h => (
            <div key={h} style={{
              fontSize: 10, fontWeight: 600, color: '#6b6b8a',
              textTransform: 'uppercase', letterSpacing: '.07em',
            }}>{h}</div>
          ))}
        </div>
      )}

      {fields.map((field, index) => (
        <div key={index} style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 120px 1.5fr 40px',
          gap: 10, marginBottom: 10, alignItems: 'center',
        }}>
          <input
            value={field.name}
            onChange={e => updateField(index, 'name', e.target.value)}
            placeholder="e.g. amount"
            style={inputStyle}
          />
          <select
            value={field.type}
            onChange={e => updateField(index, 'type', e.target.value)}
            style={inputStyle}
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
          </select>

          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 14px', background: '#0d0d1a',
              border: '1px solid #2a2a45', borderRadius: 10, cursor: 'pointer',
            }}
            onClick={() => updateField(index, 'required', !field.required)}
          >
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: field.required ? '#7c5cbf' : 'transparent',
              border: `2px solid ${field.required ? '#7c5cbf' : '#4a4a6a'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {field.required && (
                <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>
              )}
            </div>
            <span style={{ fontSize: 13, color: '#e8e8f0' }}>Yes</span>
          </div>

          <input
            value={field.allowed_values}
            onChange={e => updateField(index, 'allowed_values', e.target.value)}
            placeholder="High,Medium,Low"
            style={inputStyle}
          />

          <button
            onClick={() => removeField(index)}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: '#2a1520', border: '1px solid #ff4d6d44',
              color: '#ff4d6d', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>
      ))}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fieldsToSchema(fields) {
  const schema = {}
  fields.forEach(f => {
    if (!f.name.trim()) return
    const cfg = { type: f.type, required: f.required }
    if (f.allowed_values.trim()) {
      cfg.allowed_values = f.allowed_values
        .split(',').map(v => v.trim()).filter(Boolean)
    }
    schema[f.name.trim()] = cfg
  })
  return schema
}

function schemaToFields(schema) {
  return Object.entries(schema || {}).map(([name, cfg]) => ({
    name,
    type: cfg.type || 'string',
    required: cfg.required !== false,
    allowed_values: (cfg.allowed_values || []).join(','),
  }))
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WorkflowEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [schemaFields, setSchemaFields] = useState([])
  const [showAddStep, setShowAddStep] = useState(false)
  const [editStep, setEditStep] = useState(null)
  const [showRules, setShowRules] = useState(null)
  const [showExecute, setShowExecute] = useState(false)
  const [stepForm, setStepForm] = useState({
    name: '', step_type: 'task', metadata: '{}'
  })
  const [ruleForm, setRuleForm] = useState({
    condition: '', next_step: '', priority: 1
  })
  const [execData, setExecData] = useState({})

  const { data: wfData, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowsApi.get(id),
    enabled: !!id,
    refetchOnMount: true,
  })

  const wf = wfData?.data
  const wfSteps = wf?.steps || []

  useEffect(() => {
    if (wf) {
      setName(wf.name)
      setIsActive(wf.is_active)
      setSchemaFields(schemaToFields(wf.input_schema))
    }
  }, [wf])

  // ── Mutations ───────────────────────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: data =>
      isNew ? workflowsApi.create(data) : workflowsApi.update(id, data),
    onSuccess: res => {
      qc.invalidateQueries(['workflows'])
      qc.invalidateQueries(['workflow', id])
      toast.success(isNew ? 'Workflow created!' : `Saved — v${res.data.version}`)
      if (isNew) navigate(`/workflows/${res.data.id}/edit`)
    },
    onError: err => {
      console.error('Save error:', err.response?.data)
      toast.error(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Save failed'
      )
    },
  })

  const addStepMut = useMutation({
    mutationFn: data => stepsApi.create(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['workflow', id])
      setShowAddStep(false)
      setStepForm({ name: '', step_type: 'task', metadata: '{}' })
      toast.success('Step added')
    },
    onError: err => {
      console.error('Step error:', err.response?.data)
      toast.error('Failed to add step')
    },
  })

  const updateStepMut = useMutation({
    mutationFn: ({ sid, data }) => stepsApi.update(sid, data),
    onSuccess: () => {
      qc.invalidateQueries(['workflow', id])
      setEditStep(null)
      toast.success('Step saved')
    },
    onError: () => toast.error('Failed to save step'),
  })

  const deleteStepMut = useMutation({
    mutationFn: sid => stepsApi.delete(sid),
    onSuccess: () => {
      qc.invalidateQueries(['workflow', id])
      toast.success('Step deleted')
    },
  })

  const addRuleMut = useMutation({
    mutationFn: ({ stepId, data }) => rulesApi.create(stepId, data),
    onSuccess: () => {
      qc.invalidateQueries(['workflow', id])
      setRuleForm({ condition: '', next_step: '', priority: 1 })
      toast.success('Rule added')
    },
    onError: err => {
      console.error('Rule error:', err.response?.data)
      toast.error(err.response?.data?.detail || 'Failed to add rule')
    },
  })

  const deleteRuleMut = useMutation({
    mutationFn: rid => rulesApi.delete(rid),
    onSuccess: () => {
      qc.invalidateQueries(['workflow', id])
      toast.success('Rule deleted')
    },
  })

  const executeMut = useMutation({
    mutationFn: data => workflowsApi.execute(id, data),
    onSuccess: res => {
      setShowExecute(false)
      toast.success(`Execution started — status: ${res.data.status}`)
      navigate(`/executions/${res.data.id}`)
    },
    onError: err => {
      const errors = err.response?.data?.errors
      toast.error(errors ? errors.join(', ') : 'Execution failed')
    },
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!name.trim()) { toast.error('Workflow name is required'); return }
    const input_schema = fieldsToSchema(schemaFields)
    const payload = {
      name: name.trim(),
      input_schema: input_schema,
      is_active: isActive,
    }
    console.log('Saving:', JSON.stringify(payload, null, 2))
    saveMut.mutate(payload)
  }

  const handleAddStep = () => {
    if (!stepForm.name.trim()) { toast.error('Step name required'); return }
    let meta
    try { meta = JSON.parse(stepForm.metadata || '{}') }
    catch { toast.error('Invalid metadata JSON'); return }
    addStepMut.mutate({
      name: stepForm.name.trim(),
      step_type: stepForm.step_type,
      metadata: meta,
      order: wfSteps.length + 1,
      workflow: id,
    })
  }

  const handleEditStep = () => {
    if (!stepForm.name.trim()) { toast.error('Step name required'); return }
    let meta
    try { meta = JSON.parse(stepForm.metadata || '{}') }
    catch { toast.error('Invalid metadata JSON'); return }
    updateStepMut.mutate({
      sid: editStep.id,
      data: {
        name: stepForm.name.trim(),
        step_type: stepForm.step_type,
        metadata: meta,
        workflow: id,
      },
    })
  }

  const openEditStep = step => {
    setEditStep(step)
    setStepForm({
      name: step.name,
      step_type: step.step_type,
      metadata: JSON.stringify(step.metadata || {}, null, 2),
    })
  }

  const handleAddRule = () => {
    if (!ruleForm.condition.trim()) { toast.error('Condition required'); return }
    addRuleMut.mutate({
      stepId: showRules.id,
      data: {
        condition: ruleForm.condition.trim(),
        next_step: ruleForm.next_step || null,
        priority: parseInt(ruleForm.priority) || 1,
        step: showRules.id,
      },
    })
  }

  const inputSchema = fieldsToSchema(schemaFields)

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: '#0d0d1a', border: '1px solid #2a2a45',
    borderRadius: 12, color: '#e8e8f0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  }

  if (!isNew && isLoading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#6b6b8a' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14' }}>

      {/* Page Header */}
      <div style={{ padding: '32px 40px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: '#e8e8f0', margin: 0,
            }}>
              {isNew ? 'Create Workflow' : 'Edit Workflow'}
            </h1>
            <p style={{ fontSize: 14, color: '#6b6b8a', margin: '6px 0 0' }}>
              {isNew
                ? 'Define a new automation workflow'
                : `Editing: ${wf?.name || ''} · v${wf?.version}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/workflows')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              background: 'transparent', border: '1px solid #2a2a45',
              color: '#9898b0', fontSize: 14, cursor: 'pointer',
            }}
          >← Back</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 40px 120px' }}>

        {/* Workflow Details Card */}
        <Card title="Workflow Details" subtitle="Basic information about your workflow">
          <FieldLabel label="Workflow Name" required />
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Expense Approval"
            style={inputStyle}
          />
          <Toggle checked={isActive} onChange={setIsActive} label="Active" />
        </Card>

        {/* Input Schema Card */}
        <Card
          title="Input Schema"
          subtitle="Define fields this workflow accepts"
          action={
            <button
              onClick={() => setSchemaFields(prev => [
                ...prev,
                { name: '', type: 'string', required: false, allowed_values: '' }
              ])}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 10,
                background: 'transparent', border: '1px solid #2a2a45',
                color: '#e8e8f0', fontSize: 13, cursor: 'pointer', fontWeight: 600,
              }}
            >+ Add Field</button>
          }
        >
          <SchemaBuilder fields={schemaFields} onChange={setSchemaFields} />
          {schemaFields.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '30px 0',
              color: '#4a4a6a', fontSize: 13,
            }}>
              No fields defined yet. Click "+ Add Field" to add input fields.
            </div>
          )}
        </Card>

        {/* Steps Card — only when editing */}
        {!isNew && (
          <Card
            title={`Steps (${wfSteps.length})`}
            subtitle="Define the steps in your workflow"
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowExecute(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 18px', borderRadius: 10,
                    background: '#1a3a2a', border: '1px solid #00d68f44',
                    color: '#00d68f', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  }}
                >▶ Execute</button>
                <button
                  onClick={() => setShowAddStep(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 18px', borderRadius: 10,
                    background: 'transparent', border: '1px solid #2a2a45',
                    color: '#e8e8f0', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  }}
                >+ Add Step</button>
              </div>
            }
          >
            {wfSteps.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '30px 0',
                color: '#4a4a6a', fontSize: 13,
              }}>
                No steps yet. Add your first step above.
              </div>
            )}

            {wfSteps.map(step => (
              <div key={step.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', marginBottom: 10,
                background: '#0d0d1a', border: '1px solid #1e1e35',
                borderRadius: 12,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#1e1e35', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontFamily: 'monospace',
                  fontSize: 12, color: '#6b6b8a', flexShrink: 0,
                }}>{step.order}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600, color: '#e8e8f0', fontSize: 14,
                  }}>
                    {step.name}
                  </div>
                  <div style={{
                    display: 'flex', gap: 8, marginTop: 4, alignItems: 'center',
                  }}>
                    <Badge value={step.step_type} />
                    <span style={{ fontSize: 12, color: '#6b6b8a' }}>
                      {step.rules?.length || 0} rule{step.rules?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowRules(step)}
                    style={{
                      padding: '6px 14px', borderRadius: 8,
                      background: 'transparent', border: '1px solid #2a2a45',
                      color: '#9898b0', fontSize: 12, cursor: 'pointer',
                    }}
                  >Rules</button>
                  <button
                    onClick={() => openEditStep(step)}
                    style={{
                      padding: '6px 14px', borderRadius: 8,
                      background: 'transparent', border: '1px solid #2a2a45',
                      color: '#9898b0', fontSize: 12, cursor: 'pointer',
                    }}
                  >Edit</button>
                  <button
                    onClick={() =>
                      confirm('Delete step and its rules?') &&
                      deleteStepMut.mutate(step.id)
                    }
                    style={{
                      padding: '6px 10px', borderRadius: 8,
                      background: '#2a1520', border: '1px solid #ff4d6d44',
                      color: '#ff4d6d', fontSize: 12, cursor: 'pointer',
                    }}
                  >✕</button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Fixed Save Button */}
      <div style={{
        position: 'fixed', bottom: 0, right: 0,
        padding: '20px 40px',
        background: 'linear-gradient(to top, #0a0a14 60%, transparent)',
        width: '100%', display: 'flex', justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}>
        <button
          onClick={handleSave}
          disabled={saveMut.isPending}
          style={{
            pointerEvents: 'all',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 28px', borderRadius: 14,
            background: saveMut.isPending
              ? '#3a2a5a'
              : 'linear-gradient(135deg, #7c5cbf, #9b6ddf)',
            border: 'none', color: '#fff',
            fontSize: 15, fontWeight: 700,
            cursor: saveMut.isPending ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px #7c5cbf55',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 18 }}>💾</span>
          {saveMut.isPending
            ? 'Saving...'
            : isNew ? 'Save Workflow' : 'Save Changes'}
        </button>
      </div>

      {/* ── Add Step Modal ── */}
      {showAddStep && (
        <Modal title="Add Step" onClose={() => setShowAddStep(false)}>
          <div style={{ marginBottom: 14 }}>
            <FieldLabel label="Step Name" required />
            <input
              value={stepForm.name}
              onChange={e => setStepForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Manager Approval"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <FieldLabel label="Step Type" />
            <select
              value={stepForm.step_type}
              onChange={e => setStepForm(p => ({ ...p, step_type: e.target.value }))}
              style={inputStyle}
            >
              <option value="task">Task</option>
              <option value="approval">Approval</option>
              <option value="notification">Notification</option>
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <FieldLabel label="Metadata (JSON) — Optional" />
            <div style={{ fontSize: 11, color: '#6b6b8a', marginBottom: 6 }}>
              approval → {`{"assignee_email":"manager@example.com"}`}
            </div>
            <textarea
              value={stepForm.metadata}
              onChange={e => setStepForm(p => ({ ...p, metadata: e.target.value }))}
              style={{
                ...inputStyle, fontFamily: 'monospace',
                fontSize: 12, minHeight: 80, resize: 'vertical',
              }}
            />
          </div>
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16,
          }}>
            <button
              onClick={() => setShowAddStep(false)}
              style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'transparent', border: '1px solid #2a2a45',
                color: '#9898b0', fontSize: 13, cursor: 'pointer',
              }}
            >Cancel</button>
            <button
              onClick={handleAddStep}
              disabled={addStepMut.isPending}
              style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'linear-gradient(135deg, #7c5cbf, #9b6ddf)',
                border: 'none', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >{addStepMut.isPending ? 'Adding...' : 'Add Step'}</button>
          </div>
        </Modal>
      )}

      {/* ── Edit Step Modal ── */}
      {editStep && (
        <Modal title={`Edit: ${editStep.name}`} onClose={() => setEditStep(null)}>
          <div style={{ marginBottom: 14 }}>
            <FieldLabel label="Step Name" required />
            <input
              value={stepForm.name}
              onChange={e => setStepForm(p => ({ ...p, name: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <FieldLabel label="Step Type" />
            <select
              value={stepForm.step_type}
              onChange={e => setStepForm(p => ({ ...p, step_type: e.target.value }))}
              style={inputStyle}
            >
              <option value="task">Task</option>
              <option value="approval">Approval</option>
              <option value="notification">Notification</option>
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <FieldLabel label="Metadata (JSON)" />
            <textarea
              value={stepForm.metadata}
              onChange={e => setStepForm(p => ({ ...p, metadata: e.target.value }))}
              style={{
                ...inputStyle, fontFamily: 'monospace',
                fontSize: 12, minHeight: 80, resize: 'vertical',
              }}
            />
          </div>
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16,
          }}>
            <button
              onClick={() => setEditStep(null)}
              style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'transparent', border: '1px solid #2a2a45',
                color: '#9898b0', fontSize: 13, cursor: 'pointer',
              }}
            >Cancel</button>
            <button
              onClick={handleEditStep}
              disabled={updateStepMut.isPending}
              style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'linear-gradient(135deg, #7c5cbf, #9b6ddf)',
                border: 'none', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >Save Step</button>
          </div>
        </Modal>
      )}

      {/* ── Rules Modal ── */}
      {showRules && (
        <Modal
          title={`Rules: ${showRules.name}`}
          onClose={() => setShowRules(null)}
          wide
        >
          <div style={{
            fontSize: 12, color: '#6b6b8a', marginBottom: 16,
            padding: '10px 14px', background: '#0d0d1a',
            borderRadius: 8, border: '1px solid #1e1e35',
          }}>
            Rules evaluated in priority order (lowest = first).
            The last step does <strong style={{ color: '#00d68f' }}>NOT</strong> need
            a DEFAULT rule — it ends automatically.
            Other steps should have a{' '}
            <strong style={{ color: '#ffd166' }}>DEFAULT</strong> rule.
          </div>

          {(showRules.rules || [])
            .sort((a, b) => a.priority - b.priority)
            .map(rule => (
              <div key={rule.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', marginBottom: 8,
                background: '#0d0d1a', border: '1px solid #1e1e35',
                borderRadius: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: '#ff4d6d', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontFamily: 'monospace',
                  fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
                }}>{rule.priority}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 12, color: '#9898b0',
                  }}>
                    {rule.condition}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>
                    → {rule.next_step_name || '(end workflow)'}
                  </div>
                </div>
                <button
                  onClick={() => deleteRuleMut.mutate(rule.id)}
                  style={{
                    padding: '4px 10px', borderRadius: 6,
                    background: '#2a1520', border: '1px solid #ff4d6d44',
                    color: '#ff4d6d', fontSize: 12, cursor: 'pointer',
                  }}
                >✕</button>
              </div>
            ))}

          {/* Add Rule Form */}
          <div style={{
            marginTop: 16, padding: 16,
            background: '#0d0d1a', border: '1px solid #1e1e35', borderRadius: 12,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#e8e8f0', marginBottom: 14,
            }}>
              Add New Rule
            </div>

            <div style={{ marginBottom: 12 }}>
              <FieldLabel label="Condition" />
              <input
                value={ruleForm.condition}
                onChange={e => setRuleForm(p => ({ ...p, condition: e.target.value }))}
                placeholder="amount > 100 && country == 'US'  or  DEFAULT"
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: '#6b6b8a', marginTop: 6 }}>
                Operators: ==, !=, &gt;, &lt;, &gt;=, &lt;=, &amp;&amp;, ||
              </div>
            </div>

            {Object.keys(inputSchema).length > 0 && (
              <div style={{
                marginBottom: 12, padding: '8px 12px',
                background: '#13132a', borderRadius: 8,
                fontSize: 11, color: '#6b6b8a',
              }}>
                Available fields:{' '}
                {Object.entries(inputSchema).map(([k, v]) => (
                  <span key={k} style={{
                    display: 'inline-block', margin: '2px 4px',
                    padding: '1px 8px', background: '#1e1e35',
                    borderRadius: 4, fontFamily: 'monospace',
                    color: '#ff8fa3', fontSize: 11,
                  }}>{k} ({v.type})</span>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <FieldLabel label="Next Step" />
              <select
                value={ruleForm.next_step}
                onChange={e => setRuleForm(p => ({ ...p, next_step: e.target.value }))}
                style={inputStyle}
              >
                <option value="">(end workflow)</option>
                {wfSteps.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel label="Priority" />
              <input
                type="number" min={1}
                value={ruleForm.priority}
                onChange={e => setRuleForm(p => ({ ...p, priority: e.target.value }))}
                style={{ ...inputStyle, width: 120 }}
              />
            </div>

            <button
              onClick={handleAddRule}
              disabled={addRuleMut.isPending}
              style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'linear-gradient(135deg, #7c5cbf, #9b6ddf)',
                border: 'none', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >{addRuleMut.isPending ? 'Adding...' : '+ Add Rule'}</button>
          </div>
        </Modal>
      )}

      {/* ── Execute Modal ── */}
      {showExecute && (
        <Modal
          title={`Execute: ${wf?.name}`}
          onClose={() => setShowExecute(false)}
        >
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
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0' }}>
              Input Data
            </div>
          </div>

          {Object.entries(inputSchema).map(([key, cfg]) => (
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

          {Object.keys(inputSchema).length === 0 && (
            <div style={{
              textAlign: 'center', padding: 30,
              color: '#6b6b8a', fontSize: 13,
            }}>
              No input fields defined for this workflow.
            </div>
          )}

          <button
            onClick={() => executeMut.mutate(execData)}
            disabled={executeMut.isPending}
            style={{
              width: '100%', padding: '16px',
              background: '#00d68f', border: 'none',
              borderRadius: 12, color: '#000',
              fontSize: 15, fontWeight: 700,
              cursor: executeMut.isPending ? 'not-allowed' : 'pointer',
              opacity: executeMut.isPending ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {executeMut.isPending ? 'Starting...' : '▶ Start Execution'}
          </button>
        </Modal>
      )}
    </div>
  )
}
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import WorkflowList from './components/WorkflowList'
import WorkflowEditor from './components/WorkflowEditor'
import ExecutionList from './components/ExecutionList'
import ExecutionDetail from './components/ExecutionDetail'
import AuditLog from './components/AuditLog'

function QueryInvalidator() {
  const location = useLocation()
  const qc = useQueryClient()

  useEffect(() => {
    qc.invalidateQueries()
  }, [location.pathname])

  return null
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<><QueryInvalidator /><Dashboard /></>} />
        <Route path="workflows" element={<><QueryInvalidator /><WorkflowList /></>} />
        <Route path="workflows/new" element={<WorkflowEditor />} />
        <Route path="workflows/:id/edit" element={<WorkflowEditor />} />
        <Route path="executions" element={<><QueryInvalidator /><ExecutionList /></>} />
        <Route path="executions/:id" element={<ExecutionDetail />} />
        <Route path="audit" element={<><QueryInvalidator /><AuditLog /></>} />
      </Route>
    </Routes>
  )
}
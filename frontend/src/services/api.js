import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use(config => {
  console.log('API Request:', config.method?.toUpperCase(), config.url)
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', err.response?.status, err.response?.data)
    return Promise.reject(err)
  }
)

export const workflowsApi = {
  list: (params) => api.get('/workflows/', { params }),
  get: (id) => api.get(`/workflows/${id}/`),
  create: (data) => api.post('/workflows/', data),
  update: (id, data) => api.put(`/workflows/${id}/`, data),
  delete: (id) => api.delete(`/workflows/${id}/`),
  execute: (id, inputData) =>
    api.post(`/workflows/${id}/execute/`, { data: inputData }),
}

export const stepsApi = {
  list: (workflowId) => api.get(`/workflows/${workflowId}/steps/`),
  create: (workflowId, data) =>
    api.post(`/workflows/${workflowId}/steps/`, data),
  update: (id, data) => api.put(`/steps/${id}/`, data),
  delete: (id) => api.delete(`/steps/${id}/`),
}

export const rulesApi = {
  list: (stepId) => api.get(`/steps/${stepId}/rules/`),
  create: (stepId, data) => api.post(`/steps/${stepId}/rules/`, data),
  update: (id, data) => api.put(`/rules/${id}/`, data),
  delete: (id) => api.delete(`/rules/${id}/`),
}

export const executionsApi = {
  list: (params) => api.get('/executions/', { params }),
  get: (id) => api.get(`/executions/${id}/`),
  cancel: (id) => api.post(`/executions/${id}/cancel/`),
  retry: (id) => api.post(`/executions/${id}/retry/`),
}

export default api
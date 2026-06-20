import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const { refreshToken, setTokens, logout } = useAuthStore.getState()
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
          setTokens(res.data.access_token, res.data.refresh_token)
          originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(originalRequest)
        } catch {
          logout()
          window.location.href = '/login'
        }
      } else {
        logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: object) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data: object) => api.put('/auth/change-password', data),
}

// ── Dashboard ────────────────────────────────────────────────────────────
export const dashboardApi = {
  kpis: () => api.get('/dashboard/kpis'),
  charts: () => api.get('/dashboard/charts'),
}

// ── Products ─────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: object) => api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: object) => api.post('/products', data),
  update: (id: string, data: object) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  categories: () => api.get('/products/categories'),
  createCategory: (data: object) => api.post('/products/categories', data),
  valuation: () => api.get('/products/valuation'),
  lowStock: () => api.get('/products/low-stock'),
}

// ── Customers ────────────────────────────────────────────────────────────
export const customersApi = {
  list: (params?: object) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: object) => api.post('/customers', data),
  update: (id: string, data: object) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  analytics: (id: string) => api.get(`/customers/${id}/analytics`),
}

// ── Vendors ──────────────────────────────────────────────────────────────
export const vendorsApi = {
  list: (params?: object) => api.get('/vendors', { params }),
  get: (id: string) => api.get(`/vendors/${id}`),
  create: (data: object) => api.post('/vendors', data),
  update: (id: string, data: object) => api.put(`/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/vendors/${id}`),
}

// ── Inventory ────────────────────────────────────────────────────────────
export const inventoryApi = {
  movements: (params?: object) => api.get('/inventory/movements', { params }),
  adjust: (data: object) => api.post('/inventory/adjust', data),
  valuation: () => api.get('/inventory/valuation'),
  lowStock: () => api.get('/inventory/low-stock'),
}

// ── Sales ─────────────────────────────────────────────────────────────────
export const salesApi = {
  list: (params?: object) => api.get('/sales/orders', { params }),
  get: (id: string) => api.get(`/sales/orders/${id}`),
  create: (data: object) => api.post('/sales/orders', data),
  confirm: (id: string) => api.post(`/sales/orders/${id}/confirm`),
  deliver: (id: string) => api.post(`/sales/orders/${id}/deliver`),
  cancel: (id: string) => api.post(`/sales/orders/${id}/cancel`),
  invoicePdf: (id: string) => api.get(`/sales/orders/${id}/invoice/pdf`, { responseType: 'blob' }),
}

// ── Purchases ────────────────────────────────────────────────────────────
export const purchasesApi = {
  list: (params?: object) => api.get('/purchases/orders', { params }),
  get: (id: string) => api.get(`/purchases/orders/${id}`),
  create: (data: object) => api.post('/purchases/orders', data),
  confirm: (id: string) => api.post(`/purchases/orders/${id}/confirm`),
  receive: (id: string, items: object[]) => api.post(`/purchases/orders/${id}/receive`, items),
  cancel: (id: string) => api.post(`/purchases/orders/${id}/cancel`),
}

// ── Manufacturing ────────────────────────────────────────────────────────
export const manufacturingApi = {
  boms: (params?: object) => api.get('/manufacturing/boms', { params }),
  getBom: (id: string) => api.get(`/manufacturing/boms/${id}`),
  createBom: (data: object) => api.post('/manufacturing/boms', data),
  orders: (params?: object) => api.get('/manufacturing/orders', { params }),
  getOrder: (id: string) => api.get(`/manufacturing/orders/${id}`),
  createOrder: (data: object) => api.post('/manufacturing/orders', data),
  checkComponents: (id: string) => api.get(`/manufacturing/orders/${id}/check-components`),
  reserve: (id: string) => api.post(`/manufacturing/orders/${id}/reserve`),
  start: (id: string) => api.post(`/manufacturing/orders/${id}/start`),
  complete: (id: string) => api.post(`/manufacturing/orders/${id}/complete`),
  cancel: (id: string) => api.post(`/manufacturing/orders/${id}/cancel`),
}

// ── Reports ──────────────────────────────────────────────────────────────
export const reportsApi = {
  salesPdf: (params?: object) => api.get('/reports/sales/pdf', { params, responseType: 'blob' }),
  salesExcel: (params?: object) => api.get('/reports/sales/excel', { params, responseType: 'blob' }),
  inventoryPdf: () => api.get('/reports/inventory/pdf', { responseType: 'blob' }),
  purchasesExcel: () => api.get('/reports/purchases/excel', { responseType: 'blob' }),
  manufacturingExcel: () => api.get('/reports/manufacturing/excel', { responseType: 'blob' }),
}

// ── AI ───────────────────────────────────────────────────────────────────
export const aiApi = {
  forecast: (productId: string, days = 30) => api.get(`/ai/forecast/${productId}`, { params: { days } }),
  procurementSuggestions: () => api.get('/ai/procurement-suggestions'),
  manufacturingAssistant: (moId: string) => api.post('/ai/manufacturing-assistant', { manufacturing_order_id: moId }),
  copilot: (query: string) => api.post('/ai/copilot', { query }),
}

export function downloadBlob(data: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '@/lib/api'
import DataTable from '@/components/shared/DataTable'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search, Edit2, Trash2, X, BarChart2, AlertCircle } from 'lucide-react'

interface CustomerForm {
  name: string; email: string; phone: string; address: string
  city: string; country: string; credit_limit: string; notes: string
}
const defaultForm: CustomerForm = { name: '', email: '', phone: '', address: '', city: '', country: '', credit_limit: '0', notes: '' }

export default function CustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CustomerForm>(defaultForm)
  const [formError, setFormError] = useState('')
  const [analyticsCustomer, setAnalyticsCustomer] = useState<any>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customersApi.list({ page, page_size: 20, search: search || undefined }),
  })

  const { data: analyticsData } = useQuery({
    queryKey: ['customer-analytics', analyticsCustomer?.id],
    queryFn: () => customersApi.analytics(analyticsCustomer.id),
    enabled: !!analyticsCustomer,
  })

  const createMutation = useMutation({
    mutationFn: (d: object) => customersApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setShowForm(false); setForm(defaultForm) },
    onError: (e: any) => setFormError(e.response?.data?.detail || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => customersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setShowForm(false); setEditingId(null) },
    onError: (e: any) => setFormError(e.response?.data?.detail || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })

  const customers = data?.data?.items || []
  const meta = data?.data || { total: 0, pages: 1 }
  const analytics = analyticsData?.data

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const payload = { ...form, credit_limit: parseFloat(form.credit_limit) }
    if (editingId) updateMutation.mutate({ id: editingId, data: payload })
    else createMutation.mutate(payload)
  }

  const columns = [
    { key: 'name', header: 'Customer', render: (c: any) => (
      <div>
        <p className="font-medium text-gray-900">{c.name}</p>
        <p className="text-xs text-gray-500">{c.email}</p>
      </div>
    )},
    { key: 'city', header: 'Location', render: (c: any) => c.city ? `${c.city}, ${c.country}` : '—' },
    { key: 'credit_limit', header: 'Credit Limit', render: (c: any) => formatCurrency(c.credit_limit) },
    { key: 'outstanding_balance', header: 'Outstanding', render: (c: any) => (
      <span className={c.outstanding_balance > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}>
        {formatCurrency(c.outstanding_balance)}
      </span>
    )},
    { key: 'created_at', header: 'Added', render: (c: any) => formatDate(c.created_at) },
    { key: 'actions', header: '', render: (c: any) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setAnalyticsCustomer(c)} className="p-1.5 hover:bg-blue-50 rounded text-gray-500 hover:text-blue-600 transition-colors" title="Analytics">
          <BarChart2 size={14} />
        </button>
        <button onClick={() => { setForm({ name: c.name, email: c.email, phone: c.phone||'', address: c.address||'', city: c.city||'', country: c.country||'', credit_limit: String(c.credit_limit), notes: c.notes||'' }); setEditingId(c.id); setShowForm(true) }}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600 transition-colors">
          <Edit2 size={14} />
        </button>
        <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(c.id) }}
          className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} customers</p>
        </div>
        <button id="add-customer-btn" onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm) }} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input id="customer-search" type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search customers..." className="input pl-9" />
      </div>
      <DataTable columns={columns} data={customers} loading={isLoading} page={page} pages={meta.pages} total={meta.total} onPageChange={setPage} />

      {/* Analytics Modal */}
      {analyticsCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{analyticsCustomer.name} — Analytics</h3>
              <button onClick={() => setAnalyticsCustomer(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Total Orders', value: analytics?.total_orders ?? '—' },
                { label: 'Total Revenue', value: analytics ? formatCurrency(analytics.total_revenue) : '—' },
                { label: 'Outstanding', value: analytics ? formatCurrency(analytics.outstanding_amount) : '—' },
                { label: 'Avg Order Value', value: analytics ? formatCurrency(analytics.avg_order_value) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
                <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
                <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} /></div>
                <div><label className="label">Country</label><input className="input" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} /></div>
                <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
                <div><label className="label">Credit Limit</label><input type="number" min="0" step="100" className="input" value={form.credit_limit} onChange={(e) => setForm({...form, credit_limit: e.target.value})} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" id="customer-submit-btn" className="btn-primary flex-1">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

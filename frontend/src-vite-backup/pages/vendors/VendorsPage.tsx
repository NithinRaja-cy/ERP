import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorsApi } from '@/lib/api'
import DataTable from '@/components/shared/DataTable'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Edit2, Trash2, X, Star } from 'lucide-react'

interface VendorForm {
  name: string; contact_name: string; email: string; phone: string
  address: string; city: string; country: string; rating: string
  lead_time_days: string; payment_terms: string; notes: string
}
const defaultForm: VendorForm = {
  name: '', contact_name: '', email: '', phone: '', address: '', city: '',
  country: '', rating: '3.0', lead_time_days: '7', payment_terms: 'Net 30', notes: '',
}

export default function VendorsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VendorForm>(defaultForm)
  const [formError, setFormError] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', page, search],
    queryFn: () => vendorsApi.list({ page, page_size: 20, search: search || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: (d: object) => vendorsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); setShowForm(false); setForm(defaultForm) },
    onError: (e: any) => setFormError(e.response?.data?.detail || 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => vendorsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); setShowForm(false); setEditingId(null) },
    onError: (e: any) => setFormError(e.response?.data?.detail || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vendorsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })

  const vendors = data?.data?.items || []
  const meta = data?.data || { total: 0, pages: 1 }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setFormError('')
    const payload = { ...form, rating: parseFloat(form.rating), lead_time_days: parseInt(form.lead_time_days) }
    if (editingId) updateMutation.mutate({ id: editingId, data: payload })
    else createMutation.mutate(payload)
  }

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  )

  const columns = [
    { key: 'name', header: 'Vendor', render: (v: any) => (
      <div><p className="font-medium text-gray-900">{v.name}</p><p className="text-xs text-gray-500">{v.email}</p></div>
    )},
    { key: 'contact_name', header: 'Contact', render: (v: any) => v.contact_name || '—' },
    { key: 'rating', header: 'Rating', render: (v: any) => <RatingStars rating={v.rating} /> },
    { key: 'lead_time_days', header: 'Lead Time', render: (v: any) => `${v.lead_time_days} days` },
    { key: 'payment_terms', header: 'Payment Terms', render: (v: any) => v.payment_terms || '—' },
    { key: 'city', header: 'Location', render: (v: any) => v.city ? `${v.city}, ${v.country}` : '—' },
    { key: 'actions', header: '', render: (v: any) => (
      <div className="flex items-center gap-1">
        <button onClick={() => { setForm({ name: v.name, contact_name: v.contact_name||'', email: v.email, phone: v.phone||'', address: v.address||'', city: v.city||'', country: v.country||'', rating: String(v.rating), lead_time_days: String(v.lead_time_days), payment_terms: v.payment_terms||'Net 30', notes: v.notes||'' }); setEditingId(v.id); setShowForm(true) }}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600 transition-colors"><Edit2 size={14} /></button>
        <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(v.id) }} className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Vendors</h2>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} vendors</p>
        </div>
        <button id="add-vendor-btn" onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm) }} className="btn-primary">
          <Plus size={16} /> Add Vendor
        </button>
      </div>
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input id="vendor-search" type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search vendors..." className="input pl-9" />
      </div>
      <DataTable columns={columns} data={vendors} loading={isLoading} page={page} pages={meta.pages} total={meta.total} onPageChange={setPage} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Vendor' : 'Add Vendor'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="label">Company Name *</label><input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                <div><label className="label">Contact Name</label><input className="input" value={form.contact_name} onChange={(e) => setForm({...form, contact_name: e.target.value})} /></div>
                <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required /></div>
                <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
                <div><label className="label">Lead Time (days)</label><input type="number" min="1" className="input" value={form.lead_time_days} onChange={(e) => setForm({...form, lead_time_days: e.target.value})} /></div>
                <div><label className="label">Rating (1-5)</label><input type="number" min="1" max="5" step="0.1" className="input" value={form.rating} onChange={(e) => setForm({...form, rating: e.target.value})} /></div>
                <div><label className="label">Payment Terms</label>
                  <select className="input" value={form.payment_terms} onChange={(e) => setForm({...form, payment_terms: e.target.value})}>
                    {['Net 15','Net 30','Net 45','Net 60','COD'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} /></div>
                <div><label className="label">Country</label><input className="input" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" id="vendor-submit-btn" className="btn-primary flex-1">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

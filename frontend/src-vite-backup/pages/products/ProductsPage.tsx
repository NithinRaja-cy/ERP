import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import DataTable from '@/components/shared/DataTable'
import { formatCurrency, statusBadgeClass, formatDate } from '@/lib/utils'
import { Plus, Search, Filter, Edit2, Trash2, X, AlertCircle } from 'lucide-react'

interface ProductForm {
  sku: string; name: string; description: string; cost_price: string
  selling_price: string; stock_qty: string; reorder_level: string
  unit_of_measure: string; category_id: string; preferred_vendor_id: string
}

const defaultForm: ProductForm = {
  sku: '', name: '', description: '', cost_price: '0', selling_price: '0',
  stock_qty: '0', reorder_level: '10', unit_of_measure: 'pcs',
  category_id: '', preferred_vendor_id: '',
}

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(defaultForm)
  const [formError, setFormError] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => productsApi.list({ page, page_size: 20, search: search || undefined }),
  })

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories(),
  })

  const createMutation = useMutation({
    mutationFn: (data: object) => productsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setShowForm(false); setForm(defaultForm) },
    onError: (e: any) => setFormError(e.response?.data?.detail || 'Create failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => productsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setShowForm(false); setEditingId(null); setForm(defaultForm) },
    onError: (e: any) => setFormError(e.response?.data?.detail || 'Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })

  const products = data?.data?.items || []
  const meta = data?.data || { total: 0, pages: 1 }
  const categories = catsData?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const payload = {
      ...form,
      cost_price: parseFloat(form.cost_price),
      selling_price: parseFloat(form.selling_price),
      stock_qty: parseFloat(form.stock_qty),
      reorder_level: parseFloat(form.reorder_level),
      category_id: form.category_id || undefined,
      preferred_vendor_id: form.preferred_vendor_id || undefined,
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const openEdit = (p: any) => {
    setForm({
      sku: p.sku, name: p.name, description: p.description || '',
      cost_price: String(p.cost_price), selling_price: String(p.selling_price),
      stock_qty: String(p.stock_qty), reorder_level: String(p.reorder_level),
      unit_of_measure: p.unit_of_measure, category_id: p.category_id || '',
      preferred_vendor_id: p.preferred_vendor_id || '',
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  const columns = [
    { key: 'sku', header: 'SKU', render: (p: any) => <span className="font-mono text-xs text-gray-600">{p.sku}</span> },
    { key: 'name', header: 'Product Name', render: (p: any) => <span className="font-medium text-gray-900">{p.name}</span> },
    { key: 'category', header: 'Category', render: (p: any) => p.category ? (
      <span className="badge" style={{ background: `${p.category.color}20`, color: p.category.color }}>{p.category.name}</span>
    ) : <span className="text-gray-400">—</span> },
    { key: 'cost_price', header: 'Cost', render: (p: any) => formatCurrency(p.cost_price) },
    { key: 'selling_price', header: 'Price', render: (p: any) => formatCurrency(p.selling_price) },
    { key: 'stock_qty', header: 'Stock', render: (p: any) => (
      <span className={`font-semibold ${p.stock_qty <= p.reorder_level ? 'text-red-500' : 'text-gray-700'}`}>
        {p.stock_qty} {p.unit_of_measure}
      </span>
    )},
    { key: 'free_qty', header: 'Free', render: (p: any) => <span className="text-gray-600">{p.free_qty}</span> },
    { key: 'reorder_level', header: 'Reorder', render: (p: any) => <span className="text-gray-500">{p.reorder_level}</span> },
    { key: 'actions', header: '', render: (p: any) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-primary-600 transition-colors">
          <Edit2 size={14} />
        </button>
        <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id) }}
          className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} products in catalog</p>
        </div>
        <button id="add-product-btn" onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm) }} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" id="product-search"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or SKU..."
            className="input pl-9"
          />
        </div>
      </div>

      {/* Low stock banner */}
      <DataTable
        columns={columns} data={products} loading={isLoading}
        page={page} pages={meta.pages} total={meta.total}
        onPageChange={setPage}
        emptyMessage="No products found. Add your first product!"
      />

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2"><AlertCircle size={15} />{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">SKU *</label>
                  <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Name *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input h-20 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Cost Price *</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Selling Price *</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select className="input" value={form.unit_of_measure} onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}>
                    {['pcs', 'kg', 'ltr', 'box', 'm', 'set'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Stock Qty</label>
                  <input type="number" step="0.1" min="0" className="input" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
                </div>
                <div>
                  <label className="label">Reorder Level</label>
                  <input type="number" step="0.1" min="0" className="input" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">No category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" id="product-submit-btn" className="btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

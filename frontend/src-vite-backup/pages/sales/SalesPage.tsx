import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi, customersApi, productsApi } from '@/lib/api'
import DataTable from '@/components/shared/DataTable'
import { formatCurrency, formatDate, statusBadgeClass } from '@/lib/utils'
import { Plus, X, CheckCircle, Truck, XCircle, FileText } from 'lucide-react'

export default function SalesPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [newOrder, setNewOrder] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1, unit_price: 0, discount: 0 }], tax_rate: 10, discount_amount: 0, notes: '' })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page, status],
    queryFn: () => salesApi.list({ page, page_size: 20, status: status || undefined }),
  })
  const { data: customersData } = useQuery({ queryKey: ['customers-all'], queryFn: () => customersApi.list({ page_size: 500 }) })
  const { data: productsData } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.list({ page_size: 500 }) })

  const createMutation = useMutation({
    mutationFn: (d: object) => salesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales'] }); setShowCreate(false) },
  })
  const confirmMutation = useMutation({
    mutationFn: (id: string) => salesApi.confirm(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales'] }); setSelectedOrder(null) },
  })
  const deliverMutation = useMutation({
    mutationFn: (id: string) => salesApi.deliver(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales'] }); setSelectedOrder(null) },
  })
  const cancelMutation = useMutation({
    mutationFn: (id: string) => salesApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales'] }); setSelectedOrder(null) },
  })

  const orders = data?.data?.items || []
  const meta = data?.data || { total: 0, pages: 1 }
  const customers = customersData?.data?.items || []
  const products = productsData?.data?.items || []

  const addItem = () => setNewOrder({ ...newOrder, items: [...newOrder.items, { product_id: '', quantity: 1, unit_price: 0, discount: 0 }] })
  const removeItem = (i: number) => setNewOrder({ ...newOrder, items: newOrder.items.filter((_, idx) => idx !== i) })
  const updateItem = (i: number, field: string, value: any) => {
    const items = [...newOrder.items]
    items[i] = { ...items[i], [field]: value }
    if (field === 'product_id') {
      const p = products.find((pr: any) => pr.id === value)
      if (p) items[i].unit_price = p.selling_price
    }
    setNewOrder({ ...newOrder, items })
  }

  const columns = [
    { key: 'order_number', header: 'Order #', render: (o: any) => <span className="font-mono text-xs font-medium">{o.order_number}</span> },
    { key: 'customer_name', header: 'Customer', render: (o: any) => o.customer_name || '—' },
    { key: 'status', header: 'Status', render: (o: any) => <span className={statusBadgeClass(o.status)}>{o.status}</span> },
    { key: 'total_amount', header: 'Total', render: (o: any) => <span className="font-semibold">{formatCurrency(o.total_amount)}</span> },
    { key: 'created_at', header: 'Date', render: (o: any) => formatDate(o.created_at) },
    { key: 'actions', header: '', render: (o: any) => (
      <button onClick={() => setSelectedOrder(o)} className="text-primary-600 hover:underline text-sm font-medium">View</button>
    )},
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Sales Orders</h2>
          <p className="text-sm text-gray-500">{meta.total} orders</p>
        </div>
        <button id="create-so-btn" onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> Create Order</button>
      </div>
      <div className="flex gap-2">
        {['', 'draft', 'confirmed', 'delivered', 'closed', 'cancelled'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <DataTable columns={columns} data={orders} loading={isLoading} page={page} pages={meta.pages} total={meta.total} onPageChange={setPage} />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">{selectedOrder.order_number}</h3>
                <span className={statusBadgeClass(selectedOrder.status)}>{selectedOrder.status}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Customer</p><p className="font-medium">{selectedOrder.customer_name}</p></div>
                <div><p className="text-gray-500">Date</p><p className="font-medium">{formatDate(selectedOrder.created_at)}</p></div>
                <div><p className="text-gray-500">Subtotal</p><p className="font-medium">{formatCurrency(selectedOrder.subtotal)}</p></div>
                <div><p className="text-gray-500">Total</p><p className="font-bold text-lg">{formatCurrency(selectedOrder.total_amount)}</p></div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Product</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Total</th>
                </tr></thead>
                <tbody>
                  {(selectedOrder.items || []).map((item: any) => (
                    <tr key={item.id} className="border-b"><td className="table-cell">{item.product_name}</td><td className="table-cell">{item.quantity}</td><td className="table-cell">{formatCurrency(item.unit_price)}</td><td className="table-cell font-medium">{formatCurrency(item.total)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-2 pt-2">
                {selectedOrder.status === 'draft' && <button onClick={() => confirmMutation.mutate(selectedOrder.id)} className="btn-primary flex-1"><CheckCircle size={15} /> Confirm</button>}
                {selectedOrder.status === 'confirmed' && <button onClick={() => deliverMutation.mutate(selectedOrder.id)} className="btn-primary flex-1"><Truck size={15} /> Deliver</button>}
                {!['delivered','closed','cancelled'].includes(selectedOrder.status) && <button onClick={() => cancelMutation.mutate(selectedOrder.id)} className="btn-danger flex-1"><XCircle size={15} /> Cancel</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Create Sales Order</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newOrder) }} className="p-6 space-y-4">
              <div>
                <label className="label">Customer *</label>
                <select className="input" value={newOrder.customer_id} onChange={(e) => setNewOrder({...newOrder, customer_id: e.target.value})} required>
                  <option value="">Select customer...</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Order Items</label>
                  <button type="button" onClick={addItem} className="text-xs text-primary-600 hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {newOrder.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <select className="input col-span-5" value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)} required>
                        <option value="">Product...</option>
                        {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      <input type="number" min="1" step="0.1" className="input col-span-2" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value))} required />
                      <input type="number" min="0" step="0.01" className="input col-span-2" placeholder="Price" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value))} required />
                      <input type="number" min="0" max="100" className="input col-span-2" placeholder="Disc%" value={item.discount} onChange={(e) => updateItem(i, 'discount', parseFloat(e.target.value))} />
                      <button type="button" onClick={() => removeItem(i)} className="col-span-1 p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Tax Rate (%)</label><input type="number" min="0" max="100" className="input" value={newOrder.tax_rate} onChange={(e) => setNewOrder({...newOrder, tax_rate: parseFloat(e.target.value)})} /></div>
                <div><label className="label">Discount ($)</label><input type="number" min="0" className="input" value={newOrder.discount_amount} onChange={(e) => setNewOrder({...newOrder, discount_amount: parseFloat(e.target.value)})} /></div>
              </div>
              <div><label className="label">Notes</label><textarea className="input h-16 resize-none" value={newOrder.notes} onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})} /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" id="create-so-submit" className="btn-primary flex-1" disabled={createMutation.isPending}>Create Order</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

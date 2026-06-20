import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchasesApi, vendorsApi, productsApi } from '@/lib/api'
import DataTable from '@/components/shared/DataTable'
import { formatCurrency, formatDate, statusBadgeClass } from '@/lib/utils'
import { Plus, X, CheckCircle, Package, XCircle } from 'lucide-react'

export default function PurchasesPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [newOrder, setNewOrder] = useState({ vendor_id: '', items: [{ product_id: '', quantity_ordered: 1, unit_price: 0 }], notes: '' })
  const [receiveMode, setReceiveMode] = useState(false)
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({})
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['purchases', page, status], queryFn: () => purchasesApi.list({ page, page_size: 20, status: status || undefined }) })
  const { data: vendorsData } = useQuery({ queryKey: ['vendors-all'], queryFn: () => vendorsApi.list({ page_size: 500 }) })
  const { data: productsData } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.list({ page_size: 500 }) })

  const createMutation = useMutation({ mutationFn: (d: object) => purchasesApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchases'] }); setShowCreate(false) } })
  const confirmMutation = useMutation({ mutationFn: (id: string) => purchasesApi.confirm(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchases'] }); setSelectedOrder(null) } })
  const receiveMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: any[] }) => purchasesApi.receive(id, items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchases'] }); setSelectedOrder(null); setReceiveMode(false) }
  })
  const cancelMutation = useMutation({ mutationFn: (id: string) => purchasesApi.cancel(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchases'] }); setSelectedOrder(null) } })

  const orders = data?.data?.items || []
  const meta = data?.data || { total: 0, pages: 1 }
  const vendors = vendorsData?.data?.items || []
  const products = productsData?.data?.items || []

  const addItem = () => setNewOrder({ ...newOrder, items: [...newOrder.items, { product_id: '', quantity_ordered: 1, unit_price: 0 }] })
  const removeItem = (i: number) => setNewOrder({ ...newOrder, items: newOrder.items.filter((_, idx) => idx !== i) })
  const updateItem = (i: number, field: string, value: any) => {
    const items = [...newOrder.items]
    items[i] = { ...items[i], [field]: value }
    if (field === 'product_id') { const p = products.find((pr: any) => pr.id === value); if (p) items[i].unit_price = p.cost_price }
    setNewOrder({ ...newOrder, items })
  }

  const handleReceive = () => {
    if (!selectedOrder) return
    const items = selectedOrder.items.map((i: any) => ({ product_id: String(i.product_id), quantity_received: receivedQtys[String(i.product_id)] || 0 }))
    receiveMutation.mutate({ id: selectedOrder.id, items })
  }

  const columns = [
    { key: 'order_number', header: 'Order #', render: (o: any) => <span className="font-mono text-xs font-medium">{o.order_number}</span> },
    { key: 'vendor_name', header: 'Vendor', render: (o: any) => o.vendor_name || '—' },
    { key: 'status', header: 'Status', render: (o: any) => <span className={statusBadgeClass(o.status)}>{o.status}</span> },
    { key: 'total_amount', header: 'Total', render: (o: any) => <span className="font-semibold">{formatCurrency(o.total_amount)}</span> },
    { key: 'expected_date', header: 'Expected', render: (o: any) => formatDate(o.expected_date) },
    { key: 'actions', header: '', render: (o: any) => <button onClick={() => { setSelectedOrder(o); setReceiveMode(false); setReceivedQtys({}) }} className="text-primary-600 hover:underline text-sm font-medium">View</button> },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="page-title">Purchase Orders</h2><p className="text-sm text-gray-500">{meta.total} orders</p></div>
        <button id="create-po-btn" onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> Create PO</button>
      </div>
      <div className="flex gap-2">
        {['','draft','ordered','received','closed','cancelled'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status===s?'bg-primary-100 text-primary-700':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{s||'All'}</button>
        ))}
      </div>
      <DataTable columns={columns} data={orders} loading={isLoading} page={page} pages={meta.pages} total={meta.total} onPageChange={setPage} />

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div><h3 className="text-lg font-semibold">{selectedOrder.order_number}</h3><span className={statusBadgeClass(selectedOrder.status)}>{selectedOrder.status}</span></div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Vendor</p><p className="font-medium">{selectedOrder.vendor_name}</p></div>
                <div><p className="text-gray-500">Total</p><p className="font-bold text-lg">{formatCurrency(selectedOrder.total_amount)}</p></div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Product</th>
                  <th className="table-header">Ordered</th>
                  <th className="table-header">Received</th>
                  {receiveMode && <th className="table-header">Receive Now</th>}
                </tr></thead>
                <tbody>
                  {(selectedOrder.items||[]).map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="table-cell">{item.product_name}</td>
                      <td className="table-cell">{item.quantity_ordered}</td>
                      <td className="table-cell">{item.quantity_received}</td>
                      {receiveMode && <td className="table-cell"><input type="number" min="0" max={item.quantity_ordered - item.quantity_received} className="input w-20" value={receivedQtys[String(item.product_id)] || 0} onChange={(e) => setReceivedQtys({...receivedQtys, [String(item.product_id)]: parseFloat(e.target.value)})} /></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-2 pt-2">
                {selectedOrder.status === 'draft' && <button onClick={() => confirmMutation.mutate(selectedOrder.id)} className="btn-primary flex-1"><CheckCircle size={15}/> Confirm Order</button>}
                {selectedOrder.status === 'ordered' && !receiveMode && <button onClick={() => setReceiveMode(true)} className="btn-primary flex-1"><Package size={15}/> Receive Goods</button>}
                {receiveMode && <button onClick={handleReceive} className="btn-primary flex-1" disabled={receiveMutation.isPending}>Confirm Receipt</button>}
                {!['received','closed','cancelled'].includes(selectedOrder.status) && <button onClick={() => cancelMutation.mutate(selectedOrder.id)} className="btn-danger flex-1"><XCircle size={15}/> Cancel</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Create Purchase Order</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newOrder) }} className="p-6 space-y-4">
              <div>
                <label className="label">Vendor *</label>
                <select className="input" value={newOrder.vendor_id} onChange={(e) => setNewOrder({...newOrder, vendor_id: e.target.value})} required>
                  <option value="">Select vendor...</option>
                  {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Order Items</label>
                  <button type="button" onClick={addItem} className="text-xs text-primary-600 hover:underline">+ Add Item</button>
                </div>
                {newOrder.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center mb-2">
                    <select className="input col-span-6" value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)} required>
                      <option value="">Product...</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input type="number" min="1" className="input col-span-2" placeholder="Qty" value={item.quantity_ordered} onChange={(e) => updateItem(i, 'quantity_ordered', parseFloat(e.target.value))} required />
                    <input type="number" min="0" step="0.01" className="input col-span-3" placeholder="Unit Price" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value))} required />
                    <button type="button" onClick={() => removeItem(i)} className="col-span-1 p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div><label className="label">Notes</label><textarea className="input h-16 resize-none" value={newOrder.notes} onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})} /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" id="create-po-submit" className="btn-primary flex-1" disabled={createMutation.isPending}>Create PO</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

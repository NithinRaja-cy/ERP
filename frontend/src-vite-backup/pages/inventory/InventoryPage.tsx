import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/lib/api'
import DataTable from '@/components/shared/DataTable'
import { formatDate, formatNumber } from '@/lib/utils'
import { Search, TrendingUp, TrendingDown, Minus, PackageSearch, X } from 'lucide-react'

export default function InventoryPage() {
  const [page, setPage] = useState(1)
  const [movType, setMovType] = useState('')
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjForm, setAdjForm] = useState({ product_id: '', quantity_delta: '0', notes: '' })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['movements', page, movType],
    queryFn: () => inventoryApi.movements({ page, page_size: 50, movement_type: movType || undefined }),
  })

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryApi.lowStock(),
  })

  const { data: valuationData } = useQuery({
    queryKey: ['inventory-valuation'],
    queryFn: () => inventoryApi.valuation(),
  })

  const adjustMutation = useMutation({
    mutationFn: (d: object) => inventoryApi.adjust(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['movements'] }); setShowAdjust(false); setAdjForm({ product_id: '', quantity_delta: '0', notes: '' }) },
  })

  const movements = data?.data?.items || []
  const meta = data?.data || { total: 0, pages: 1 }
  const lowStock = lowStockData?.data || []
  const valuation = valuationData?.data

  const movTypeIcon = (type: string, delta: number) => {
    if (delta > 0) return <span className="flex items-center gap-1 text-emerald-600"><TrendingUp size={13} /> {formatNumber(delta)}</span>
    return <span className="flex items-center gap-1 text-red-500"><TrendingDown size={13} /> {formatNumber(Math.abs(delta))}</span>
  }

  const TYPE_COLORS: Record<string, string> = {
    purchase_receipt: 'bg-emerald-100 text-emerald-700',
    sales_delivery: 'bg-red-100 text-red-700',
    mfg_consumption: 'bg-orange-100 text-orange-700',
    mfg_output: 'bg-blue-100 text-blue-700',
    adjustment: 'bg-gray-100 text-gray-700',
    transfer: 'bg-purple-100 text-purple-700',
  }

  const columns = [
    { key: 'created_at', header: 'Date', render: (m: any) => formatDate(m.created_at) },
    { key: 'product_name', header: 'Product', render: (m: any) => (
      <div><p className="font-medium text-gray-900">{m.product_name || '—'}</p><p className="text-xs text-gray-500 font-mono">{m.product_sku}</p></div>
    )},
    { key: 'movement_type', header: 'Type', render: (m: any) => (
      <span className={`badge ${TYPE_COLORS[m.movement_type] || 'badge-draft'}`}>{m.movement_type.replace(/_/g, ' ')}</span>
    )},
    { key: 'quantity_delta', header: 'Qty', render: (m: any) => movTypeIcon(m.movement_type, m.quantity_delta) },
    { key: 'reference', header: 'Reference', render: (m: any) => m.reference || '—' },
    { key: 'notes', header: 'Notes', render: (m: any) => <span className="text-gray-500">{m.notes || '—'}</span> },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Inventory Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${valuation?.total_value?.toLocaleString('en-US', {minimumFractionDigits:2}) || '0.00'}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{valuation?.total_products || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Low Stock Alerts</p>
          <p className={`text-2xl font-bold mt-1 ${lowStock.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{lowStock.length}</p>
        </div>
      </div>

      {/* Low stock banner */}
      {lowStock.length > 0 && (
        <div className="card p-4 border-l-4 border-orange-400">
          <div className="flex items-center gap-2 mb-3">
            <PackageSearch size={16} className="text-orange-500" />
            <span className="font-medium text-gray-900 text-sm">{lowStock.length} Products Below Reorder Level</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.slice(0, 8).map((p: any) => (
              <span key={p.product_id} className="badge bg-orange-50 text-orange-700 border border-orange-200">
                {p.product_name} ({p.stock_qty} / {p.reorder_level})
              </span>
            ))}
            {lowStock.length > 8 && <span className="badge badge-draft">+{lowStock.length - 8} more</span>}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select className="input w-48" value={movType} onChange={(e) => { setMovType(e.target.value); setPage(1) }}>
            <option value="">All Types</option>
            {['purchase_receipt','sales_delivery','mfg_consumption','mfg_output','adjustment','transfer'].map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <button id="adjust-stock-btn" onClick={() => setShowAdjust(true)} className="btn-primary">
          <Minus size={16} /> Stock Adjustment
        </button>
      </div>

      <DataTable columns={columns} data={movements} loading={isLoading} page={page} pages={meta.pages} total={meta.total} onPageChange={setPage} />

      {/* Adjust Modal */}
      {showAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Stock Adjustment</h3>
              <button onClick={() => setShowAdjust(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); adjustMutation.mutate({ product_id: adjForm.product_id, quantity_delta: parseFloat(adjForm.quantity_delta), notes: adjForm.notes }) }} className="p-6 space-y-4">
              <div>
                <label className="label">Product ID *</label>
                <input className="input" placeholder="Enter product UUID" value={adjForm.product_id} onChange={(e) => setAdjForm({...adjForm, product_id: e.target.value})} required />
              </div>
              <div>
                <label className="label">Quantity Delta (positive = in, negative = out)</label>
                <input type="number" step="0.1" className="input" value={adjForm.quantity_delta} onChange={(e) => setAdjForm({...adjForm, quantity_delta: e.target.value})} required />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input h-16 resize-none" value={adjForm.notes} onChange={(e) => setAdjForm({...adjForm, notes: e.target.value})} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdjust(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={adjustMutation.isPending}>Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

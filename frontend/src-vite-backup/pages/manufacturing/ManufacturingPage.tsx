import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { manufacturingApi, productsApi } from '@/lib/api'
import DataTable from '@/components/shared/DataTable'
import { formatDate, statusBadgeClass } from '@/lib/utils'
import { Plus, X, ChevronDown, ChevronUp, Play, CheckCircle, XCircle, ClipboardList, Package } from 'lucide-react'

type TabType = 'orders' | 'boms'

export default function ManufacturingPage() {
  const [tab, setTab] = useState<TabType>('orders')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [selectedMO, setSelectedMO] = useState<any>(null)
  const [showCreateMO, setShowCreateMO] = useState(false)
  const [showCreateBOM, setShowCreateBOM] = useState(false)
  const [moForm, setMoForm] = useState({ bom_id: '', planned_qty: 100, notes: '' })
  const [bomForm, setBomForm] = useState({ name: '', product_id: '', version: '1.0', yield_qty: 1, components: [{ component_product_id: '', quantity: 1, unit_of_measure: 'pcs' }] })
  const [componentCheck, setComponentCheck] = useState<any>(null)
  const qc = useQueryClient()

  const { data: moData, isLoading } = useQuery({ queryKey: ['manufacturing-orders', page, status], queryFn: () => manufacturingApi.orders({ page, page_size: 20, status: status || undefined }) })
  const { data: bomData } = useQuery({ queryKey: ['boms', page], queryFn: () => manufacturingApi.boms({ page, page_size: 20 }), enabled: tab === 'boms' })
  const { data: productsData } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.list({ page_size: 500 }) })
  const { data: bomsAllData } = useQuery({ queryKey: ['boms-all'], queryFn: () => manufacturingApi.boms({ page_size: 500 }) })

  const createMOMutation = useMutation({ mutationFn: (d: object) => manufacturingApi.createOrder(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['manufacturing-orders'] }); setShowCreateMO(false) } })
  const createBOMMutation = useMutation({ mutationFn: (d: object) => manufacturingApi.createBom(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['boms'] }); setShowCreateBOM(false) } })
  const reserveMutation = useMutation({ mutationFn: (id: string) => manufacturingApi.reserve(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['manufacturing-orders'] }); setSelectedMO(null) } })
  const startMutation = useMutation({ mutationFn: (id: string) => manufacturingApi.start(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['manufacturing-orders'] }); setSelectedMO(null) } })
  const completeMutation = useMutation({ mutationFn: (id: string) => manufacturingApi.complete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['manufacturing-orders'] }); setSelectedMO(null) } })
  const cancelMutation = useMutation({ mutationFn: (id: string) => manufacturingApi.cancel(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['manufacturing-orders'] }); setSelectedMO(null) } })

  const mos = moData?.data?.items || []
  const boms = bomData?.data?.items || []
  const moMeta = moData?.data || { total: 0, pages: 1 }
  const products = productsData?.data?.items || []
  const bomsAll = bomsAllData?.data?.items || []

  const checkComponents = async (id: string) => {
    const res = await manufacturingApi.checkComponents(id)
    setComponentCheck(res.data)
  }

  const addBOMComponent = () => setBomForm({ ...bomForm, components: [...bomForm.components, { component_product_id: '', quantity: 1, unit_of_measure: 'pcs' }] })

  const moColumns = [
    { key: 'mo_number', header: 'MO #', render: (m: any) => <span className="font-mono text-xs font-medium">{m.mo_number}</span> },
    { key: 'product_name', header: 'Product', render: (m: any) => m.product_name || '—' },
    { key: 'planned_qty', header: 'Planned', render: (m: any) => `${m.planned_qty} pcs` },
    { key: 'produced_qty', header: 'Produced', render: (m: any) => `${m.produced_qty} pcs` },
    { key: 'status', header: 'Status', render: (m: any) => <span className={statusBadgeClass(m.status)}>{m.status.replace('_',' ')}</span> },
    { key: 'created_at', header: 'Date', render: (m: any) => formatDate(m.created_at) },
    { key: 'actions', header: '', render: (m: any) => <button onClick={() => setSelectedMO(m)} className="text-primary-600 hover:underline text-sm font-medium">View</button> },
  ]

  const bomColumns = [
    { key: 'name', header: 'BOM Name', render: (b: any) => <span className="font-medium">{b.name}</span> },
    { key: 'product_name', header: 'Finished Product', render: (b: any) => b.product_name || '—' },
    { key: 'version', header: 'Version', render: (b: any) => <span className="badge badge-confirmed">v{b.version}</span> },
    { key: 'yield_qty', header: 'Yield', render: (b: any) => b.yield_qty },
    { key: 'components', header: 'Components', render: (b: any) => `${b.components?.length || 0} items` },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="page-title">Manufacturing</h2>
        <div className="flex gap-2">
          {tab === 'orders' && <button id="create-mo-btn" onClick={() => setShowCreateMO(true)} className="btn-primary"><Plus size={16}/> Create MO</button>}
          {tab === 'boms' && <button id="create-bom-btn" onClick={() => setShowCreateBOM(true)} className="btn-primary"><Plus size={16}/> Create BOM</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[{id:'orders',label:'Manufacturing Orders',icon:ClipboardList},{id:'boms',label:'Bill of Materials',icon:Package}].map(({id,label,icon:Icon}) => (
          <button key={id} onClick={() => setTab(id as TabType)} className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${tab===id?'border-primary-600 text-primary-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={16}/>{label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {['','draft','ready','in_progress','completed','cancelled'].map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status===s?'bg-primary-100 text-primary-700':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{s||'All'}</button>
            ))}
          </div>
          <DataTable columns={moColumns} data={mos} loading={isLoading} page={page} pages={moMeta.pages} total={moMeta.total} onPageChange={setPage} />
        </>
      )}

      {tab === 'boms' && <DataTable columns={bomColumns} data={boms} loading={false} page={page} pages={bomData?.data?.pages||1} total={bomData?.data?.total||0} onPageChange={setPage} />}

      {/* MO Detail Modal */}
      {selectedMO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div><h3 className="text-lg font-semibold">{selectedMO.mo_number}</h3><span className={statusBadgeClass(selectedMO.status)}>{selectedMO.status.replace('_',' ')}</span></div>
              <button onClick={() => setSelectedMO(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Product</p><p className="font-medium">{selectedMO.product_name}</p></div>
                <div><p className="text-gray-500">Planned / Produced</p><p className="font-medium">{selectedMO.planned_qty} / {selectedMO.produced_qty}</p></div>
              </div>
              {componentCheck && (
                <div className={`p-3 rounded-lg text-sm ${componentCheck.can_start ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <p className="font-medium mb-1">{componentCheck.can_start ? '✅ All components available' : `⚠️ ${componentCheck.missing_components?.length} component(s) missing`}</p>
                  {componentCheck.missing_components?.map((c: any) => (
                    <p key={c.product_id} className="text-xs text-orange-700">• {c.product_name}: need {c.required_qty}, have {c.available_qty}</p>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => checkComponents(selectedMO.id)} className="btn-secondary text-xs px-3 py-1.5">Check Components</button>
                {selectedMO.status === 'draft' && <button onClick={() => reserveMutation.mutate(selectedMO.id)} className="btn-primary flex-1"><Package size={14}/> Reserve</button>}
                {selectedMO.status === 'ready' && <button onClick={() => startMutation.mutate(selectedMO.id)} className="btn-primary flex-1"><Play size={14}/> Start</button>}
                {selectedMO.status === 'in_progress' && <button onClick={() => completeMutation.mutate(selectedMO.id)} className="btn-primary flex-1"><CheckCircle size={14}/> Complete</button>}
                {!['completed','cancelled'].includes(selectedMO.status) && <button onClick={() => cancelMutation.mutate(selectedMO.id)} className="btn-danger flex-1"><XCircle size={14}/> Cancel</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create MO Modal */}
      {showCreateMO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Create Manufacturing Order</h3>
              <button onClick={() => setShowCreateMO(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMOMutation.mutate(moForm) }} className="p-6 space-y-4">
              <div><label className="label">Bill of Materials *</label>
                <select className="input" value={moForm.bom_id} onChange={(e) => setMoForm({...moForm, bom_id: e.target.value})} required>
                  <option value="">Select BOM...</option>
                  {bomsAll.map((b: any) => <option key={b.id} value={b.id}>{b.name} — {b.product_name}</option>)}
                </select>
              </div>
              <div><label className="label">Planned Quantity *</label><input type="number" min="1" className="input" value={moForm.planned_qty} onChange={(e) => setMoForm({...moForm, planned_qty: parseInt(e.target.value)})} required /></div>
              <div><label className="label">Notes</label><textarea className="input h-16 resize-none" value={moForm.notes} onChange={(e) => setMoForm({...moForm, notes: e.target.value})} /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowCreateMO(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" id="create-mo-submit" className="btn-primary flex-1" disabled={createMOMutation.isPending}>Create MO</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Create BOM Modal */}
      {showCreateBOM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Create Bill of Materials</h3>
              <button onClick={() => setShowCreateBOM(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createBOMMutation.mutate(bomForm) }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="label">BOM Name *</label><input className="input" value={bomForm.name} onChange={(e) => setBomForm({...bomForm, name: e.target.value})} required /></div>
                <div className="col-span-2"><label className="label">Finished Product *</label>
                  <select className="input" value={bomForm.product_id} onChange={(e) => setBomForm({...bomForm, product_id: e.target.value})} required>
                    <option value="">Select product...</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div><label className="label">Version</label><input className="input" value={bomForm.version} onChange={(e) => setBomForm({...bomForm, version: e.target.value})} /></div>
                <div><label className="label">Yield Qty</label><input type="number" min="0.1" step="0.1" className="input" value={bomForm.yield_qty} onChange={(e) => setBomForm({...bomForm, yield_qty: parseFloat(e.target.value)})} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="label mb-0">Components</label><button type="button" onClick={addBOMComponent} className="text-xs text-primary-600 hover:underline">+ Add Component</button></div>
                {bomForm.components.map((c, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <select className="input col-span-6" value={c.component_product_id} onChange={(e) => { const cs=[...bomForm.components]; cs[i]={...cs[i],component_product_id:e.target.value}; setBomForm({...bomForm,components:cs}) }} required>
                      <option value="">Component...</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" min="0.01" step="0.01" className="input col-span-3" placeholder="Qty" value={c.quantity} onChange={(e) => { const cs=[...bomForm.components]; cs[i]={...cs[i],quantity:parseFloat(e.target.value)}; setBomForm({...bomForm,components:cs}) }} required />
                    <select className="input col-span-2" value={c.unit_of_measure} onChange={(e) => { const cs=[...bomForm.components]; cs[i]={...cs[i],unit_of_measure:e.target.value}; setBomForm({...bomForm,components:cs}) }}>
                      {['pcs','kg','ltr','box','m','set'].map(u=><option key={u}>{u}</option>)}
                    </select>
                    <button type="button" onClick={() => setBomForm({...bomForm,components:bomForm.components.filter((_,idx)=>idx!==i)})} className="col-span-1 p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={14}/></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowCreateBOM(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" id="create-bom-submit" className="btn-primary flex-1" disabled={createBOMMutation.isPending}>Create BOM</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

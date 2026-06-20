import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { aiApi, productsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Bot, TrendingUp, ShoppingCart, Factory, Send, Sparkles, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AIPage() {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [copilotQuery, setCopilotQuery] = useState('')
  const [copilotHistory, setCopilotHistory] = useState<Array<{ q: string; a: string; type: string }>>([])
  const [activeTab, setActiveTab] = useState<'forecast' | 'procurement' | 'copilot'>('copilot')

  const { data: productsData } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.list({ page_size: 500 }) })
  const products = productsData?.data?.items || []

  const { data: forecastData, isLoading: fLoading } = useQuery({
    queryKey: ['forecast', selectedProduct],
    queryFn: () => aiApi.forecast(selectedProduct, 30),
    enabled: !!selectedProduct,
  })

  const { data: procurementData, isLoading: pLoading } = useQuery({
    queryKey: ['procurement-suggestions'],
    queryFn: () => aiApi.procurementSuggestions(),
    enabled: activeTab === 'procurement',
  })

  const copilotMutation = useMutation({
    mutationFn: (query: string) => aiApi.copilot(query),
    onSuccess: (res) => {
      const { query, answer, action_type } = res.data
      setCopilotHistory(prev => [...prev, { q: query, a: answer, type: action_type }])
      setCopilotQuery('')
    },
  })

  const forecast = forecastData?.data
  const procurement = procurementData?.data || []

  const PRIORITY_COLORS: Record<string, string> = { critical: 'text-red-500 bg-red-50', high: 'text-orange-500 bg-orange-50', medium: 'text-yellow-600 bg-yellow-50' }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h2 className="page-title">AI Insights</h2>
          <p className="text-sm text-gray-500">Demand forecasting, procurement suggestions, and ERP copilot</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'copilot', label: 'ERP Copilot', icon: Sparkles },
          { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
          { id: 'procurement', label: 'Procurement AI', icon: ShoppingCart },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab===id?'bg-white shadow-sm text-primary-700':'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {/* Copilot */}
      {activeTab === 'copilot' && (
        <div className="card overflow-hidden flex flex-col" style={{ height: '500px' }}>
          <div className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 flex items-center gap-2">
            <Bot size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-800">ERP Copilot — Ask anything about your business</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {copilotHistory.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Bot size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Ask me anything! Try:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {["Show low stock products", "What is my revenue?", "Purchase suggestions", "Fastest vendor"].map(q => (
                    <button key={q} onClick={() => { setCopilotQuery(q); copilotMutation.mutate(q) }} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1.5 hover:bg-purple-100 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {copilotHistory.map((msg, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end"><div className="bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm max-w-xs">{msg.q}</div></div>
                <div className="flex justify-start"><div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 text-sm max-w-md">{msg.a}</div></div>
              </div>
            ))}
            {copilotMutation.isPending && (
              <div className="flex justify-start"><div className="bg-gray-100 rounded-2xl px-4 py-2"><Loader2 size={14} className="animate-spin text-gray-400" /></div></div>
            )}
          </div>
          <div className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); if (copilotQuery.trim()) copilotMutation.mutate(copilotQuery.trim()) }} className="flex gap-2">
              <input id="copilot-input" className="input flex-1" value={copilotQuery} onChange={(e) => setCopilotQuery(e.target.value)} placeholder="Ask about sales, inventory, vendors..." />
              <button type="submit" id="copilot-send" disabled={copilotMutation.isPending || !copilotQuery.trim()} className="btn-primary px-3">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Demand Forecast */}
      {activeTab === 'forecast' && (
        <div className="space-y-4">
          <div className="card p-4">
            <label className="label">Select Product to Forecast</label>
            <select id="forecast-product" className="input max-w-sm" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
              <option value="">Choose a product...</option>
              {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          {fLoading && <div className="card p-6 h-48 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-primary-500" /></div>}
          {forecast && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="card p-4 xl:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">30-Day Demand Forecast — {forecast.product_name}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={forecast.forecast.slice(0, 30)}>
                    <defs>
                      <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="predicted_qty" stroke="#8b5cf6" strokeWidth={2} fill="url(#fGrad)" name="Predicted" />
                    <Area type="monotone" dataKey="upper_bound" stroke="#c4b5fd" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Upper" />
                    <Area type="monotone" dataKey="lower_bound" stroke="#c4b5fd" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Lower" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Avg Daily Demand', value: `${forecast.avg_daily_demand} units` },
                  { label: 'Confidence', value: `${(forecast.confidence * 100).toFixed(0)}%` },
                  { label: 'SKU', value: forecast.product_sku },
                ].map(({ label, value }) => (
                  <div key={label} className="card p-4"><p className="text-xs text-gray-500">{label}</p><p className="text-lg font-bold text-gray-900">{value}</p></div>
                ))}
                <div className="card p-4 border-l-4 border-violet-400">
                  <p className="text-xs text-gray-500 mb-1">Recommendation</p>
                  <p className="text-sm text-gray-700">{forecast.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Procurement Suggestions */}
      {activeTab === 'procurement' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{procurement.length} products need restocking</p>
          </div>
          {pLoading ? <div className="card p-8 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-primary-500" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {procurement.map((s: any) => (
                <div key={s.product_id} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{s.product_name}</p>
                      <p className="text-xs text-gray-500 font-mono">{s.sku}</p>
                    </div>
                    <span className={`badge ${PRIORITY_COLORS[s.priority]}`}>{s.priority}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Current Stock</span><span className="font-medium">{s.current_stock}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Reorder Level</span><span className="font-medium">{s.reorder_level}</span></div>
                    <div className="flex justify-between text-primary-700"><span className="font-medium">Suggested Order</span><span className="font-bold">{s.suggested_qty} units</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Est. Cost</span><span className="font-medium">{formatCurrency(s.estimated_cost)}</span></div>
                    {s.preferred_vendor_name && <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium text-xs">{s.preferred_vendor_name}</span></div>}
                  </div>
                </div>
              ))}
              {procurement.length === 0 && (
                <div className="col-span-3 card p-12 text-center">
                  <p className="text-4xl mb-2">✅</p>
                  <p className="font-medium text-gray-900">No procurement suggestions</p>
                  <p className="text-sm text-gray-500">All products are above reorder levels</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

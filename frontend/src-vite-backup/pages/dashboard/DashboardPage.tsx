import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import StatCard from '@/components/shared/StatCard'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import { DollarSign, ShoppingCart, Package, Factory, Truck, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { data: kpisData, isLoading: kLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardApi.kpis(),
    refetchInterval: 60_000,
  })

  const { data: chartsData, isLoading: cLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: () => dashboardApi.charts(),
    refetchInterval: 300_000,
  })

  const kpis = kpisData?.data
  const charts = chartsData?.data

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Monthly Revenue" isCurrency
          value={kpis?.total_revenue?.value ?? 0}
          change={kpis?.total_revenue?.change_pct}
          trend={kpis?.total_revenue?.trend}
          icon={<DollarSign size={20} />}
          color="primary"
        />
        <StatCard
          label="Total Orders"
          value={kpis?.total_orders?.value ?? 0}
          icon={<ShoppingCart size={20} />}
          color="blue"
        />
        <StatCard
          label="Inventory Value" isCurrency
          value={kpis?.inventory_value?.value ?? 0}
          icon={<Package size={20} />}
          color="purple"
        />
        <StatCard
          label="Active MOs"
          value={kpis?.active_manufacturing?.value ?? 0}
          icon={<Factory size={20} />}
          color="orange"
        />
        <StatCard
          label="Pending Deliveries"
          value={kpis?.pending_deliveries?.value ?? 0}
          icon={<Truck size={20} />}
          color="green"
        />
        <StatCard
          label="Low Stock"
          value={kpis?.low_stock_count?.value ?? 0}
          icon={<AlertTriangle size={20} />}
          color="red"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Sales Trend */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Sales Revenue Trend</h3>
          {cLoading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={charts?.sales_trend || []}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Purchase Trend */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Purchase Spend Trend</h3>
          {cLoading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts?.purchase_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="card p-5 xl:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Products by Revenue</h3>
          {cLoading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts?.top_products || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* MO Trend */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Manufacturing Orders</h3>
          {cLoading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={(charts?.manufacturing_trend || []).slice(-6)}>
                <defs>
                  <linearGradient id="moGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#moGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

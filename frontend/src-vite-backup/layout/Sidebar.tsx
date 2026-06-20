import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import {
  LayoutDashboard, Package, Users, Truck, BarChart3,
  ShoppingCart, ShoppingBag, Factory, FileText, Bot,
  Warehouse, LogOut, ChevronRight, Zap
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/vendors', icon: Truck, label: 'Vendors' },
  { path: '/inventory', icon: Warehouse, label: 'Inventory' },
  { path: '/sales', icon: ShoppingCart, label: 'Sales' },
  { path: '/purchases', icon: ShoppingBag, label: 'Purchasing' },
  { path: '/manufacturing', icon: Factory, label: 'Manufacturing' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/ai', icon: Bot, label: 'AI Insights' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0f172a] flex flex-col z-50 border-r border-white/5">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Mini ERP</p>
          <p className="text-[#64748b] text-xs mt-0.5">Enterprise Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.full_name}</p>
            <p className="text-[#64748b] text-[10px] capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button onClick={handleLogout} className="text-[#64748b] hover:text-red-400 transition-colors p-1" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}

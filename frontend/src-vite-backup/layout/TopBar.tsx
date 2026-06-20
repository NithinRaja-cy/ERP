import { useLocation } from 'react-router-dom'
import { Bell, Search, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/customers': 'Customers',
  '/vendors': 'Vendors',
  '/inventory': 'Inventory',
  '/sales': 'Sales Orders',
  '/purchases': 'Purchase Orders',
  '/manufacturing': 'Manufacturing',
  '/reports': 'Reports',
  '/ai': 'AI Insights',
}

export default function TopBar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [dark, setDark] = useState(false)
  const title = PAGE_TITLES[location.pathname] || 'Mini ERP'

  const toggleDark = () => {
    setDark(!dark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Toggle dark mode"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative" title="Notifications">
          <Bell size={17} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

import { Home, Package, ShoppingCart, Activity, Settings, Factory, Truck, Users, UserCheck, Shield, BookOpen } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Customers', icon: UserCheck, href: '/customers' },
  { name: 'Sales Orders', icon: ShoppingCart, href: '/sales' },
  { name: 'Manufacturing', icon: Factory, href: '/manufacturing' },
  { name: 'Inventory', icon: Package, href: '/inventory' },
  { name: 'Purchasing', icon: ShoppingCart, href: '/purchasing' },
  { name: 'Deliveries', icon: Truck, href: '/deliveries' },
  { name: 'Analytics', icon: Activity, href: '/analytics' },
  { name: 'Bill of Materials', icon: BookOpen, href: '/bom' },
  { name: 'Audit Logs', icon: Shield, href: '/audit-logs' },
  { name: 'Team Settings', icon: Users, href: '/admin-settings' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-slate-900/60 dark:bg-slate-950/65 border-r border-slate-200 dark:border-slate-800/80 h-full text-slate-700 dark:text-slate-300 backdrop-blur-md">
      <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-850">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wider">
          Smart<span className="text-indigo-500">ERP</span>
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white transition-all group"
            >
              <item.icon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-850">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">System Admin</p>
            <p className="text-xs text-slate-500">admin@smarterp.com</p>
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/';
          }}
          className="w-full text-left text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

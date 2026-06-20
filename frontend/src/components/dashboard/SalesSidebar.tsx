"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ClipboardList, LogOut } from 'lucide-react';

const nav = [
  { name: 'Dashboard',        icon: LayoutDashboard, href: '/sales-dashboard' },
  { name: 'Products',         icon: Package,         href: '/sales-dashboard/products' },
  { name: 'Sales Orders',     icon: ClipboardList,   href: '/sales-dashboard/orders' },
];

export default function SalesSidebar() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col w-64 bg-slate-950 border-r border-emerald-900/30 h-screen text-slate-300">
      <div className="flex flex-col items-center justify-center h-20 border-b border-slate-800 px-4">
        <h1 className="text-xl font-bold text-white tracking-wider">Smart<span className="text-emerald-500">ERP</span></h1>
        <span className="text-xs text-emerald-400 mt-0.5 font-medium">Sales Portal</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${active ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-slate-900 hover:text-white'}`}>
                <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">SM</div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Sales Manager</p>
            <p className="text-xs text-slate-500">sales@smarterp.com</p>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/'; }}
          className="w-full text-left text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1">
          <LogOut className="h-3 w-3" /> Sign Out
        </button>
      </div>
    </div>
  );
}

"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Store, LogOut } from 'lucide-react';

const nav = [
  { name: 'Dashboard',          icon: LayoutDashboard, href: '/purchasing-dashboard' },
  { name: 'Purchase Orders',    icon: ShoppingBag,     href: '/purchasing-dashboard/orders' },
  { name: 'Supplier Shops',     icon: Store,           href: '/purchasing-dashboard' },
];

export default function PurchasingSidebar() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col w-64 bg-slate-950 border-r border-amber-900/30 h-screen text-slate-300">
      <div className="flex flex-col items-center justify-center h-20 border-b border-slate-800 px-4">
        <h1 className="text-xl font-bold text-white tracking-wider">Smart<span className="text-amber-500">ERP</span></h1>
        <span className="text-xs text-amber-400 mt-0.5 font-medium">Purchasing Portal</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${active ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-slate-900 hover:text-white'}`}>
                <item.icon className={`mr-3 h-5 w-5 ${active ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">PM</div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Purchasing Manager</p>
            <p className="text-xs text-slate-500">purchase@smarterp.com</p>
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

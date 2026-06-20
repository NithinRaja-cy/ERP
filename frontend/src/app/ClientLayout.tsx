"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import CustomerSidebar from "@/components/dashboard/CustomerSidebar";
import PurchasingSidebar from "@/components/dashboard/PurchasingSidebar";
import SalesSidebar from "@/components/dashboard/SalesSidebar";
import InventoryMgrSidebar from "@/components/dashboard/InventoryMgrSidebar";
import MfgSidebar from "@/components/dashboard/MfgSidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Menu, X } from "lucide-react";

const ROLE_ROUTES: Record<string, string[]> = {
  admin:         ['/dashboard', '/sales', '/manufacturing', '/inventory', '/purchasing', '/deliveries', '/analytics', '/settings', '/admin-settings', '/customers', '/bom', '/audit-logs'],
  customer:      ['/customer-dashboard', '/customer-products', '/customer-orders'],
  purchasing:    ['/purchasing-dashboard', '/purchasing-dashboard/orders'],
  sales:         ['/sales-dashboard', '/sales-dashboard/products', '/sales-dashboard/orders'],
  inventory:     ['/inventory-dashboard', '/inventory-dashboard/onloading', '/inventory-dashboard/materials'],
  manufacturing: ['/mfg-dashboard', '/mfg-dashboard/products', '/mfg-dashboard/orders', '/mfg-dashboard/bom'],
};

const ROLE_HOME: Record<string, string> = {
  admin:         '/dashboard',
  customer:      '/customer-dashboard',
  purchasing:    '/purchasing-dashboard',
  sales:         '/sales-dashboard',
  inventory:     '/inventory-dashboard',
  manufacturing: '/mfg-dashboard',
};

const AUTH_PAGES = ['/', '/register'];

function SidebarForRole({ role }: { role: string }) {
  switch (role) {
    case 'customer':      return <CustomerSidebar />;
    case 'purchasing':    return <PurchasingSidebar />;
    case 'sales':         return <SalesSidebar />;
    case 'inventory':     return <InventoryMgrSidebar />;
    case 'manufacturing': return <MfgSidebar />;
    default:              return <Sidebar />;
  }
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'admin';
    setUserRole(role);

    if (!token && !isAuthPage) {
      router.push('/');
      return;
    }

    if (token && isAuthPage) {
      router.push(ROLE_HOME[role] || '/dashboard');
      return;
    }

    if (token && !isAuthPage) {
      const allowed = ROLE_ROUTES[role] || [];
      const isAllowed = allowed.some(r => pathname === r || pathname.startsWith(r + '/'));
      if (!isAllowed) {
        router.push(ROLE_HOME[role] || '/dashboard');
        return;
      }
    }

    setIsChecking(false);
  }, [pathname, isAuthPage, router]);

  // Close sidebar on navigation change (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isChecking && !isAuthPage) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <span className="text-sm font-medium tracking-wide">Loading smart system...</span>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <main className="flex-1 overflow-y-auto">{children}</main>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <SidebarForRole role={userRole} />
      </div>

      {/* Mobile Sidebar overlay/drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative flex flex-col w-64 bg-background border-r border-border h-full shadow-2xl animate-slide-in">
            <button 
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-full pt-10">
              <SidebarForRole role={userRole} />
            </div>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/45 dark:bg-slate-950/45 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              id="hamburger-menu"
              className="md:hidden p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 text-foreground transition-colors" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-sm sm:text-base text-foreground uppercase tracking-wider bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
              {userRole} Portal
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Global theme change button on all pages */}
            <ThemeToggle />
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                {userRole.substring(0, 2)}
              </div>
              <span className="hidden sm:inline text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                {userRole}
              </span>
            </div>
          </div>
        </header>

        {/* Content Wrapper using glass-panel styling */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/30 dark:bg-slate-950/20">
          <div className="w-full max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

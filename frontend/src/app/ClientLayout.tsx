"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import CustomerSidebar from "@/components/dashboard/CustomerSidebar";
import PurchasingSidebar from "@/components/dashboard/PurchasingSidebar";
import SalesSidebar from "@/components/dashboard/SalesSidebar";
import InventoryMgrSidebar from "@/components/dashboard/InventoryMgrSidebar";
import MfgSidebar from "@/components/dashboard/MfgSidebar";

const ROLE_ROUTES: Record<string, string[]> = {
  admin:         ['/dashboard', '/sales', '/manufacturing', '/inventory', '/purchasing', '/deliveries', '/analytics', '/settings', '/admin-settings', '/customers'],
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
      // Check if current path is in allowed routes (prefix match for sub-routes)
      const isAllowed = allowed.some(r => pathname === r || pathname.startsWith(r + '/'));
      if (!isAllowed) {
        router.push(ROLE_HOME[role] || '/dashboard');
        return;
      }
    }

    setIsChecking(false);
  }, [pathname, isAuthPage, router]);

  if (isChecking && !isAuthPage) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400">Loading...</div>;
  }

  if (isAuthPage) {
    return <main className="flex-1 overflow-y-auto">{children}</main>;
  }

  return (
    <>
      <SidebarForRole role={userRole} />
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        {children}
      </main>
    </>
  );
}

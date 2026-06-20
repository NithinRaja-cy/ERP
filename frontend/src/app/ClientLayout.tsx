"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const isAuthPage = pathname === "/" || pathname === "/register";

  useEffect(() => {
    // Check auth state
    const token = localStorage.getItem('token');
    
    if (!token && !isAuthPage) {
      // Unauthenticated users trying to access protected routes go to login
      router.push('/');
    } else if (token && isAuthPage) {
      // Authenticated users trying to access login/register go to dashboard
      router.push('/dashboard');
    } else {
      setIsAuthenticated(true);
      setIsChecking(false);
    }
  }, [pathname, isAuthPage, router]);

  if (isChecking && !isAuthPage) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-slate-400">Loading...</div>;
  }

  if (isAuthPage) {
    return <main className="flex-1 overflow-y-auto">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        {children}
      </main>
    </>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sun, Moon, UserPlus, Eye, EyeOff } from "lucide-react";
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // ── Save auth ──────────────────────────────────────────────
      localStorage.setItem('token', 'simulated_jwt_token_customer');
      localStorage.setItem('role', 'customer');

      // ── Persist customer record so admin can see it ────────────
      const existing = JSON.parse(localStorage.getItem('erp_registered_customers') || '[]');
      const alreadyExists = existing.some((c: { email: string }) => c.email === email);
      if (!alreadyExists) {
        const newRecord = {
          id: `CUST-${String(Date.now()).slice(-5)}`,
          name,
          email,
          phone: '',
          company: 'Self-Registered',
          city: '',
          creditLimit: 50000,
          outstandingBalance: 0,
          notes: 'Customer registered via the SmartERP portal self-signup.',
          status: 'ACTIVE',
          role: 'customer',
          permission: 'CUSTOMER_PORTAL',
          registeredAt: new Date().toISOString(),
          isPortalUser: true,
        };
        existing.push(newRecord);
        localStorage.setItem('erp_registered_customers', JSON.stringify(existing));
      }

      window.location.href = "/customer-dashboard";
    }, 1000);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>

      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -right-[10%] w-[55%] h-[55%] rounded-full blur-[130px] ${dark ? 'bg-emerald-500/10' : 'bg-emerald-400/20'}`} />
        <div className={`absolute bottom-[5%] -left-[10%] w-[45%] h-[45%] rounded-full blur-[130px] ${dark ? 'bg-indigo-500/10' : 'bg-indigo-400/20'}`} />
      </div>

      {/* Theme toggle */}
      <button
        id="theme-toggle-register"
        onClick={() => setDark(!dark)}
        className={`fixed top-5 right-5 z-50 p-2.5 rounded-full border backdrop-blur-sm transition-all ${dark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-black/10 border-black/20 text-slate-800 hover:bg-black/20'}`}
        title="Toggle theme"
      >
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <h1 className={`text-4xl font-bold tracking-wider ${dark ? 'text-white' : 'text-slate-900'}`}>
            Smart<span className="text-indigo-500">ERP</span>
          </h1>
        </div>

        {/* Glass card */}
        <div className={`rounded-2xl border p-8 shadow-2xl backdrop-blur-xl ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/60'}`}>
          <h2 className={`text-2xl font-bold text-center mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>Create an Account</h2>
          <p className={`text-sm text-center mb-6 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Sign up as a customer to track your orders.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none border focus:ring-2 focus:ring-indigo-500 transition-all ${dark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white/80 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none border focus:ring-2 focus:ring-indigo-500 transition-all ${dark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white/80 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                placeholder="customer@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-xl px-4 py-3 pr-10 text-sm outline-none border focus:ring-2 focus:ring-indigo-500 transition-all ${dark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white/80 border-slate-300 text-slate-900 placeholder-slate-400'}`}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl text-sm font-medium transition-all group mt-2"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              {!loading && <UserPlus className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />}
            </Button>

            <p className={`text-sm text-center pt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Already have an account?{' '}
              <Link href="/" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

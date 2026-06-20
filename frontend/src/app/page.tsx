"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Lock, Eye, EyeOff, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from 'next/link';

// Credentials map: email -> { password, role, redirect }
const CREDENTIALS: Record<string, { password: string; role: string; redirect: string }> = {
  'admin@smarterp.com':     { password: 'admin',          role: 'admin',         redirect: '/dashboard' },
  'customer@smarterp.com':  { password: 'customer123',    role: 'customer',      redirect: '/customer-dashboard' },
  'purchase@smarterp.com':  { password: 'purchase@123',   role: 'purchasing',    redirect: '/purchasing-dashboard' },
  'sales@smarterp.com':     { password: 'sales@456',      role: 'sales',         redirect: '/sales-dashboard' },
  'inventory@smarterp.com': { password: 'inventory@789',  role: 'inventory',     redirect: '/inventory-dashboard' },
  'mfg@smarterp.com':       { password: 'mfg@321',        role: 'manufacturing', redirect: '/mfg-dashboard' },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const cred = CREDENTIALS[email.toLowerCase().trim()];
      if (!cred) {
        setError('No account found with this email address.');
        return;
      }
      if (cred.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }
      localStorage.setItem('token', 'simulated_jwt_token');
      localStorage.setItem('role', cred.role);
      window.location.href = cred.redirect;
    }, 800);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setForgotSuccess(`We have sent a password reset link to ${forgotEmail}. Please check your inbox (simulated).`);
      } else {
        setForgotError(data.detail || 'Failed to request password reset.');
      }
    } catch (err) {
      // Fallback in case backend is offline during client dev builds
      setForgotSuccess(`We have sent a password reset link to ${forgotEmail}. Please check your inbox (simulated).`);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-wider">Smart<span className="text-indigo-500">ERP</span></h1>
        </div>

        {mode === 'login' ? (
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-white text-center">Welcome back</CardTitle>
              <CardDescription className="text-slate-400 text-center">
                Sign in with your role credentials to access your portal.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400 text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="yourname@smarterp.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setMode('forgot');
                        setForgotSuccess('');
                        setForgotError('');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col pt-2 pb-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-lg text-md font-medium transition-all group"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>

                <div className="mt-6 flex items-center justify-center p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Sparkles className="h-4 w-4 text-indigo-400 mr-2" />
                  <span className="text-xs text-indigo-300">Multi-Role Enterprise Access Control</span>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                <Lock className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Security Portal</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your registered email address and we will forward a password reset link.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleForgotPassword}>
              <CardContent className="space-y-4">
                {forgotError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400 text-center">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 flex flex-col items-center text-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    <p className="font-semibold">Reset Link Dispatched</p>
                    <p className="text-xs text-slate-400">{forgotSuccess}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="yourname@smarterp.com"
                        required
                      />
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col pt-2 pb-6 space-y-4">
                {!forgotSuccess && (
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-lg text-md font-medium transition-all"
                  >
                    {forgotLoading ? 'Processing...' : 'Send Reset Link'}
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex items-center justify-center text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                </button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

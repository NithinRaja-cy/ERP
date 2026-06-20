"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@smarterp.com');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('token', 'simulated_jwt_token');
      window.location.href = "/dashboard";
    }, 1000);
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

        <Card className="bg-slate-900 border-slate-800 shadow-2xl backdrop-blur-xl bg-opacity-90">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-white text-center">Welcome back</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              Enter your credentials to access the command center.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="admin@smarterp.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <button 
                    type="button"
                    onClick={() => {
                      if(email) setResetSent(true);
                      else alert("Please enter your email address first.");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col pt-2 pb-6">
              {resetSent && (
                <div className="mb-4 w-full p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <p className="text-sm text-emerald-400">Password reset link sent to {email}</p>
                  <p className="text-xs text-emerald-500 mt-1">(Simulated in Local Dev Environment)</p>
                </div>
              )}
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
                <span className="text-xs text-indigo-300">AI-Powered Enterprise Security</span>
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
      </div>
    </div>
  );
}

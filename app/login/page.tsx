'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect them based on their role
    if (user && !loading) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'seller') router.push('/seller/dashboard');
      else router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-[#FDFBF7]">
        <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#C86B45]">Welcome Back</h1>
            <p className="text-zinc-500 text-sm mt-2">Sign in to support street artisans & track your crafts</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                placeholder="customer@artify.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#C86B45] focus:ring-1 focus:ring-[#C86B45]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#C86B45] focus:ring-1 focus:ring-[#C86B45]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full clay-button py-3.5 rounded-full font-semibold shadow-md hover:shadow-lg disabled:opacity-50 text-sm mt-2"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Login Helper */}
          <div className="mt-6 border-t border-zinc-100 pt-6">
            <p className="text-xs text-zinc-500 text-center font-medium mb-3">Quick Credentials (Demo Seed)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setEmail('customer@artify.com'); setPassword('password123'); }}
                className="px-2 py-1.5 bg-[#F5EFEB] rounded-xl text-[10px] font-medium text-zinc-700 hover:bg-[#DCA07B]/20 transition-all"
              >
                Customer
              </button>
              <button
                onClick={() => { setEmail('devi@artify.com'); setPassword('password123'); }}
                className="px-2 py-1.5 bg-[#F5EFEB] rounded-xl text-[10px] font-medium text-zinc-700 hover:bg-[#DCA07B]/20 transition-all"
              >
                Artisan
              </button>
              <button
                onClick={() => { setEmail('admin@artify.com'); setPassword('password123'); }}
                className="px-2 py-1.5 bg-[#F5EFEB] rounded-xl text-[10px] font-medium text-zinc-700 hover:bg-[#DCA07B]/20 transition-all"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-zinc-500">
            New to Artify?{' '}
            <Link href="/register" className="font-semibold text-[#C86B45] hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

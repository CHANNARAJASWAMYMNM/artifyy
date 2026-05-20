'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // default customer
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'seller') router.push('/seller/dashboard');
      else router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    const result = await register(name, email, password, role);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-[#FDFBF7]">
        <div className="w-full max-w-md bg-white border border-zinc-100 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#C86B45]">Create Account</h1>
            <p className="text-zinc-500 text-sm mt-2">Join Artify to buy or sell beautiful handmade crafts</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#C86B45] focus:ring-1 focus:ring-[#C86B45]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="rohan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#C86B45] focus:ring-1 focus:ring-[#C86B45]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#C86B45] focus:ring-1 focus:ring-[#C86B45]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 font-sans">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`rounded-xl border p-3 text-center text-sm font-medium transition-all ${
                    role === 'customer'
                      ? 'border-[#C86B45] bg-[#C86B45]/5 text-[#C86B45]'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  Buy Crafts
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`rounded-xl border p-3 text-center text-sm font-medium transition-all ${
                    role === 'seller'
                      ? 'border-[#C86B45] bg-[#C86B45]/5 text-[#C86B45]'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  Sell My Crafts
                </button>
              </div>
            </div>

            {role === 'seller' && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 leading-relaxed">
                💡 **Artisan accounts require Admin approval.** After joining, you can fill out your craft story and shop details. You will be able to list items as soon as your account is reviewed by our curators.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full clay-button py-3 rounded-full font-semibold shadow-md hover:shadow-lg disabled:opacity-50 text-sm mt-3"
            >
              {submitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#C86B45] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

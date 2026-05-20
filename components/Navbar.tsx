'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#F5EFEB] bg-[#FFFFFF]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#C86B45] font-serif">Artify</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link href="/" className="hover:text-[#C86B45] transition-colors">Home</Link>
            <Link href="/products" className="hover:text-[#C86B45] transition-colors">Browse Crafts</Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:block flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search handmade pottery, clay jewelry, sculptures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-200 bg-[#FDFBF7] py-2 pl-4 pr-10 text-sm outline-none transition-all focus:border-[#C86B45] focus:ring-1 focus:ring-[#C86B45]"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-zinc-400 hover:text-[#C86B45]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Cart Icon (Only for Customers or Guest users) */}
          {(!user || user.role === 'customer') && (
            <Link href="/cart" className="relative p-2 text-zinc-600 hover:text-[#C86B45] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C86B45] text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-[#FDFBF7] px-3 py-1.5 text-sm font-medium hover:border-[#C86B45] transition-all"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DCA07B] text-xs text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-zinc-700">{user.name.split(' ')[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-zinc-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-50">
                    <p className="text-xs font-semibold text-[#C86B45] uppercase tracking-wider">{user.role} Account</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  
                  {/* Customer Links */}
                  {user.role === 'customer' && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-[#FDFBF7] hover:text-[#C86B45]"
                      >
                        My Orders & Tracking
                      </Link>
                    </>
                  )}

                  {/* Seller Links */}
                  {user.role === 'seller' && (
                    <>
                      <Link
                        href="/seller/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-[#FDFBF7] hover:text-[#C86B45]"
                      >
                        Seller Studio
                      </Link>
                    </>
                  )}

                  {/* Admin Links */}
                  {user.role === 'admin' && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-[#FDFBF7] hover:text-[#C86B45]"
                      >
                        Admin Control Panel
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-t border-zinc-50 mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-[#C86B45] transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#C86B45] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#B55A35] transition-all"
              >
                Join Artify
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

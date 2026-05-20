import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#F5EFEB] bg-white text-zinc-600 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <span className="text-2xl font-bold tracking-tight text-[#C86B45] font-serif">Artify</span>
            <p className="text-sm max-w-xs text-zinc-500 leading-6">
              Empowering local street artisans, pottery makers, and handmade creators to tell their unique stories and connect with global customers.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-[#C86B45] tracking-wider uppercase">Shop</h3>
                <ul role="list" className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link href="/products?category=Pottery" className="hover:text-[#C86B45] transition-colors">Pottery</Link>
                  </li>
                  <li>
                    <Link href="/products?category=Clay%20Sculptures" className="hover:text-[#C86B45] transition-colors">Clay Sculptures</Link>
                  </li>
                  <li>
                    <Link href="/products?category=Jewelry" className="hover:text-[#C86B45] transition-colors">Handmade Jewelry</Link>
                  </li>
                  <li>
                    <Link href="/products?category=Home%20Decor" className="hover:text-[#C86B45] transition-colors">Home Decor</Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-[#C86B45] tracking-wider uppercase">Join Us</h3>
                <ul role="list" className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link href="/register?role=seller" className="hover:text-[#C86B45] transition-colors">Sell on Artify</Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#C86B45] transition-colors">Register as Customer</Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-[#C86B45] transition-colors">Artisan Login</Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-[#C86B45] tracking-wider uppercase">About</h3>
              <ul role="list" className="mt-4 space-y-3 text-sm text-zinc-500">
                <li className="leading-6">
                  Artify is an open marketplace bringing the warmth of handmade, rustic products directly from the artisan's wheel to your doorstep.
                </li>
                <li className="text-xs pt-4 text-zinc-400">
                  © {new Date().getFullYear()} Artify Inc. All rights reserved. Created with love & clay.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

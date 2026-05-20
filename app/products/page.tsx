'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  numReviews: number;
  seller: { _id: string; name: string } | string;
}

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load URL filters initially
  const initialKeyword = searchParams.get('keyword') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('latest');

  const categories = ['All', 'Pottery', 'Clay Sculptures', 'Jewelry', 'Home Decor', 'Kitchenware', 'Paintings', 'Other'];

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
      const params = new URLSearchParams();
      
      if (keyword) params.append('keyword', keyword);
      if (category && category !== 'All') params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);

      const res = await fetch(`${backendUrl}/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch products when category or search query from navigation changes
    setKeyword(searchParams.get('keyword') || '');
    setCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [category, sort]); // auto fetch on category/sort change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredProducts();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('latest');
    router.push('/products');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm h-fit">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
          <h2 className="font-serif text-lg font-bold text-zinc-800">Filters</h2>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-[#C86B45] hover:underline"
          >
            Clear All
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Search</label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="e.g. Glazed bowl"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-[#FDFBF7] px-3.5 py-2 text-xs outline-none focus:border-[#C86B45]"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-zinc-400 hover:text-[#C86B45]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Category</label>
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-[#C86B45]/10 text-[#C86B45]'
                    : 'text-zinc-600 hover:bg-[#FDFBF7] hover:text-[#C86B45]'
                }`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Price Range (₹)</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-[#FDFBF7] px-3 py-2 text-xs outline-none focus:border-[#C86B45]"
            />
            <span className="text-zinc-400 text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-[#FDFBF7] px-3 py-2 text-xs outline-none focus:border-[#C86B45]"
            />
          </div>
          <button
            onClick={fetchFilteredProducts}
            className="w-full clay-button py-2 rounded-xl text-xs font-semibold mt-3.5 shadow-sm"
          >
            Apply Price
          </button>
        </div>
      </aside>

      {/* Product List Panel */}
      <div className="flex-1">
        
        {/* Top bar controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-zinc-100 gap-4">
          <p className="text-sm text-zinc-500 font-medium">
            Found <span className="text-[#C86B45] font-bold">{products.length}</span> unique creations
          </p>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sort by</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#C86B45] text-zinc-700"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-zinc-50 border border-zinc-100 aspect-square w-full"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl bg-white border border-zinc-100 shadow-sm">
            <span className="text-5xl">🍶</span>
            <h3 className="font-serif text-xl font-bold text-zinc-700 mt-4">No creations match filters</h3>
            <p className="text-zinc-400 text-sm mt-1">Try tweaking your price range, search keyword, or categories.</p>
            <button
              onClick={handleResetFilters}
              className="clay-button inline-flex items-center justify-center px-6 py-2.5 rounded-full font-semibold text-xs mt-6"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-800">The Artisan Gallery</h1>
          <p className="text-zinc-500 text-sm mt-1.5">Directly sourced, entirely handmade, pure organic crafts</p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C86B45]"></div>
          </div>
        }>
          <ProductsCatalogContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

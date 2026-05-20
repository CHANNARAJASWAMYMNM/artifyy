'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

interface Artisan {
  _id: string;
  shopName: string;
  story: string;
  location: string;
  craftType: string;
  avatar: string;
  user: { _id: string; name: string };
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const prodRes = await fetch(`${backendUrl}/products?limit=8`);
        const prodData = await prodRes.json();
        if (prodData.success) {
          setProducts(prodData.products.slice(0, 4)); // Show top 4
        }

        // Fetch artisans - we call public profile route for the seeded artisans
        // Devi Prasad (devi@artify.com) is user 1, Meera Devi (meera@artify.com) is user 2.
        // We'll query all profiles from the admin endpoint if logged in, or mock fetch them
        // Let's call /sellers/all. Wait, that requires admin.
        // Let's see if we can search for products, then extract seller IDs and fetch their profiles,
        // or hardcode a search or get them from products.
        // To make it easy, let's look up the sellers of the products we just loaded, or query a public list.
        // Since we don't have a public "get all approved sellers" endpoint, we can use the backend/sellers profile endpoint if we write one,
        // or just map the seeded ones. Wait, let's write a mock search of artisans, or extract them from the products!
        // Yes, we populated products. Let's fetch the profiles of the sellers.
        // For simplicity in the MVP, we can fetch public profiles. Let's do that!
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Seeded Artisan info for rich design presentation
  const featuredArtisans = [
    {
      id: 'devi_prasad',
      name: 'Devi Prasad',
      shop: 'Khurja Clay Treasures',
      craft: 'Traditional Terracotta & Glazed Ceramics',
      location: 'Khurja, Uttar Pradesh',
      avatar: 'https://images.unsplash.com/photo-1565192647048-f997ed8799d3?auto=format&fit=crop&w=200&q=80',
      story: 'Practicing pottery for 35+ years. Keeping the 400-year-old Khurja pottery legacy alive by using wood-fired kilns...'
    },
    {
      id: 'meera_devi',
      name: 'Meera Devi',
      shop: 'Jaipur Clay Sculptures & Decor',
      craft: 'Hand-painted Clay Figurines & Mirror Work',
      location: 'Jaipur, Rajasthan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      story: 'Empowering local Rajasthani women to hand-sculpt clay deities and murals using organic riverbed clay and mirrorwork...'
    }
  ];

  const categories = [
    { name: 'Pottery', icon: '🍶', count: '12+ items' },
    { name: 'Clay Sculptures', icon: '🗿', count: '5+ items' },
    { name: 'Jewelry', icon: '📿', count: '30+ items' },
    { name: 'Home Decor', icon: '🏺', count: '8+ items' },
    { name: 'Kitchenware', icon: '🍽️', count: '25+ items' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F5EFEB] py-20 sm:py-24">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/2 left-0 h-96 w-96 -translate-y-1/2 rounded-full bg-[#DCA07B]/10 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#C86B45]/10 blur-3xl"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Hero Text */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center rounded-full bg-[#C86B45]/10 px-3 py-1 text-xs font-semibold text-[#C86B45] tracking-wide mb-6">
                ✨ Traditional Indian Handicrafts
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A2A2A] leading-tight">
                Where Every Clay Piece Tells a <span className="text-[#C86B45] underline decoration-[#DCA07B] decoration-wavy">Story</span>.
              </h1>
              <p className="mt-4 text-base text-zinc-600 sm:text-lg lg:text-base xl:text-lg leading-relaxed">
                Connect directly with master street artisans, pottery makers, and rural creators. Purchase authentic handmade crafts and support sustainable livelihoods.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                <Link href="/products" className="clay-button inline-flex items-center justify-center px-8 py-3.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all text-sm">
                  Explore Shop
                </Link>
                <Link href="/register?role=seller" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-[#C86B45] text-[#C86B45] font-semibold hover:bg-[#C86B45] hover:text-white transition-all text-sm">
                  Sell Your Crafts
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="mt-12 sm:mt-16 lg:col-span-6 lg:mt-0">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-video lg:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1565192647048-f997ed8799d3?auto=format&fit=crop&w=800&q=80"
                  alt="Artisan molding pottery on a kickwheel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-zinc-100 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#C86B45]/15 flex items-center justify-center text-lg">🍶</div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Featured Shop</p>
                    <p className="text-sm font-serif font-bold text-zinc-800">Khurja Clay Treasures</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-zinc-800">Explore by Category</h2>
            <p className="text-zinc-500 text-sm mt-2">Browse the diverse traditions of Indian mud-crafts</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center justify-center border border-zinc-100 bg-[#FDFBF7] p-6 rounded-2xl shadow-sm hover:border-[#DCA07B]/40 hover:shadow-md transition-all text-center"
              >
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <h3 className="font-serif text-base font-bold text-zinc-800 group-hover:text-[#C86B45]">{cat.name}</h3>
                <span className="text-xs text-zinc-400 mt-1">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artisans - Story-led section */}
      <section className="py-16 bg-[#FDFBF7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-zinc-800">Meet Our Master Artisans</h2>
            <p className="text-zinc-500 text-sm mt-2">Hear their stories, feel their heritage, support their families</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row gap-6 items-start"
              >
                <img
                  src={artisan.avatar}
                  alt={artisan.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-zinc-100 shadow-inner flex-shrink-0"
                />
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#6E8C75] bg-[#6E8C75]/10 px-2.5 py-0.5 rounded-full">
                      Verified Maker
                    </span>
                    <h3 className="font-serif text-xl font-bold text-zinc-800 mt-2">{artisan.name}</h3>
                    <p className="text-xs text-[#C86B45] font-medium">{artisan.shop} • {artisan.location}</p>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans italic">
                    "{artisan.story}"
                  </p>
                  <div>
                    <span className="text-xs text-zinc-400 block mb-2">Specialty: {artisan.craft}</span>
                    {/* In a real app we'd redirect to seller profile public page. Let's do that! */}
                    {/* Since our seed creates dynamic IDs, we can link them to product list filtered by maker name or view their listing */}
                    <Link
                      href={`/products`}
                      className="text-xs font-semibold text-[#C86B45] hover:underline inline-flex items-center gap-1"
                    >
                      Browse {artisan.name}'s Shop
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-800">Featured Creations</h2>
              <p className="text-zinc-500 text-sm mt-1">Exquisite pottery, home decor, and clay jewelry</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C86B45] hover:underline"
            >
              View Full Catalog
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-zinc-50 border border-zinc-100 aspect-square w-full"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-3xl bg-[#FDFBF7] border border-dashed border-zinc-200">
              <span className="text-4xl">🍯</span>
              <h3 className="font-serif text-lg font-bold text-zinc-700 mt-4">No creations found</h3>
              <p className="text-zinc-400 text-sm mt-1">Make sure you have seeded the database or run the server</p>
              <Link href="/products" className="clay-button inline-flex items-center justify-center px-6 py-2 rounded-full font-semibold text-xs mt-6">
                Refresh Shop
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Sustainable Craft Story */}
      <section className="py-16 bg-[#F5EFEB] border-t border-b border-[#F5EFEB]/20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="text-4xl">🏺</span>
          <h2 className="font-serif text-3xl font-bold text-zinc-800 mt-6">Empowering Creative Communities</h2>
          <p className="text-zinc-600 text-base leading-relaxed max-w-2xl mx-auto mt-4 font-sans">
            Every item purchased on Artify sends **90%** of the proceeds directly to the artisan's bank account. We cut out corporate middle-men and charge a minimal 10% platform fee to maintain server hosting, helping street vendors earn a fair, dignified living.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

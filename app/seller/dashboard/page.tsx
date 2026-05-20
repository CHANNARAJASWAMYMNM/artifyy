'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/context/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface OrderItem {
  _id: string;
  product: string;
  name: string;
  quantity: number;
  price: number;
  status: 'processing' | 'shipped' | 'delivered';
}

interface SellerOrder {
  _id: string;
  customer: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export default function SellerDashboard() {
  const { user, token, backendUrl, loading, updateUserSession } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'inventory' | 'orders'>('overview');
  
  // Stats states
  const [totalSales, setTotalSales] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);

  // Profile Form States
  const [shopName, setShopName] = useState('');
  const [story, setStory] = useState('');
  const [location, setLocation] = useState('');
  const [craftType, setCraftType] = useState('');
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [bankNumber, setBankNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankUpi, setBankUpi] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Product Form States
  const [products, setProducts] = useState<Product[]>([]);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStory, setProdStory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCategory, setProdCategory] = useState('Pottery');
  const [prodImage, setProdImage] = useState('');
  const [prodError, setProdError] = useState('');
  const [prodSuccess, setProdSuccess] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Orders States
  const [orders, setOrders] = useState<SellerOrder[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'seller')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch current seller profile info
  const fetchProfile = async () => {
    if (!token) return;
    try {
      const data = await apiRequest('/sellers/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.profile) {
        const p = data.profile;
        setShopName(p.shopName || '');
        setStory(p.story || '');
        setLocation(p.location || '');
        setCraftType(p.craftType || '');
        setAvatar(p.avatar || '');
        setBanner(p.banner || '');
        if (p.bankDetails) {
          setBankHolder(p.bankDetails.accountHolder || '');
          setBankNumber(p.bankDetails.accountNumber || '');
          setBankIfsc(p.bankDetails.ifscCode || '');
          setBankUpi(p.bankDetails.upiId || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch seller's products (inventory)
  const fetchInventory = async () => {
    if (!token || !user) return;
    try {
      const data = await apiRequest(`/products?seller=${user._id}`);
      if (data.success) {
        setProducts(data.products);
        setItemsCount(data.products.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch seller's orders
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const data = await apiRequest('/orders/seller-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrders(data.orders);
        setOrdersCount(data.orders.length);
        
        // Sum total earnings
        let total = 0;
        data.orders.forEach((order: SellerOrder) => {
          order.items.forEach((item) => {
            total += item.price * item.quantity;
          });
        });
        setTotalSales(total);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchProfile();
      fetchInventory();
      fetchOrders();
    }
  }, [token, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    try {
      const data = await apiRequest('/sellers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName,
          story,
          location,
          craftType,
          avatar,
          banner,
          bankDetails: {
            accountHolder: bankHolder,
            accountNumber: bankNumber,
            ifscCode: bankIfsc,
            upiId: bankUpi,
          },
        }),
      });
      if (data.success) {
        setProfileSuccess(true);
        updateUserSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError('');
    setProdSuccess(false);
    setCreatingProduct(true);

    if (!prodName || !prodPrice || !prodStock || !prodStory || !prodDesc) {
      setProdError('Please fill in all product fields');
      setCreatingProduct(false);
      return;
    }

    try {
      const imagesArr = prodImage.trim() ? [prodImage.trim()] : undefined;
      const data = await apiRequest('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: prodName,
          description: prodDesc,
          story: prodStory,
          price: Number(prodPrice),
          stock: Number(prodStock),
          category: prodCategory,
          images: imagesArr,
        }),
      });
      if (data.success) {
        setProdSuccess(true);
        setProdName('');
        setProdDesc('');
        setProdStory('');
        setProdPrice('');
        setProdStock('');
        setProdImage('');
        fetchInventory(); // Reload inventory
      } else {
        setProdError(data.error || 'Failed to create product');
      }
    } catch (err) {
      setProdError('Network error, please try again');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this product listing?')) return;
    try {
      const data = await apiRequest(`/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (orderId: string, itemId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, 'shipped' | 'delivered'> = {
      processing: 'shipped',
      shipped: 'delivered',
    };
    
    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) return;

    try {
      const data = await apiRequest(`/orders/${orderId}/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex justify-center items-center py-20 bg-[#FDFBF7]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C86B45]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const isApproved = user?.sellerStatus === 'approved';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-zinc-100 mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-zinc-800">Artisan Seller Studio</h1>
            <p className="text-zinc-500 text-sm mt-1">Manage shop credentials, list clay creations, and fulfill orders.</p>
          </div>
          <div>
            {isApproved ? (
              <span className="inline-flex items-center rounded-full bg-[#6E8C75]/10 px-3.5 py-1 text-xs font-semibold text-[#6E8C75]">
                ● Approved Shop
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                ● Status: Pending Approval
              </span>
            )}
          </div>
        </div>

        {/* Pending Banner Alert */}
        {!isApproved && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 mb-8 text-sm text-amber-900 leading-relaxed">
            🔒 **Your shop is currently pending curator review.**
            <p className="mt-1 text-amber-700">
              You can set up your complete Shop Bio, story, and add payment configurations below. Once our curators verify your craft details, your account will be marked active, allowing you to list products on the public gallery.
            </p>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-200 mb-8 overflow-x-auto gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'border-[#C86B45] text-[#C86B45]' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'profile' ? 'border-[#C86B45] text-[#C86B45]' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Artisan Shop Bio
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'inventory' ? 'border-[#C86B45] text-[#C86B45]' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Manage Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders' ? 'border-[#C86B45] text-[#C86B45]' : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Fulfillment Orders ({ordersCount})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
                <p className="text-3xl font-extrabold text-[#C86B45] mt-2">₹{totalSales}</p>
                <span className="text-[10px] text-zinc-400 block mt-1">Platform fee (10%) deducted automatically</span>
              </div>
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Orders Fulfillments</span>
                <p className="text-3xl font-extrabold text-[#2A2A2A] mt-2">{ordersCount}</p>
                <span className="text-[10px] text-zinc-400 block mt-1">Total customer purchases</span>
              </div>
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Active Inventory</span>
                <p className="text-3xl font-extrabold text-[#6E8C75] mt-2">{itemsCount} Items</p>
                <span className="text-[10px] text-zinc-400 block mt-1">Products listed under your shop</span>
              </div>
            </div>

            {/* Quick guidance card */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-zinc-800">Getting the most out of your shop</h2>
              <div className="grid md:grid-cols-2 gap-6 text-xs text-zinc-600 leading-relaxed font-sans">
                <div className="space-y-2">
                  <p className="font-bold text-[#C86B45]">✍️ Craft Storytelling</p>
                  <p>Buyers on Artify love history and authenticity. Make sure to describe the exact steps, clay compounds, kiln configurations, and hours spent on your "Artisan Shop Bio" tab to attract more customers.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-[#6E8C75]">🚀 Swift Fulfillment</p>
                  <p>Once you get an order, package your clay products securely with bubble wrap and update the order status in the "Fulfillment Orders" tab. This keeps customers informed and builds trust.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE BIO */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl">
            <h2 className="font-serif text-xl font-bold text-zinc-800 mb-6">Artisan Profile Setup</h2>
            
            {profileSuccess && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-xs text-green-600 mb-6 font-semibold">
                ✓ Shop bio and bank details saved successfully.
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Shop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                    placeholder="e.g. Khurja Pottery Hub"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Craft Specialty</label>
                  <input
                    type="text"
                    value={craftType}
                    onChange={(e) => setCraftType(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                    placeholder="e.g. Clay Sculptures & Glazed Mugs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                    placeholder="e.g. Khurja, Uttar Pradesh"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Profile Photo (URL)</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Your Shop Story & Biography</label>
                <textarea
                  rows={6}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45] resize-none"
                  placeholder="Share details on how you started your craft, family traditions, materials you use..."
                  required
                ></textarea>
              </div>

              {/* Bank Details configuration */}
              <div className="border-t border-zinc-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-[#C86B45] uppercase tracking-wider">Bank Details & UPI for Earnings Payout</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Account Holder Name"
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="UPI ID (e.g. artisan@upi)"
                      value={bankUpi}
                      onChange={(e) => setBankUpi(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={bankNumber}
                      onChange={(e) => setBankNumber(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="clay-button px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg text-xs"
              >
                Save Shop Profile
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-8">
            
            {/* Create New Product Panel (Disabled if not approved) */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-zinc-800 mb-6">List a New Creation</h2>
              
              {!isApproved ? (
                <p className="text-xs text-zinc-400 bg-[#FDFBF7] p-4 rounded-xl border border-dashed text-center">
                  ⚠️ Product creation will be enabled as soon as your artisan account status is approved by curators.
                </p>
              ) : (
                <form onSubmit={handleAddProduct} className="space-y-4">
                  {prodError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-600">
                      {prodError}
                    </div>
                  )}
                  {prodSuccess && (
                    <div className="rounded-xl bg-green-50 border border-green-200 p-3.5 text-xs text-green-600">
                      ✓ Product listed successfully in the public gallery!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Product Name</label>
                      <input
                        type="text"
                        placeholder="Glazed Terracotta Jug"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-[#C86B45] text-zinc-700 bg-white"
                      >
                        <option value="Pottery">Pottery</option>
                        <option value="Clay Sculptures">Clay Sculptures</option>
                        <option value="Jewelry">Jewelry</option>
                        <option value="Home Decor">Home Decor</option>
                        <option value="Kitchenware">Kitchenware</option>
                        <option value="Paintings">Paintings</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Price (₹)</label>
                        <input
                          type="number"
                          placeholder="450"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Stock</label>
                        <input
                          type="number"
                          placeholder="10"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Image Link (URL)</label>
                      <input
                        type="text"
                        placeholder="https://example.com/mug.jpg"
                        value={prodImage}
                        onChange={(e) => setProdImage(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">General Description</label>
                      <input
                        type="text"
                        placeholder="A waterproof glazed serving jug with ergonomic handle."
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Making of Story (The Story Behind the Piece)</label>
                    <textarea
                      rows={3}
                      placeholder="Share details of the kneading, throwing on wheel, firing temperature, or organic dyes used to paint..."
                      value={prodStory}
                      onChange={(e) => setProdStory(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45] resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className="clay-button px-6 py-2.5 rounded-full font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {creatingProduct ? 'Publishing...' : 'Publish Creation'}
                  </button>
                </form>
              )}
            </div>

            {/* List Active Products */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-zinc-800 mb-6">Active Inventory</h2>
              
              {products.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-6">You have no products listed currently.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-left text-zinc-600">
                    <thead className="bg-[#FDFBF7] text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-100">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-4.5 font-bold font-serif">{p.name}</td>
                          <td className="px-4 py-4.5">{p.category}</td>
                          <td className="px-4 py-4.5 text-[#C86B45]">₹{p.price}</td>
                          <td className="px-4 py-4.5">{p.stock} units</td>
                          <td className="px-4 py-4.5 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-zinc-800">Customer Orders Fulfillment</h2>
            
            {orders.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-12 text-center text-zinc-400 text-sm">
                No customer orders containing your products yet. Keep building!
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
                    
                    <div className="flex flex-wrap justify-between items-center pb-3 border-b border-zinc-100 text-xs font-semibold text-zinc-500 gap-4">
                      <div>
                        <span>Order ID</span>
                        <p className="text-zinc-800 font-bold mt-0.5">{order._id}</p>
                      </div>
                      <div>
                        <span>Customer Info</span>
                        <p className="text-zinc-800 font-bold mt-0.5">{order.customer?.name} ({order.customer?.email})</p>
                      </div>
                      <div>
                        <span>Payment Method</span>
                        <span className="inline-block mt-0.5 bg-zinc-100 px-2 py-0.5 rounded font-bold text-[10px] text-zinc-600">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <span>Order Placed</span>
                        <p className="text-zinc-800 font-bold mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Order items list (only matching seller) */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex justify-between items-center py-2 text-xs">
                          <div>
                            <span className="font-bold text-zinc-800">{item.name}</span>
                            <p className="text-zinc-400 text-[10px] mt-0.5">Quantity: {item.quantity} • Unit Price: ₹{item.price}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              item.status === 'delivered' ? 'bg-green-50 text-[#6E8C75]' :
                              item.status === 'shipped' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {item.status}
                            </span>
                            
                            {/* Fulfillment button */}
                            {item.status !== 'delivered' && (
                              <button
                                onClick={() => handleStatusUpdate(order._id, item._id, item.status)}
                                className="px-3 py-1 bg-[#C86B45] text-white font-bold rounded-lg hover:bg-[#B55A35] transition-all text-[10px]"
                              >
                                {item.status === 'processing' ? 'Mark Shipped' : 'Mark Delivered'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address details */}
                    <div className="bg-[#FDFBF7] rounded-xl p-3 border border-zinc-50 text-xs text-zinc-500">
                      <span className="font-bold uppercase text-zinc-400 text-[9px] block mb-1">Deliver To</span>
                      <p className="font-semibold text-zinc-700">{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/context/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface OrderItem {
  _id: string;
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  status: 'processing' | 'shipped' | 'delivered';
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
}

export default function CustomerDashboard() {
  const { user, token, backendUrl, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'customer')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchMyOrders = async () => {
    if (!token) return;
    try {
      const data = await apiRequest('/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [token]);

  if (loading || fetching) {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-zinc-100 mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-zinc-800">My Orders & Tracking</h1>
            <p className="text-zinc-500 text-sm mt-1">Hello, {user?.name}. View your purchase history and track artisan shipments.</p>
          </div>
          <Link href="/products" className="clay-button px-6 py-2.5 rounded-full font-bold text-xs shadow-sm">
            Keep Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-100 rounded-3xl shadow-sm">
            <span className="text-5xl">🍯</span>
            <h2 className="font-serif text-xl font-bold text-zinc-700 mt-4">No orders placed yet</h2>
            <p className="text-zinc-400 text-sm mt-1">You haven't purchased any artisan crafts. Check out our gallery!</p>
            <Link href="/products" className="clay-button inline-flex items-center justify-center px-6 py-2.5 rounded-full font-semibold text-xs mt-6">
              Browse Crafts
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Order Header Summary */}
                <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-zinc-100 text-xs font-semibold text-zinc-500">
                  <div>
                    <span className="uppercase tracking-wider">Order ID</span>
                    <p className="text-sm font-bold text-zinc-700 mt-0.5">{order._id}</p>
                  </div>
                  <div>
                    <span className="uppercase tracking-wider">Placed On</span>
                    <p className="text-sm font-bold text-zinc-700 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="uppercase tracking-wider">Total Price</span>
                    <p className="text-sm font-bold text-[#C86B45] mt-0.5">₹{order.totalAmount}</p>
                  </div>
                  <div>
                    <span className="uppercase tracking-wider">Payment Status</span>
                    <p className="mt-0.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === 'paid' ? 'bg-[#6E8C75]/10 text-[#6E8C75]' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.paymentStatus.toUpperCase()} ({order.paymentMethod})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Items and Delivery Tracking */}
                <div className="space-y-8">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-50 pb-6 last:border-0 last:pb-0">
                      
                      {/* Item Thumbnail */}
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover border border-zinc-50 flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-serif text-sm font-bold text-zinc-800 line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">Qty: {item.quantity} • price: ₹{item.price}</p>
                          <Link href={`/products/${item.product}`} className="text-xs text-[#C86B45] font-semibold hover:underline mt-1.5 inline-block">
                            Rate & Review Craft
                          </Link>
                        </div>
                      </div>

                      {/* Delivery tracking visual indicator */}
                      <div className="w-full md:w-64 space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400">
                          <span className={item.status === 'processing' || item.status === 'shipped' || item.status === 'delivered' ? 'text-[#C86B45]' : ''}>Processing</span>
                          <span className={item.status === 'shipped' || item.status === 'delivered' ? 'text-[#C86B45]' : ''}>Shipped</span>
                          <span className={item.status === 'delivered' ? 'text-[#6E8C75]' : ''}>Delivered</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            item.status === 'processing' ? 'w-1/3 bg-[#C86B45]' :
                            item.status === 'shipped' ? 'w-2/3 bg-[#C86B45]' : 'w-full bg-[#6E8C75]'
                          }`}></div>
                        </div>
                        <p className="text-xs font-semibold text-zinc-500 text-right">
                          Status: <span className="capitalize text-zinc-800 font-bold">{item.status}</span>
                        </p>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Delivery Address block */}
                <div className="bg-[#FDFBF7] rounded-2xl p-4 text-xs space-y-1 text-zinc-500 border border-zinc-50">
                  <span className="font-bold uppercase text-zinc-400">Shipping Details</span>
                  <p className="font-semibold text-zinc-700 mt-1">{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

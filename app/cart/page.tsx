'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CartPage() {
  const { user, token, backendUrl } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const router = useRouter();

  // Shipping form state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Stripe' | 'Razorpay'>('COD');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      router.push('/login?redirect=cart');
      return;
    }

    if (user.role !== 'customer') {
      setError('Only Customer accounts can place orders');
      return;
    }

    if (!address || !city || !postalCode || !country) {
      setError('Please fill in all shipping address fields');
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }));

      const res = await fetch(`${backendUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: { address, city, postalCode, country },
          paymentMethod,
          totalAmount: cartTotal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        clearCart();
        // Redirect to customer dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Failed to place order. Check stock levels.');
      }
    } catch (err) {
      setError('Network error, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-3xl font-bold text-zinc-800 mb-8">Shopping Cart</h1>

        {success ? (
          <div className="max-w-md mx-auto text-center py-16 bg-white border border-zinc-100 rounded-3xl p-8 shadow-xl space-y-4">
            <span className="text-5xl">🎉</span>
            <h2 className="font-serif text-2xl font-bold text-[#C86B45]">Order Placed!</h2>
            <p className="text-zinc-500 text-sm">
              Thank you for supporting our artisans. Your payment was processed and your order is now in preparation.
            </p>
            <p className="text-xs text-zinc-400">Redirecting to your dashboard to track shipping...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-100 rounded-3xl shadow-sm">
            <span className="text-5xl">🛒</span>
            <h2 className="font-serif text-xl font-bold text-zinc-700 mt-4">Your cart is empty</h2>
            <p className="text-zinc-400 text-sm mt-1">Explore our unique handmade pottery and traditional crafts to fill it up!</p>
            <Link href="/products" className="clay-button inline-flex items-center justify-center px-6 py-2.5 rounded-full font-semibold text-xs mt-6">
              Browse Gallery
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-7 space-y-4 mb-8 lg:mb-0">
              {cartItems.map((item) => (
                <div key={item.product} className="flex bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-zinc-50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm font-semibold text-zinc-800 truncate">{item.name}</h3>
                    <p className="text-xs text-[#C86B45] font-bold mt-1">₹{item.price}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-zinc-200 bg-white rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-zinc-50 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-0.5 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product, item.quantity + 1)}
                          className="px-2 py-0.5 hover:bg-zinc-50 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-zinc-800">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Checkout Form & Summary */}
            <div className="lg:col-span-5 bg-white border border-zinc-100 rounded-3xl p-6 shadow-md space-y-6">
              <h2 className="font-serif text-lg font-bold text-zinc-800 border-b border-zinc-100 pb-3">Checkout Details</h2>
              
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-4">
                
                {/* Shipping Fields */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Shipping Address</h3>
                  <div>
                    <input
                      type="text"
                      placeholder="Street Address, Appt/Suite"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#C86B45]"
                      required
                    />
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Method</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                        paymentMethod === 'COD'
                          ? 'border-[#C86B45] bg-[#C86B45]/5 text-[#C86B45]'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      💵 COD
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Stripe')}
                      className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                        paymentMethod === 'Stripe'
                          ? 'border-[#C86B45] bg-[#C86B45]/5 text-[#C86B45]'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      💳 Stripe
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Razorpay')}
                      className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                        paymentMethod === 'Razorpay'
                          ? 'border-[#C86B45] bg-[#C86B45]/5 text-[#C86B45]'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      📱 UPI/Razor
                    </button>
                  </div>
                  {paymentMethod !== 'COD' && (
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-[10px] text-blue-700 leading-normal">
                      💳 **Mock Online Payment Mode Enabled**: Placing order will instantly authorize a mock transactions and set status to "paid".
                    </div>
                  )}
                </div>

                {/* Order Summary Tally */}
                <div className="border-t border-zinc-100 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Shipping</span>
                    <span className="text-[#6E8C75] font-semibold">Free Delivery</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-800 pt-2 border-t border-dashed border-zinc-100">
                    <span>Total Amount</span>
                    <span className="text-lg text-[#C86B45] font-extrabold">₹{cartTotal}</span>
                  </div>
                </div>

                {user ? (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full clay-button py-3.5 rounded-full font-bold shadow-md hover:shadow-lg disabled:opacity-50 text-sm mt-4"
                  >
                    {submitting ? 'Processing Order...' : `Place Order (₹${cartTotal})`}
                  </button>
                ) : (
                  <div className="pt-2">
                    <Link
                      href="/login?redirect=cart"
                      className="w-full clay-button py-3.5 rounded-full font-bold shadow-md hover:shadow-lg text-sm text-center block"
                    >
                      Sign In to Checkout
                    </Link>
                    <span className="text-[10px] text-zinc-400 block text-center mt-2">
                      Please log in or sign up first to process shipping records.
                    </span>
                  </div>
                )}
              </form>
            </div>
            
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

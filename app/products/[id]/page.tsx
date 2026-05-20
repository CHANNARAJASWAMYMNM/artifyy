'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetail {
  _id: string;
  name: string;
  description: string;
  story: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
}

interface SellerProfileDetail {
  shopName: string;
  story: string;
  location: string;
  craftType: string;
  avatar: string;
  banner: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const { user, token, backendUrl } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfileDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cart state
  const [quantity, setQuantity] = useState(1);
  const [addedToCartToast, setAddedToCartToast] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`${backendUrl}/products/${productId}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setSellerProfile(data.sellerProfile);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${backendUrl}/reviews/${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([fetchProductDetails(), fetchReviews()]);
      setLoading(false);
    };
    loadAllData();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      stock: product.stock,
      seller: product.seller._id,
    });
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 3000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!comment.trim()) {
      setReviewError('Please add a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${backendUrl}/reviews/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setComment('');
        setRating(5);
        fetchReviews(); // Reload reviews list
        fetchProductDetails(); // Reload product ratings average
      } else {
        setReviewError(data.error || 'Failed to submit review. Make sure you purchased this product.');
      }
    } catch (err) {
      setReviewError('Network error, please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
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

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center py-20 bg-[#FDFBF7]">
          <span className="text-5xl">🍯</span>
          <h1 className="font-serif text-2xl font-bold text-zinc-700 mt-4">Product Not Found</h1>
          <p className="text-zinc-400 text-sm mt-1">This craft listing is no longer available.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Core Product Presentation */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start mb-16">
          
          {/* Left Column: Image Gallery */}
          <div className="rounded-3xl overflow-hidden bg-white border border-zinc-100 shadow-md aspect-square max-w-xl mx-auto w-full relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-full shadow-lg text-sm">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Order Details */}
          <div className="mt-8 lg:mt-0 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#C86B45] bg-[#C86B45]/10 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-800 mt-3">{product.name}</h1>
              <p className="text-xs text-zinc-400 mt-1">Directly from maker <span className="font-semibold text-zinc-700">{sellerProfile?.shopName || product.seller.name}</span></p>
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 py-2 border-t border-b border-zinc-100">
              <span className="flex items-center text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.102-1.196 4.657c-.209.814.685 1.463 1.393 1.018L10 15.657l4.086 2.438c.708.445 1.602-.204 1.393-1.018l-1.197-4.657 3.6-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-sm font-bold text-zinc-700">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-zinc-400">({product.numReviews} customer reviews)</span>
            </div>

            {/* Price */}
            <div>
              <span className="text-3xl font-extrabold text-[#C86B45]">₹{product.price}</span>
              <span className="text-xs text-zinc-400 block mt-1">Inclusive of all local craft taxes</span>
            </div>

            {/* General Description */}
            <p className="text-sm text-zinc-600 leading-relaxed font-sans">{product.description}</p>

            {/* Purchase Operations */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quantity</label>
                  <div className="flex items-center border border-zinc-200 bg-white rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-1.5 hover:bg-zinc-50 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-3 py-1.5 hover:bg-zinc-50 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-zinc-400">({product.stock} items left in stock)</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 clay-button py-3.5 rounded-full font-bold shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>

                {addedToCartToast && (
                  <div className="rounded-xl bg-[#6E8C75]/10 border border-[#6E8C75]/20 p-3 text-xs text-[#6E8C75] font-semibold animate-bounce flex items-center gap-2">
                    <span>✓</span> Added to your cart! Ready to checkout.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Story Section - Highlighting the hand-making process */}
        <section className="bg-white border border-zinc-100 rounded-3xl p-8 sm:p-10 shadow-sm mb-12">
          <div className="max-w-3xl">
            <span className="text-3xl">🏺</span>
            <h2 className="font-serif text-2xl font-bold text-zinc-800 mt-4">The Story Behind the Piece</h2>
            <p className="text-xs uppercase font-bold tracking-widest text-[#C86B45] mt-1 mb-6">How this craft is born</p>
            <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line font-sans italic">
              {product.story}
            </p>
          </div>
        </section>

        {/* Meet the Artisan Shop Card */}
        {sellerProfile && (
          <section className="bg-[#F5EFEB]/45 border border-[#F5EFEB] rounded-3xl p-8 shadow-inner mb-16">
            <div className="md:flex md:gap-8 items-start">
              <img
                src={sellerProfile.avatar || 'https://images.unsplash.com/photo-1565192647048-f997ed8799d3?auto=format&fit=crop&w=200&q=80'}
                alt={sellerProfile.shopName}
                className="w-24 h-24 rounded-2xl object-cover border border-white shadow-md mb-6 md:mb-0 flex-shrink-0"
              />
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#6E8C75] bg-[#6E8C75]/10 px-2.5 py-0.5 rounded-full">
                    Artisan Creator
                  </span>
                  <h3 className="font-serif text-xl font-bold text-zinc-800 mt-2">{sellerProfile.shopName}</h3>
                  <p className="text-xs text-zinc-500 font-medium">Located in: {sellerProfile.location} • Craft: {sellerProfile.craftType}</p>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  {sellerProfile.story}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Reviews and Write Review Section */}
        <section className="border-t border-zinc-100 pt-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-6 mb-12 lg:mb-0">
              <h2 className="font-serif text-2xl font-bold text-zinc-800 mb-6">Customer Reviews</h2>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white border border-zinc-50 rounded-2xl p-5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-zinc-800">{review.customerName}</span>
                        <span className="text-xs text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Rating stars */}
                      <div className="flex items-center text-amber-500 gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`w-3.5 h-3.5 ${index < review.rating ? 'text-amber-500' : 'text-zinc-200'}`}
                          >
                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.102-1.196 4.657c-.209.814.685 1.463 1.393 1.018L10 15.657l4.086 2.438c.708.445 1.602-.204 1.393-1.018l-1.197-4.657 3.6-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                          </svg>
                        ))}
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed font-sans">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-8 text-center text-zinc-400 text-sm">
                  No reviews submitted for this craft yet.
                </div>
              )}
            </div>

            {/* Write Review Form */}
            <div className="lg:col-span-5 bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm h-fit">
              <h3 className="font-serif text-lg font-bold text-zinc-800 mb-4">Share Your Feedback</h3>
              
              {user ? (
                user.role === 'customer' ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {reviewError && (
                      <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                        {reviewError}
                      </div>
                    )}
                    {reviewSuccess && (
                      <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-600">
                        ✓ Review submitted successfully!
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Rating</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-semibold outline-none focus:border-[#C86B45]"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                        <option value="4">⭐⭐⭐⭐ (Good)</option>
                        <option value="3">⭐⭐⭐ (Average)</option>
                        <option value="2">⭐⭐ (Poor)</option>
                        <option value="1">⭐ (Unacceptable)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Comment</label>
                      <textarea
                        rows={4}
                        placeholder="Write your review here. What did you think about the clay work, shipping, and finish?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none focus:border-[#C86B45] resize-none"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full clay-button py-2.5 rounded-full text-xs font-bold shadow-sm disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    
                    <span className="text-[10px] text-zinc-400 block text-center mt-2 leading-normal">
                      Note: You can only review products you have purchased and checked out on Artify.
                    </span>
                  </form>
                ) : (
                  <p className="text-xs text-zinc-400 text-center py-6 leading-relaxed">
                    Reviews can only be submitted by Customer accounts.
                  </p>
                )
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-zinc-500 mb-4">Please log in to submit a review for this craft.</p>
                  <Link href="/login" className="clay-button px-5 py-2 rounded-full font-bold text-xs inline-block">
                    Sign In to Review
                  </Link>
                </div>
              )}
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

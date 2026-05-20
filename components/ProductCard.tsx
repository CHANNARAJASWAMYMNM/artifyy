import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    rating: number;
    numReviews: number;
    seller?: {
      _id: string;
      name: string;
    } | string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const sellerName = typeof product.seller === 'object' && product.seller ? product.seller.name : 'Local Artisan';

  return (
    <div className="artisan-card group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm hover:border-[#DCA07B]/40">
      
      {/* Product Image */}
      <Link href={`/products/${product._id}`} className="relative block aspect-square w-full overflow-hidden bg-zinc-50">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-all duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#FDFBF7] px-2.5 py-0.5 text-xs font-semibold text-[#C86B45] shadow-sm">
          {product.category}
        </span>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 mb-1">
          {/* Star Icon */}
          <span className="flex items-center text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.102-1.196 4.657c-.209.814.685 1.463 1.393 1.018L10 15.657l4.086 2.438c.708.445 1.602-.204 1.393-1.018l-1.197-4.657 3.6-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-zinc-700">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-zinc-400">({product.numReviews})</span>
        </div>

        <Link href={`/products/${product._id}`} className="group-hover:text-[#C86B45]">
          <h3 className="font-serif text-base font-semibold text-zinc-800 line-clamp-1 group-hover:underline">
            {product.name}
          </h3>
        </Link>
        
        <p className="mt-1 text-xs text-zinc-500">
          by <span className="font-medium text-zinc-700">{sellerName}</span>
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-[#C86B45]">
            ₹{product.price}
          </span>
          <span className="text-[11px] text-[#6E8C75] bg-[#6E8C75]/10 px-2 py-0.5 rounded-full font-medium">
            Handmade
          </span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  product: string; // ID
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  seller: string; // Seller ID
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('artify_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error('Failed to parse cart items:', err);
      }
    }
    setIsMounted(true);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('artify_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.product === item.product);
      if (existingItem) {
        // Ensure we don't exceed stock
        const newQty = Math.min(existingItem.quantity + item.quantity, item.stock);
        return prevItems.map((i) =>
          i.product === item.product ? { ...i, quantity: newQty } : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.product !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((i) =>
        i.product === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

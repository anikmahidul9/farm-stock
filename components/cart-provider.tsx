"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-provider'; // Assuming AuthProvider is in the same components directory

// Define the shape of a cart item (simplified for count)
interface CartItem {
  productId: string;
  quantity: number;
  // Add other relevant fields if needed, but for count, productId and quantity are enough
}

// Define the shape of the context data
interface CartContextType {
  cartCount: number;
  cartItems: CartItem[]; // Optionally expose full cart items if needed elsewhere
  loadingCart: boolean;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    if (authLoading) {
      // Still loading auth state, keep cart loading
      setLoadingCart(true);
      return;
    }

    if (!user) {
      // No user logged in, clear cart and stop loading
      setCartCount(0);
      setCartItems([]);
      setLoadingCart(false);
      return;
    }

    // User is logged in, set up real-time listener for their cart
    const cartRef = collection(db, `users/${user.uid}/cart`);
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const fetchedCartItems: CartItem[] = []
      snapshot.forEach(doc => {
        const item = doc.data() as CartItem;
        fetchedCartItems.push(item);
      });
      setCartItems(fetchedCartItems);
      setCartCount(fetchedCartItems.length);
      setLoadingCart(false);
    }, (error) => {
      console.error("Error fetching cart items in CartProvider:", error);
      setCartCount(0);
      setCartItems([]);
      setLoadingCart(false);
    });

    // Cleanup subscription on unmount or user change
    return () => unsubscribe();
  }, [user, authLoading]); // Re-run effect when user or authLoading changes

  const value = { cartCount, cartItems, loadingCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Create a custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

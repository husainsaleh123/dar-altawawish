// ./src/hooks/useCart.js

import { useState, useCallback } from 'react';

export function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(cartProduct => cartProduct.product._id === product._id);
      
      if (existingProduct) {
        return prevCart.map(cartProduct =>
          cartProduct.product._id === product._id
            ? { ...cartProduct, qty: cartProduct.qty + 1 }
            : cartProduct
        );
      } else {
        return [...prevCart, { product, qty: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(cartProduct => cartProduct.product._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(cartProduct =>
        cartProduct.product._id === productId
          ? { ...cartProduct, qty: newQty }
          : cartProduct
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, cartProduct) => {
      return total + (cartProduct.product.price * cartProduct.qty);
    }, 0);
  }, [cart]);

  const getCartProductCount = useCallback(() => {
    return cart.reduce((total, cartProduct) => total + cartProduct.qty, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartProductCount
  };
}
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/cart';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(null); return; }
    setLoading(true);
    try {
      const { data } = await getCart();
      setCart(data.cart);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const add = async (productId, quantity = 1) => {
    const { data } = await addToCart(productId, quantity);
    setCart(data.cart);
    await fetchCart();
  };

  const update = async (productId, quantity) => {
    const { data } = await updateCartItem(productId, quantity);
    setCart(data.cart);
    await fetchCart();
  };

  const remove = async (productId) => {
    const { data } = await removeFromCart(productId);
    setCart(data.cart);
  };

  const clear = async () => {
    await clearCart();
    setCart(null);
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const total = cart?.items?.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, total, fetchCart, add, update, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
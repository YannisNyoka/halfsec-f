import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, toggleWishlist, clearWishlist } from '../api/wishlist';
import { AuthContext } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [ids, setIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setProducts([]);
      setIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const { data } = await getWishlist();
      setProducts(data.products);
      setIds(new Set(data.products.map((p) => p._id)));
    } catch {
      setProducts([]);
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggle = async (productId) => {
    if (!isAuthenticated) return { requiresAuth: true };
    try {
      const { data } = await toggleWishlist(productId);
      setIds((prev) => {
        const next = new Set(prev);
        if (data.added) next.add(productId);
        else next.delete(productId);
        return next;
      });
      if (data.added) {
        // Refetch to get full product data
        fetchWishlist();
      } else {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      }
      return { added: data.added };
    } catch {
      return { error: true };
    }
  };

  const clear = async () => {
    await clearWishlist();
    setProducts([]);
    setIds(new Set());
  };

  const isInWishlist = (productId) => ids.has(productId);
  const count = ids.size;

  return (
    <WishlistContext.Provider value={{
      products, loading, count,
      toggle, clear, isInWishlist, fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
import { useState, useEffect } from 'react';

const KEY = 'halfsec_recently_viewed';
const MAX = 6;

const useRecentlyViewed = () => {
  const [viewed, setViewed] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(KEY) || '[]');
      setViewed(stored);
    } catch {
      setViewed([]);
    }
  }, []);

  const addProduct = (product) => {
    if (!product?._id) return;
    try {
      const stored = JSON.parse(sessionStorage.getItem(KEY) || '[]');
      // Remove if already exists
      const filtered = stored.filter((p) => p._id !== product._id);
      // Add to front
      const updated = [
        {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images,
          condition: product.condition,
          category: product.category,
          stock: product.stock,
          isFeatured: product.isFeatured,
        },
        ...filtered,
      ].slice(0, MAX);
      sessionStorage.setItem(KEY, JSON.stringify(updated));
      setViewed(updated);
    } catch {}
  };

  const clearViewed = () => {
    sessionStorage.removeItem(KEY);
    setViewed([]);
  };

  return { viewed, addProduct, clearViewed };
};

export default useRecentlyViewed;
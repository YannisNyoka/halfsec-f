import { createContext, useContext, useState, useCallback } from 'react';

const CompareContext = createContext(null);
const MAX = 3;

export const CompareProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const add = useCallback((product) => {
    setItems((prev) => {
      if (prev.find((p) => p._id === product._id)) return prev;
      if (prev.length >= MAX) return prev;
      return [...prev, product];
    });
  }, []);

  const remove = useCallback((productId) => {
    setItems((prev) => prev.filter((p) => p._id !== productId));
  }, []);

  const toggle = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) return prev.filter((p) => p._id !== product._id);
      if (prev.length >= MAX) return prev;
      return [...prev, product];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const isInCompare = useCallback(
    (productId) => items.some((p) => p._id === productId),
    [items]
  );

  const isFull = items.length >= MAX;

  return (
    <CompareContext.Provider value={{
      items, add, remove, toggle,
      clear, isInCompare, isFull,
      count: items.length,
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be inside CompareProvider');
  return ctx;
};
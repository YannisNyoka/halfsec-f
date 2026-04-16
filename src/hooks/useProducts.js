import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories } from '../api/products';

export const useProducts = (filters) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getProducts(filters);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, pagination, loading, error, refetch: fetchProducts };
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
};
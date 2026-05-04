import { useState, useEffect, useRef, useCallback } from 'react';
import { searchSuggestions } from '../api/search';

const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const cacheRef = useRef({});

  const search = useCallback(async (q) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Return cached results instantly
    if (cacheRef.current[q]) {
      setResults(cacheRef.current[q]);
      setOpen(true);
      return;
    }

    setLoading(true);
    try {
      const { data } = await searchSuggestions(q);
      cacheRef.current[q] = data.products;
      setResults(data.products);
      setOpen(data.products.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return { query, setQuery, results, loading, open, setOpen, clear };
};

export default useSearch;
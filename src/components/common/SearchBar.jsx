import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSearch from '../../hooks/useSearch';
import styles from './SearchBar.module.css';

const SearchBar = ({ placeholder = 'Search products...', className = '' }) => {
  const navigate = useNavigate();
  const { query, setQuery, results, loading, open, setOpen, clear } = useSearch();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    clear();
    inputRef.current?.blur();
  };

  const handleSelect = (slug) => {
    navigate(`/shop/${slug}`);
    clear();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`${styles.wrap} ${className}`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrap}>
          {/* Search icon */}
          <svg className={styles.searchIcon} width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>

          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          {/* Loading spinner or clear button */}
          {loading && (
            <div className={styles.spinner} />
          )}
          {!loading && query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clear}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <button type="submit" className={styles.searchBtn}>
          Search
        </button>
      </form>

      {/* Dropdown suggestions */}
      {open && results.length > 0 && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>Products matching "{query}"</span>
            <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          </div>

          <ul className={styles.list}>
            {results.map((product) => (
              <li key={product._id}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => handleSelect(product.slug)}
                >
                  {/* Product image */}
                  <div className={styles.itemImg}>
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <div className={styles.itemImgFallback}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{product.name}</span>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemCategory}>
                        {product.category?.name}
                      </span>
                      <span className={`badge ${
                        product.condition === 'like new' ? 'badge-gold' :
                        product.condition === 'good' ? 'badge-success' : 'badge-muted'
                      }`}>
                        {product.condition}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className={styles.itemPrice}>
                    <span className={styles.price}>
                      R{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className={styles.originalPrice}>
                        R{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" className={styles.arrow}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {/* View all results */}
          <button
            type="button"
            className={styles.viewAll}
            onClick={() => {
              navigate(`/shop?search=${encodeURIComponent(query)}`);
              clear();
            }}
          >
            View all results for "{query}"
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}

      {/* No results */}
      {open && !loading && query.length >= 2 && results.length === 0 && (
        <div className={styles.dropdown}>
          <div className={styles.noResults}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <p>No products found for "<strong>{query}</strong>"</p>
            <span>Try different keywords</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '../../hooks/useProducts';
import ProductCard from '../../components/common/ProductCard';
import styles from './ShopPage.module.css';
import SEO from '../../components/common/SEO';

const CONDITIONS = ['like new', 'good', 'fair', 'poor'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most popular' },
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const { products, pagination, loading, error } = useProducts(filters);

  // Sync filters to URL
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.condition) params.condition = filters.condition;
    if (filters.sort !== 'newest') params.sort = filters.sort;
    if (filters.page > 1) params.page = filters.page;
    setSearchParams(params);
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', condition: '', sort: 'newest', page: 1, limit: 12 });
    setSearchInput('');
  };

  const hasActiveFilters = filters.search || filters.category || filters.condition;

  return (
    <>
    <SEO
  title="Shop second-hand items"
  description="Browse curated second-hand clothing, electronics, furniture and more at half the original price."
  url="https://halfsec.co.za/shop"
/>
    <div className={styles.page}>
      <div className={`container ${styles.layout}`}>
        {/* ── Sidebar filters ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            {hasActiveFilters && (
              <button onClick={clearFilters} className={styles.clearBtn}>Clear all</button>
            )}
          </div>

          {/* Categories */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterLabel}>Category</h3>
            <div className={styles.filterList}>
              <button
                className={`${styles.filterItem} ${!filters.category ? styles.active : ''}`}
                onClick={() => updateFilter('category', '')}
              >
                All categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`${styles.filterItem} ${filters.category === cat._id ? styles.active : ''}`}
                  onClick={() => updateFilter('category', cat._id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterLabel}>Condition</h3>
            <div className={styles.filterList}>
              <button
                className={`${styles.filterItem} ${!filters.condition ? styles.active : ''}`}
                onClick={() => updateFilter('condition', '')}
              >
                Any condition
              </button>
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  className={`${styles.filterItem} ${filters.condition === c ? styles.active : ''}`}
                  onClick={() => updateFilter('condition', c)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className={styles.main}>

          {/* Top bar */}
          <div className={styles.topBar}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button type="button" className={styles.clearSearch}
                    onClick={() => { setSearchInput(''); updateFilter('search', ''); }}>
                    ✕
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>

            <select
              className={styles.sortSelect}
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          {pagination && !loading && (
            <p className={styles.resultsCount}>
              {pagination.total} {pagination.total === 1 ? 'item' : 'items'} found
              {filters.search && <> for "<strong>{filters.search}</strong>"</>}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term.</p>
              <button onClick={clearFilters} className="btn btn-outline btn-sm">Clear filters</button>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page <= 1}
              >
                ← Previous
              </button>
              <div className={styles.pageNumbers}>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.pageBtn} ${filters.page === i + 1 ? styles.pageActive : ''}`}
                    onClick={() => setFilters((p) => ({ ...p, page: i + 1 }))}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page >= pagination.pages}
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
     </>
  );
};

export default ShopPage;
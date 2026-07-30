import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories, getSearchSuggestions } from '../../api/products';
import ProductCard from '../../components/common/ProductCard';
import PriceRangeSlider from '../../components/common/PriceRangeSlider';
import SEO from '../../components/common/SEO';
import styles from './ShopPage.module.css';
import { saveSearch, getMySavedSearches, deleteSavedSearch } from '../../api/watchlist';
import useAuth from '../../hooks/useAuth';

const CONDITIONS = ['new', 'like new', 'good', 'fair', 'poor'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
];

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Search state
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchRef = useRef(null);
  const debouncedSearch = useDebounce(searchInput, 300);

  const { isAuthenticated } = useAuth();
const [savedSearches, setSavedSearches] = useState([]);
const [savingSearch, setSavingSearch] = useState(false);
const [searchSaved, setSearchSaved] = useState(false);

  // Filter state — read from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    conditions: searchParams.get('condition')?.split(',').filter(Boolean) || [],
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 0,
    sort: searchParams.get('sort') || 'newest',
    inStock: searchParams.get('inStock') === 'true',
    page: Number(searchParams.get('page')) || 1,
  });

  // Derived: price slider value
  const [sliderValue, setSliderValue] = useState([
    filters.minPrice || priceRange.min,
    filters.maxPrice || priceRange.max,
  ]);

  // ── Load categories ──────────────────────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
  if (!isAuthenticated) return;
  getMySavedSearches()
    .then(({ data }) => setSavedSearches(data.searches))
    .catch(() => {});
}, [isAuthenticated]);

const isCurrentSearchSaved = savedSearches.some((s) =>
  s.filters.search === filters.search &&
  s.filters.category === filters.category
);

const handleSaveSearch = async () => {
  if (!isAuthenticated) { navigate('/login'); return; }
  setSavingSearch(true);
  try {
    const { data } = await saveSearch({
      name: filters.search || categories.find((c) => c._id === filters.category)?.name || 'Saved search',
      filters,
    });
    setSavedSearches((prev) => [...prev, data.search]);
    setSearchSaved(true);
    setTimeout(() => setSearchSaved(false), 2500);
  } catch {}
  finally { setSavingSearch(false); }
};

  // ── Fetch products ───────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {
        ...(f.search && { search: f.search }),
        ...(f.category && { category: f.category }),
        ...(f.conditions.length && { condition: f.conditions.join(',') }),
        ...(f.minPrice > 0 && { minPrice: f.minPrice }),
        ...(f.maxPrice > 0 && { maxPrice: f.maxPrice }),
        sort: f.sort,
        ...(f.inStock && { inStock: 'true' }),
        page: f.page,
        limit: 20,
      };

      const { data } = await getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);

      if (data.priceRange) {
        setPriceRange(data.priceRange);
        if (!f.minPrice && !f.maxPrice) {
          setSliderValue([data.priceRange.min, data.priceRange.max]);
        }
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchProducts(filters);
    // Sync URL
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.conditions.length) params.set('condition', filters.conditions.join(','));
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice > 0) params.set('maxPrice', filters.maxPrice);
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.page > 1) params.set('page', filters.page);
    setSearchParams(params, { replace: true });
  }, [filters]);

  // ── Search suggestions ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setSuggestions(null);
      return;
    }
    getSearchSuggestions(debouncedSearch)
      .then(({ data }) => setSuggestions(data.suggestions))
      .catch(() => {});
  }, [debouncedSearch]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Filter helpers ───────────────────────────────────────────────────────────
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleCondition = (cond) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      conditions: prev.conditions.includes(cond)
        ? prev.conditions.filter((c) => c !== cond)
        : [...prev.conditions, cond],
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSuggestionsOpen(false);
    updateFilter('search', searchInput);
  };

  const handleSuggestionClick = (value) => {
    setSearchInput(value);
    setSuggestionsOpen(false);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleSliderChange = (val) => {
    setSliderValue(val);
  };

  const applyPriceRange = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: sliderValue[0] > priceRange.min ? sliderValue[0] : 0,
      maxPrice: sliderValue[1] < priceRange.max ? sliderValue[1] : 0,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setSliderValue([priceRange.min, priceRange.max]);
    setFilters({
      search: '', category: '', conditions: [],
      minPrice: 0, maxPrice: 0, sort: 'newest',
      inStock: false, page: 1,
    });
  };

  const activeFilterCount = [
    filters.category,
    ...filters.conditions,
    filters.minPrice > 0 ? 'price' : '',
    filters.maxPrice > 0 ? 'price' : '',
    filters.inStock ? 'stock' : '',
  ].filter(Boolean).length;

  const hasPriceFilter = filters.minPrice > 0 || filters.maxPrice > 0;

  // ── Filter panel (shared between sidebar and drawer) ──────────────────────────
  // NB: this is plain JSX, not a component — defining it as a component (e.g.
  // `const FilterPanel = () => (...)`) would give it a new identity every
  // ShopPage render, so React would remount the whole subtree (including
  // PriceRangeSlider, resetting its drag state) on every filter change.
  const filterPanel = (
    <div className={styles.filterPanel}>
      {/* Categories */}
      <div className={styles.filterSection}>
        <div className={styles.filterTitle}>Category</div>
        <div className={styles.filterList}>
          <button
            className={`${styles.filterItem} ${!filters.category ? styles.filterItemActive : ''}`}
            onClick={() => updateFilter('category', '')}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`${styles.filterItem} ${filters.category === cat._id ? styles.filterItemActive : ''}`}
              onClick={() => updateFilter('category', cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className={styles.filterSection}>
        <div className={styles.filterTitle}>Condition</div>
        <div className={styles.conditionPills}>
          {CONDITIONS.map((cond) => (
            <button
              key={cond}
              className={`${styles.conditionPill} ${
                filters.conditions.includes(cond) ? styles.conditionPillActive : ''
              }`}
              onClick={() => toggleCondition(cond)}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className={styles.filterSection}>
        <div className={styles.filterTitle}>Price range</div>
        <PriceRangeSlider
          min={priceRange.min}
          max={priceRange.max}
          value={sliderValue}
          onChange={handleSliderChange}
        />
        <button
          className={`btn btn-outline btn-sm btn-full ${styles.applyPrice}`}
          onClick={applyPriceRange}
        >
          Apply price filter
        </button>
        {hasPriceFilter && (
          <button
            className={styles.clearPrice}
            onClick={() => {
              setSliderValue([priceRange.min, priceRange.max]);
              setFilters((p) => ({ ...p, minPrice: 0, maxPrice: 0, page: 1 }));
            }}
          >
            Clear price filter
          </button>
        )}
      </div>

      {/* In stock only */}
      <div className={styles.filterSection}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filters.inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
          />
          In stock only
        </label>
      </div>

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <button
          className={`btn btn-ghost btn-sm btn-full`}
          onClick={clearFilters}
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <SEO title="Shop" description="Browse quality second-hand items at half the price." />

      <div className="container">

        {/* ── Search bar ── */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrap} ref={searchRef}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInner}>
                <svg className={styles.searchIcon} width="18" height="18"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className={styles.searchInput}
                  placeholder="Search for anything..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSuggestionsOpen(true);
                  }}
                  onFocus={() => setSuggestionsOpen(true)}
                />
                {searchInput && (
                  <button
                    type="button"
                    className={styles.clearSearch}
                    onClick={() => {
                      setSearchInput('');
                      setSuggestions(null);
                      updateFilter('search', '');
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {/* Suggestions dropdown */}
            {suggestionsOpen && suggestions && (
              <div className={styles.suggestions}>
                {suggestions.products?.length > 0 && (
                  <div className={styles.suggestGroup}>
                    <div className={styles.suggestGroupLabel}>Products</div>
                    {suggestions.products.map((p) => (
                      <button
                        key={p._id}
                        className={styles.suggestItem}
                        onClick={() => handleSuggestionClick(p.name)}
                      >
                        <div className={styles.suggestImg}>
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt={p.name} />
                            : <div className={styles.suggestImgFallback} />
                          }
                        </div>
                        <div className={styles.suggestInfo}>
                          <span className={styles.suggestName}>{p.name}</span>
                          <span className={styles.suggestPrice}>R{p.price.toLocaleString()}</span>
                        </div>
                        <span className={`badge badge-muted ${styles.suggestCondition}`}>
                          {p.condition}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.categories?.length > 0 && (
                  <div className={styles.suggestGroup}>
                    <div className={styles.suggestGroupLabel}>Categories</div>
                    {suggestions.categories.map((c) => (
                      <button
                        key={c._id}
                        className={styles.suggestItem}
                        onClick={() => {
                          setSuggestionsOpen(false);
                          updateFilter('category', c._id);
                        }}
                      >
                        <div className={styles.suggestCatIcon}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                          </svg>
                        </div>
                        <span className={styles.suggestName}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.tags?.length > 0 && (
                  <div className={styles.suggestGroup}>
                    <div className={styles.suggestGroupLabel}>Tags</div>
                    <div className={styles.suggestTags}>
                      {suggestions.tags.map((tag) => (
                        <button
                          key={tag}
                          className={styles.suggestTag}
                          onClick={() => handleSuggestionClick(tag)}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.products?.length === 0 &&
                  suggestions.categories?.length === 0 &&
                  suggestions.tags?.length === 0 && (
                  <div className={styles.suggestEmpty}>
                    No suggestions for "{searchInput}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sort + mobile filter toggle */}
          <div className={styles.searchControls}>
            <select
              className={`${styles.sortSelect}`}
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {isAuthenticated && (filters.search || filters.category || filters.conditions.length > 0) && (
  <button
    className={`${styles.saveSearchBtn} ${isCurrentSearchSaved ? styles.saveSearchSaved : ''}`}
    onClick={handleSaveSearch}
    disabled={savingSearch || isCurrentSearchSaved}
    title={isCurrentSearchSaved ? 'Search saved' : 'Save this search'}
  >
    {searchSaved ? (
      <>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Saved!
      </>
    ) : (
      <>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
        </svg>
        {savingSearch ? 'Saving...' : 'Save search'}
      </>
    )}
  </button>
)}

            <button
              className={`${styles.filterToggle} ${activeFilterCount > 0 ? styles.filterToggleActive : ''}`}
              onClick={() => setFilterDrawerOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {(filters.search || filters.category || filters.conditions.length > 0 || hasPriceFilter || filters.inStock) && (
          <div className={styles.activeFilters}>
            {filters.search && (
              <span className={styles.filterChip}>
                Search: "{filters.search}"
                <button onClick={() => { setSearchInput(''); updateFilter('search', ''); }}>×</button>
              </span>
            )}
            {filters.category && (
              <span className={styles.filterChip}>
                {categories.find((c) => c._id === filters.category)?.name || 'Category'}
                <button onClick={() => updateFilter('category', '')}>×</button>
              </span>
            )}
            {filters.conditions.map((cond) => (
              <span key={cond} className={styles.filterChip}>
                {cond}
                <button onClick={() => toggleCondition(cond)}>×</button>
              </span>
            ))}
            {hasPriceFilter && (
              <span className={styles.filterChip}>
                R{filters.minPrice || priceRange.min} – R{filters.maxPrice || priceRange.max}
                <button onClick={() => {
                  setSliderValue([priceRange.min, priceRange.max]);
                  setFilters((p) => ({ ...p, minPrice: 0, maxPrice: 0, page: 1 }));
                }}>×</button>
              </span>
            )}
            {filters.inStock && (
              <span className={styles.filterChip}>
                In stock
                <button onClick={() => updateFilter('inStock', false)}>×</button>
              </span>
            )}
            <button className={styles.clearAllChip} onClick={clearFilters}>
              Clear all
            </button>
          </div>
        )}

        <div className={styles.layout}>
          {/* ── Desktop sidebar ── */}
          <aside className={styles.sidebar}>
            {filterPanel}
          </aside>

          {/* ── Product grid ── */}
          <div className={styles.main}>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>
                {loading ? 'Loading...' : `${pagination.total ?? 0} item${pagination.total !== 1 ? 's' : ''} found`}
              </span>
            </div>

            {loading ? (
              <div className={styles.skeletonGrid}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className={styles.empty}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className={styles.pagination}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilter('page', filters.page - 1)}
                >
                  ← Prev
                </button>
                <div className={styles.pageNumbers}>
                  {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${filters.page === p ? styles.pageBtnActive : ''}`}
                        onClick={() => updateFilter('page', p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {pagination.pages > 7 && (
                    <>
                      <span className={styles.pageDots}>...</span>
                      <button
                        className={`${styles.pageBtn} ${filters.page === pagination.pages ? styles.pageBtnActive : ''}`}
                        onClick={() => updateFilter('page', pagination.pages)}
                      >
                        {pagination.pages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={filters.page >= pagination.pages}
                  onClick={() => updateFilter('page', filters.page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {filterDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setFilterDrawerOpen(false)}>
          <div
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Filters</h2>
              <button
                className={styles.drawerClose}
                onClick={() => setFilterDrawerOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.drawerBody}>
              {filterPanel}
            </div>
            <div className={styles.drawerFooter}>
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={() => setFilterDrawerOpen(false)}
              >
                Show {pagination.total ?? 0} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
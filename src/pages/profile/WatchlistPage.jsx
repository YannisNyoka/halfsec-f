import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMySavedSearches,
  deleteSavedSearch,
  toggleSearchAlert,
  getMyPriceAlerts,
  deletePriceAlert,
} from '../../api/watchlist';
import { getMyOffers, withdrawOffer } from '../../api/offers';
import SEO from '../../components/common/SEO';
import styles from './WatchlistPage.module.css';

const timeLeft = (expiresAt) => {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
};

const STATUS_COLORS = {
  pending: 'badge-gold',
  accepted: 'badge-success',
  declined: 'badge-danger',
  expired: 'badge-muted',
  withdrawn: 'badge-muted',
  purchased: 'badge-success',
};

const WatchlistPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('searches');
  const [searches, setSearches] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sRes, pRes, oRes] = await Promise.all([
          getMySavedSearches(),
          getMyPriceAlerts(),
          getMyOffers(),
        ]);
        setSearches(sRes.data.searches);
        setPriceAlerts(pRes.data.alerts);
        setOffers(oRes.data.offers);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleDeleteSearch = async (id) => {
    setActioning(id);
    await deleteSavedSearch(id).catch(() => {});
    setSearches((p) => p.filter((s) => s._id !== id));
    setActioning(null);
  };

  const handleToggleAlert = async (id) => {
    setActioning(id);
    try {
      const { data } = await toggleSearchAlert(id);
      setSearches((p) =>
        p.map((s) => s._id === id ? { ...s, alertEnabled: data.alertEnabled } : s)
      );
    } catch {}
    setActioning(null);
  };

  const handleDeleteAlert = async (id) => {
    setActioning(id);
    await deletePriceAlert(id).catch(() => {});
    setPriceAlerts((p) => p.filter((a) => a._id !== id));
    setActioning(null);
  };

  const handleWithdrawOffer = async (id) => {
    if (!window.confirm('Withdraw this offer?')) return;
    setActioning(id);
    try {
      await withdrawOffer(id);
      setOffers((p) => p.map((o) => o._id === id ? { ...o, status: 'withdrawn' } : o));
    } catch {}
    setActioning(null);
  };

  const buildSearchUrl = (f) => {
    const params = new URLSearchParams();
    if (f.search) params.set('search', f.search);
    if (f.category) params.set('category', f.category);
    if (f.conditions?.length) params.set('condition', f.conditions.join(','));
    if (f.minPrice > 0) params.set('minPrice', f.minPrice);
    if (f.maxPrice > 0) params.set('maxPrice', f.maxPrice);
    if (f.sort !== 'newest') params.set('sort', f.sort);
    if (f.inStock) params.set('inStock', 'true');
    return `/shop?${params.toString()}`;
  };

  const TABS = [
    { value: 'searches', label: 'Saved searches', count: searches.length },
    { value: 'alerts', label: 'Price alerts', count: priceAlerts.filter((a) => !a.triggered).length },
    { value: 'offers', label: 'My offers', count: offers.filter((o) => o.status === 'pending').length },
  ];

  return (
    <div className={styles.page}>
      <SEO title="Watchlist" />
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Watchlist</h1>
          <p className={styles.sub}>Track searches, price drops and offers</p>
        </div>

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.value}
              className={`${styles.tab} ${tab === t.value ? styles.tabActive : ''}`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
              {t.count > 0 && (
                <span className={styles.tabBadge}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loader">
            <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
          </div>
        ) : (
          <>
            {/* ── Saved Searches ── */}
            {tab === 'searches' && (
              <div className={styles.list}>
                {searches.length === 0 ? (
                  <div className={styles.empty}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <h3>No saved searches</h3>
                    <p>Save a search from the shop to get notified when new matching items appear.</p>
                    <Link to="/shop" className="btn btn-primary">Browse shop</Link>
                  </div>
                ) : searches.map((s) => (
                  <div key={s._id} className={styles.card}>
                    <div className={styles.cardMain}>
                      <div className={styles.cardIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                        </svg>
                      </div>
                      <div className={styles.cardInfo}>
                        <Link to={buildSearchUrl(s.filters)} className={styles.cardTitle}>
                          {s.name}
                        </Link>
                        <div className={styles.cardMeta}>
                          {[
                            s.filters.search && `"${s.filters.search}"`,
                            s.filters.conditions?.length && s.filters.conditions.join(', '),
                            (s.filters.minPrice > 0 || s.filters.maxPrice > 0) &&
                              `R${s.filters.minPrice || 0}–R${s.filters.maxPrice || '∞'}`,
                            s.filters.inStock && 'In stock only',
                          ].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.alertToggle} ${s.alertEnabled ? styles.alertOn : ''}`}
                        onClick={() => handleToggleAlert(s._id)}
                        disabled={actioning === s._id}
                        title={s.alertEnabled ? 'Alerts on — click to disable' : 'Alerts off — click to enable'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                          <path d="M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                        {s.alertEnabled ? 'Alerts on' : 'Alerts off'}
                      </button>
                      <Link to={buildSearchUrl(s.filters)} className="btn btn-ghost btn-sm">
                        View results
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDeleteSearch(s._id)}
                        disabled={actioning === s._id}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Price Alerts ── */}
            {tab === 'alerts' && (
              <div className={styles.list}>
                {priceAlerts.length === 0 ? (
                  <div className={styles.empty}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.2">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 01-3.46 0"/>
                    </svg>
                    <h3>No price alerts</h3>
                    <p>Set a target price on any product listing and we'll notify you when it drops.</p>
                    <Link to="/shop" className="btn btn-primary">Browse shop</Link>
                  </div>
                ) : priceAlerts.map((a) => (
                  <div key={a._id} className={`${styles.card} ${a.triggered ? styles.cardTriggered : ''}`}>
                    <div className={styles.cardMain}>
                      <div className={styles.alertImg}>
                        {a.product?.images?.[0]?.url
                          ? <img src={a.product.images[0].url} alt={a.product.name} />
                          : <div className={styles.imgFallback} />
                        }
                      </div>
                      <div className={styles.cardInfo}>
                        <Link to={`/shop/${a.product?.slug}`} className={styles.cardTitle}>
                          {a.product?.name || 'Product'}
                        </Link>
                        <div className={styles.alertPrices}>
                          <span className={styles.alertTarget}>
                            Target: R{a.targetPrice.toLocaleString()}
                          </span>
                          <span className={styles.alertCurrent}>
                            Current: R{a.product?.price?.toLocaleString() || '—'}
                          </span>
                        </div>
                        {a.triggered && (
                          <span className={`badge badge-success ${styles.triggeredBadge}`}>
                            🎉 Price reached! Go buy it
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      {a.triggered && (
                        <Link to={`/shop/${a.product?.slug}`} className="btn btn-primary btn-sm">
                          Buy now
                        </Link>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDeleteAlert(a._id)}
                        disabled={actioning === a._id}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── My Offers ── */}
            {tab === 'offers' && (
              <div className={styles.list}>
                {offers.length === 0 ? (
                  <div className={styles.empty}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    <h3>No offers yet</h3>
                    <p>Browse seller listings and click "Make an offer" to negotiate a price.</p>
                    <Link to="/shop" className="btn btn-primary">Browse shop</Link>
                  </div>
                ) : offers.map((o) => (
                  <div key={o._id} className={styles.card}>
                    <div className={styles.cardMain}>
                      <div className={styles.alertImg}>
                        {o.product?.images?.[0]?.url
                          ? <img src={o.product.images[0].url} alt={o.product?.name} />
                          : <div className={styles.imgFallback} />
                        }
                      </div>
                      <div className={styles.cardInfo}>
                        <Link to={`/shop/${o.product?.slug}`} className={styles.cardTitle}>
                          {o.product?.name || 'Product'}
                        </Link>
                        <div className={styles.alertPrices}>
                          <span className={styles.alertTarget}>
                            Your offer: R{o.offerPrice.toLocaleString()}
                          </span>
                          <span className={styles.alertCurrent}>
                            Listed: R{o.originalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.offerMeta}>
                          <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                          {o.status === 'pending' && (
                            <span className={styles.timeLeft}>{timeLeft(o.expiresAt)}</span>
                          )}
                          {o.sellerNote && (
                            <span className={styles.sellerNote}>
                              Seller: "{o.sellerNote}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      {o.status === 'accepted' && (
                        <Link to={`/offers/${o._id}/checkout`} className="btn btn-primary btn-sm">
                          Buy at R{o.offerPrice.toLocaleString()}
                        </Link>
                      )}
                      {o.status === 'purchased' && (
                        <Link to={`/orders/${o.order}`} className="btn btn-ghost btn-sm">
                          View order
                        </Link>
                      )}
                      {o.status === 'pending' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleWithdrawOffer(o._id)}
                          disabled={actioning === o._id}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getProducts, getCategories } from '../api/products';
import ProductCard from '../components/common/ProductCard';
import styles from './HomePage.module.css';
import SEO from '../components/common/SEO';

const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes, catRes] = await Promise.all([
          getProducts({ featured: 'true', limit: 4 }),
          getProducts({ sort: 'newest', limit: 8 }),
          getCategories(),
        ]);
        setFeatured(featuredRes.data.products);
        setLatest(latestRes.data.products);
        setCategories(catRes.data.categories.slice(0, 6));
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <>
  <SEO
    title="Find unique items at half the price"
    description="Curated second-hand goods — quality checked, fairly priced, delivered anywhere in South Africa."
    url="https://halfsec.co.za"
  />
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.badge}>Second hand. First class.</span>
            <h1 className={styles.heading}>
              Find unique items<br />at <span>unbeatable</span>  prices
            </h1>
            <p className={styles.sub}>
              Curated second-hand goods — quality checked, fairly priced,
              ready to find a new home.
            </p>
            <div className={styles.heroActions}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Browse the shop
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-outline btn-lg">
                  Create account
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="btn btn-outline btn-lg">
                  Admin dashboard
                </Link>
              )}
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>100%</span>
                <span className={styles.statLabel}>Quality checked</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>50%+</span>
                <span className={styles.statLabel}>Average savings</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>Fast</span>
                <span className={styles.statLabel}>SA-wide delivery</span>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroBadgeFloat}>
              <span>✓</span> Verified condition
            </div>
            <div className={styles.heroCard}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p>Your next favourite<br />item is waiting</p>
              <Link to="/shop" className={styles.heroCardBtn}>Shop now →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Browse by category</h2>
              <Link to="/shop" className={styles.seeAll}>See all →</Link>
            </div>
            <div className={styles.categoriesGrid}>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat._id}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                  </div>
                  <span className={styles.categoryName}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured products ── */}
      {(loading || featured.length > 0) && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Featured picks</h2>
                <p className={styles.sectionSub}>Hand-picked items worth checking out</p>
              </div>
              <Link to="/shop?featured=true" className={styles.seeAll}>See all →</Link>
            </div>
            {loading ? (
              <div className={styles.skeletonGrid}>
                {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Latest arrivals ── */}
      {(loading || latest.length > 0) && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Latest arrivals</h2>
                <p className={styles.sectionSub}>Fresh items just added to the shop</p>
              </div>
              <Link to="/shop?sort=newest" className={styles.seeAll}>See all →</Link>
            </div>
            {loading ? (
              <div className={styles.skeletonGrid}>
                {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {latest.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Why Halfsec ── */}
      <section className={styles.whySection}>
        <div className="container">
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: 40 }}>
            Why shop at Halfsec?
          </h2>
          <div className={styles.whyGrid}>
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                ),
                title: 'Quality verified',
                desc: 'Every item is personally inspected before listing. No surprises.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                ),
                title: 'Real savings',
                desc: 'Save 40–70% off original retail prices on quality second-hand items.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="3" width="15" height="13" rx="2"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                ),
                title: 'SA-wide delivery',
                desc: 'We ship anywhere in South Africa. Free delivery on orders over R500.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: 'Secure checkout',
                desc: 'Your data is always safe. We use encrypted connections and secure payments.',
              },
            ].map((item) => (
              <div key={item.title} className={styles.whyCard}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!isAuthenticated && (
        <section className={styles.ctaSection}>
          <div className={`container ${styles.ctaContent}`}>
            <h2 className={styles.ctaTitle}>Ready to start saving?</h2>
            <p className={styles.ctaSub}>
              Join Halfsec today and discover quality second-hand items at unbeatable prices.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create free account
              </Link>
              <Link to="/shop" className="btn btn-outline btn-lg">
                Browse first
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
    </>
  );
};

export default HomePage;
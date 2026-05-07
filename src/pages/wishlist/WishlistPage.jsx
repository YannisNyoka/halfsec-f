import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import SEO from '../../components/common/SEO';
import WishlistButton from '../../components/common/WishlistButton';
import styles from './WishlistPage.module.css';

const WishlistPage = () => {
  const { products, loading, clear } = useWishlist();
  const { add } = useCart();
  const [addingToCart, setAddingToCart] = useState({});
  const [cartSuccess, setCartSuccess] = useState({});

  const handleAddToCart = async (product) => {
    if (product.stock === 0) return;
    setAddingToCart((p) => ({ ...p, [product._id]: true }));
    try {
      await add(product._id, 1);
      setCartSuccess((p) => ({ ...p, [product._id]: true }));
      setTimeout(() => {
        setCartSuccess((p) => ({ ...p, [product._id]: false }));
      }, 2500);
    } catch {}
    finally {
      setAddingToCart((p) => ({ ...p, [product._id]: false }));
    }
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  return (
    <div className={styles.page}>
      <SEO title="My wishlist" url="https://halfsec.co.za/wishlist" />
      <div className="container">

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              My wishlist
              {products.length > 0 && (
                <span className={styles.count}>
                  {products.length} item{products.length !== 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <p className={styles.sub}>Items you've saved for later</p>
          </div>
          {products.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clear}
            >
              Clear all
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <h2>Your wishlist is empty</h2>
            <p>Browse the shop and tap the heart icon to save items here</p>
            <Link to="/shop" className="btn btn-primary btn-lg">
              Browse shop
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {products.map((product) => {
                const discount = product.originalPrice
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : null;
                const isAdded = cartSuccess[product._id];
                const isAdding = addingToCart[product._id];

                return (
                  <div key={product._id} className={styles.card}>
                    {/* Image */}
                    <Link to={`/shop/${product.slug}`} className={styles.imageWrap}>
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className={styles.image} />
                      ) : (
                        <div className={styles.imageFallback}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                          </svg>
                        </div>
                      )}
                      {discount && (
                        <span className={styles.discount}>-{discount}%</span>
                      )}
                      {product.stock === 0 && (
                        <div className={styles.outOfStockOverlay}>Out of stock</div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className={styles.body}>
                      <div className={styles.topRow}>
                        <span className={`badge badge-muted ${styles.condition}`}>
                          {product.condition}
                        </span>
                        <WishlistButton product={product} size="sm" />
                      </div>

                      <Link to={`/shop/${product.slug}`} className={styles.name}>
                        {product.name}
                      </Link>

                      {product.category?.name && (
                        <span className={styles.category}>
                          {product.category.name}
                        </span>
                      )}

                      <div className={styles.priceRow}>
                        <span className={styles.price}>
                          R{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className={styles.originalPrice}>
                            R{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        className={`btn btn-primary btn-full ${isAdded ? styles.addedBtn : ''}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdding || product.stock === 0}
                      >
                        {isAdding ? (
                          <><span className="spinner" />Adding...</>
                        ) : isAdded ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Added to cart!
                          </>
                        ) : product.stock === 0 ? (
                          'Out of stock'
                        ) : (
                          'Add to cart'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.footer}>
              <Link to="/shop" className="btn btn-outline">
                Continue shopping
              </Link>
              <Link to="/cart" className="btn btn-primary">
                View cart →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
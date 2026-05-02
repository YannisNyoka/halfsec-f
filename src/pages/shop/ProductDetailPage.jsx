import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductBySlug } from '../../api/products';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import styles from './ProductDetailPage.module.css';
import { useCart } from '../../context/CartContext.jsx';
import SEO from '@/components/common/SEO';

const conditionColors = {
  'like new': 'badge-gold',
  'good': 'badge-success',
  'fair': 'badge-muted',
  'poor': 'badge-danger',
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { add, fetchCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then(({ data }) => setProduct(data.product))
      .catch(() => navigate('/shop', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
  if (!product?._id) return;

  if (!isAuthenticated) {
    navigate('/login', { state: { from: { pathname: `/shop/${slug}` } } });
    return;
  }

  setAddingToCart(true);
  setCartMessage('');

  try {
    await add(product._id, 1);

    setCartMessage('Added to cart successfully');
    
    // Optional: refresh cart state
    await fetchCart();

  } catch (err) {
    setCartMessage(
      err.response?.data?.message || 'Could not add to cart.'
    );
  } finally {
    setAddingToCart(false);
  }
};

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <>
  <SEO
    title={product.name}
    description={`${product.description.slice(0, 150)}...`}
    image={product.images?.[0]?.url}
    url={`https://halfsec.co.za/shop/${product.slug}`}
    type="product"
    product={product}
  />
    <div className={styles.page}>
      <div className="container">

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          {product.category && <><Link to={`/shop?category=${product.category._id}`}>{product.category.name}</Link><span>/</span></>}
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        <div className={styles.layout}>
          {/* Images */}
          <div className={styles.images}>
            <div className={styles.mainImage}>
              {product.images?.[activeImg] ? (
                <img src={product.images[activeImg].url} alt={product.name} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 60, height: 60 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
              )}
              {discount && <span className={styles.discountBadge}>-{discount}%</span>}
            </div>

            {product.images?.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img.url} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.badges}>
              <span className={`badge ${conditionColors[product.condition] || 'badge-muted'}`}>
                {product.condition}
              </span>
              {product.isFeatured && <span className="badge badge-gold">Featured</span>}
              {product.category && (
                <span className="badge badge-muted">{product.category.name}</span>
              )}
            </div>

            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.priceRow}>
              <span className={styles.price}>R{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>R{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <div className={styles.divider} />

            <p className={styles.description}>{product.description}</p>

            {product.tags?.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}

            <div className={styles.divider} />

            {/* Stock */}
            <div className={styles.stockRow}>
              <div className={`${styles.stockDot} ${product.stock > 0 ? styles.inStock : styles.outStock}`} />
              <span className={styles.stockText}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* CTA */}
            {cartMessage && (
              <div className={`alert ${cartMessage.includes('Added') ? 'alert-success' : 'alert-error'}`}>
                {cartMessage}
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
            >
              {addingToCart
                ? <><span className="spinner" />Adding...</>
                : product.stock === 0
                ? 'Out of stock'
                : 'Add to cart'}
            </button>

            {!isAuthenticated && (
              <p className={styles.loginHint}>
                <Link to="/login" className={styles.loginLink}>Sign in</Link> to add items to your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
</>
  );
};

export default ProductDetailPage;
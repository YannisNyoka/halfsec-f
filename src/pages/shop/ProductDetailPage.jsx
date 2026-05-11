import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductBySlug } from '../../api/products';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext.jsx';
import SEO from '../../components/common/SEO';
import { RatingDisplay } from '../../components/common/StarRating';
import RelatedProducts from '../../components/common/RelatedProducts';
import ProductReviews from '../../components/common/ProductReviews';
import ShareButton from '../../components/common/ShareButton';
import WishlistButton from '../../components/common/WishlistButton';
import ImageLightbox from '../../components/common/ImageLightbox';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import styles from './ProductDetailPage.module.css';

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
  const { add } = useCart();
  const { addProduct } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then(({ data }) => {
        setProduct(data.product);
        addProduct(data.product);
      })
      .catch(() => navigate('/shop', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

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
      setCartMessage('Added to cart successfully!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err) {
      setCartMessage(err.response?.data?.message || 'Could not add to cart.');
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

      {/* Lightbox */}
      {lightboxOpen && product.images?.length > 0 && (
        <ImageLightbox
          images={product.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className={styles.page}>
        <div className="container">

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/shop">Shop</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link to={`/shop?category=${product.category._id}`}>
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className={styles.breadcrumbCurrent}>{product.name}</span>
          </nav>

          <div className={styles.layout}>
            {/* Images */}
            <div className={styles.images}>
              {/* Main image — click to open lightbox */}
              <div
                className={styles.mainImage}
                onClick={() => openLightbox(activeImg)}
                title="Click to zoom"
              >
                {product.images?.[activeImg] ? (
                  <img
                    src={product.images[activeImg].url}
                    alt={product.name}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <svg viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5"
                      style={{ width: 60, height: 60 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
                {discount && (
                  <span className={styles.discountBadge}>-{discount}%</span>
                )}
                {/* Zoom hint overlay */}
                {product.images?.length > 0 && (
                  <div className={styles.zoomHint}>
                    <svg width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      <line x1="11" y1="8" x2="11" y2="14"/>
                      <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                    Zoom
                  </div>
                )}
              </div>

              {/* Thumbnails */}
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
                {product.isFeatured && (
                  <span className="badge badge-gold">Featured</span>
                )}
                {product.category && (
                  <span className="badge badge-muted">
                    {product.category.name}
                  </span>
                )}
              </div>

              <h1 className={styles.name}>{product.name}</h1>

              {/* Rating */}
              {product.rating?.count > 0 && (
                <RatingDisplay
                  rating={product.rating.average}
                  count={product.rating.count}
                  size={16}
                />
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
                {discount && (
                  <span className={styles.saving}>
                    Save R{(product.originalPrice - product.price).toLocaleString()}
                  </span>
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
                <div className={`${styles.stockDot} ${
                  product.stock > 0 ? styles.inStock : styles.outStock
                }`} />
                <span className={styles.stockText}>
                  {product.stock > 0
                    ? product.stock === 1
                      ? 'Last one left!'
                      : `${product.stock} in stock`
                    : 'Out of stock'
                  }
                </span>
              </div>

              {/* Feedback */}
              {cartMessage && (
                <div className={`alert ${
                  cartMessage.includes('Added') ? 'alert-success' : 'alert-error'
                }`}>
                  {cartMessage}
                </div>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                >
                  {addingToCart
                    ? <><span className="spinner" />Adding...</>
                    : product.stock === 0
                    ? 'Out of stock'
                    : 'Add to cart'
                  }
                </button>
                <WishlistButton product={product} size="lg" showLabel />
                <ShareButton product={product} />
              </div>

              {!isAuthenticated && (
                <p className={styles.loginHint}>
                  <Link to="/login" className={styles.loginLink}>Sign in</Link>
                  {' '}to add items to your cart
                </p>
              )}
            </div>
          </div>

          {/* Related products */}
          {product.category && (
            <RelatedProducts
              categoryId={product.category._id}
              currentSlug={product.slug}
              categoryName={product.category.name}
            />
          )}

          {/* Reviews */}
          <ProductReviews product={product} />

        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
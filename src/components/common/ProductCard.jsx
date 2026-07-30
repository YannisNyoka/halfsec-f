import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import ShareButton from './ShareButton';
import WishlistButton from './WishlistButton';
import { RatingDisplay } from './StarRating';
import CompareButton from './CompareButton';

const conditionColors = {
  'new': 'badge-gold',
  'like new': 'badge-gold',
  'good': 'badge-success',
  'fair': 'badge-muted',
  'poor': 'badge-danger',
};

const ProductCard = ({ product }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link to={`/shop/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {product.images?.[0] ? (
          <img src={product.images[0].url} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
        <div
          className={styles.wishlistBtn}
          onClick={(e) => e.preventDefault()}
        >
          <WishlistButton product={product} size="sm" />
          <CompareButton product={product} size="sm" />
        </div>
        {discount && <span className={styles.discountBadge}>-{discount}%</span>}
        {product.stock === 0 && <div className={styles.soldOut}>Sold out</div>}
      </div>

      <div className={styles.body}>
        <div className={styles.cardActions}>
          <span className={styles.viewLink}>View item →</span>
          <div
            className={styles.shareWrap}
            onClick={(e) => e.preventDefault()}
          >
            <ShareButton product={product} />
          </div>
        </div>

        <div className={styles.topRow}>
          <span className={`badge ${conditionColors[product.condition] || 'badge-muted'}`}>
            {product.condition}
          </span>
          {product.isFeatured && (
            <span className="badge badge-gold">Featured</span>
          )}
        </div>

        <h3 className={styles.name}>{product.name}</h3>

        {product.category?.name && (
          <span className={styles.category}>{product.category.name}</span>
        )}

        {/* Seller link */}
        {product.seller && (
          <div
            className={styles.sellerLink}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/seller-profile/${product.seller._id}`;
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {product.seller.sellerProfile?.businessName || product.seller.name}
            {product.seller.sellerProfile?.rating?.count > 0 && (
              <span className={styles.sellerRating}>
                ★ {product.seller.sellerProfile.rating.average.toFixed(1)}
              </span>
            )}
          </div>
        )}

        {product.rating?.count > 0 && (
          <RatingDisplay
            rating={product.rating.average}
            count={product.rating.count}
            size={13}
          />
        )}

        <div className={styles.priceRow}>
          <span className={styles.price}>R{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>
              R{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
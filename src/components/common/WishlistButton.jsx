import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext.jsx';
import useAuth from '../../hooks/useAuth';
import styles from './WishlistButton.module.css';

const HeartIcon = ({ filled }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const WishlistButton = ({
  product,
  showLabel = false,
  size = 'md',
  className = '',
}) => {
  const { toggle, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  const inWishlist = isInWishlist(product._id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: { pathname: `/shop/${product.slug}` } },
      });
      return;
    }

    setLoading(true);
    const result = await toggle(product._id);
    setLoading(false);

    if (result?.added) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }
  };

  return (
    <button
      className={`
        ${styles.btn}
        ${styles[size]}
        ${inWishlist ? styles.active : ''}
        ${pulse ? styles.pulse : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={loading}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      {loading ? (
        <span className="spinner" style={{ width: 14, height: 14 }} />
      ) : (
        <HeartIcon filled={inWishlist} />
      )}
      {showLabel && (
        <span className={styles.label}>
          {inWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
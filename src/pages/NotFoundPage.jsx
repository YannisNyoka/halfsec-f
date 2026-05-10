import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <SEO title="Page not found" />
      <div className={styles.content}>

        {/* Animated illustration */}
        <div className={styles.illustration}>
          <div className={styles.bigNumber}>
            <span className={styles.four}>4</span>
            <span className={styles.zero}>0</span>
            <span className={styles.four}>4</span>
          </div>
          <div className={styles.icon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
        </div>

        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.sub}>
          The page you're looking for doesn't exist or has been moved.
          Don't worry — there's plenty more to explore.
        </p>

        {/* Quick links */}
        <div className={styles.links}>
          <Link to="/" className="btn btn-primary btn-lg">
            Go home
          </Link>
          <Link to="/shop" className="btn btn-outline btn-lg">
            Browse shop
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-lg"
          >
            ← Go back
          </button>
        </div>

        {/* Suggestions */}
        <div className={styles.suggestions}>
          <p className={styles.suggestTitle}>You might be looking for:</p>
          <div className={styles.suggestLinks}>
            <Link to="/shop" className={styles.suggestLink}>All products</Link>
            <Link to="/shop?featured=true" className={styles.suggestLink}>Featured items</Link>
            <Link to="/orders" className={styles.suggestLink}>My orders</Link>
            <Link to="/wishlist" className={styles.suggestLink}>My wishlist</Link>
            <Link to="/profile" className={styles.suggestLink}>My profile</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
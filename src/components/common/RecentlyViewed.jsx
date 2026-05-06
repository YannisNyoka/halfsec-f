import { Link } from 'react-router-dom';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import ProductCard from './ProductCard';
import styles from './RecentlyViewed.module.css';

const RecentlyViewed = () => {
  const { viewed, clearViewed } = useRecentlyViewed();

  if (viewed.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Recently viewed</h2>
            <p className={styles.sub}>Items you looked at this session</p>
          </div>
          <button
            onClick={clearViewed}
            className={styles.clearBtn}
          >
            Clear
          </button>
        </div>
        <div className={styles.grid}>
          {viewed.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext.jsx';
import styles from './CompareBar.module.css';

const CompareBar = () => {
  const { items, remove, clear, count } = useCompare();

  if (count === 0) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.label}>
            Compare
            <span className={styles.count}>{count}/3</span>
          </span>
          <div className={styles.products}>
            {items.map((product) => (
              <div key={product._id} className={styles.chip}>
                <div className={styles.chipImg}>
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} />
                  ) : (
                    <div className={styles.chipImgFallback} />
                  )}
                </div>
                <span className={styles.chipName}>{product.name}</span>
                <button
                  className={styles.chipRemove}
                  onClick={() => remove(product._id)}
                  aria-label={`Remove ${product.name} from compare`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {[...Array(3 - count)].map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptySlot}>
                <svg width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                <span>Add item</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          <button
            className={styles.clearBtn}
            onClick={clear}
          >
            Clear all
          </button>
          <Link
            to="/compare"
            className={`btn btn-primary ${styles.compareBtn}`}
          >
            Compare {count} items →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
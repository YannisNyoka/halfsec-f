import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { RatingDisplay } from '../../components/common/StarRating';
import SEO from '../../components/common/SEO';
import styles from './ComparePage.module.css';

const ROWS = [
  { key: 'image', label: '' },
  { key: 'name', label: 'Product' },
  { key: 'price', label: 'Price' },
  { key: 'condition', label: 'Condition' },
  { key: 'rating', label: 'Rating' },
  { key: 'stock', label: 'Stock' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'action', label: '' },
];

const Cell = ({ row, product, onAddToCart, adding }) => {
  switch (row.key) {
    case 'image':
      return (
        <Link to={`/shop/${product.slug}`} className={styles.imageLink}>
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className={styles.productImage}
            />
          ) : (
            <div className={styles.imageFallback}>
              <svg width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}
        </Link>
      );

    case 'name':
      return (
        <Link to={`/shop/${product.slug}`} className={styles.productName}>
          {product.name}
        </Link>
      );

    case 'price':
      return (
        <div className={styles.priceCell}>
          <span className={styles.price}>
            R{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>
              R{product.originalPrice.toLocaleString()}
            </span>
          )}
          {product.originalPrice && (
            <span className={styles.saving}>
              Save R{(product.originalPrice - product.price).toLocaleString()}
            </span>
          )}
        </div>
      );

    case 'condition':
      return (
        <span className={`badge ${
          product.condition === 'like new' ? 'badge-gold' :
          product.condition === 'good' ? 'badge-success' :
          'badge-muted'
        }`}>
          {product.condition}
        </span>
      );

    case 'rating':
      return product.rating?.count > 0 ? (
        <RatingDisplay
          rating={product.rating.average}
          count={product.rating.count}
          size={14}
        />
      ) : (
        <span className={styles.noData}>No reviews yet</span>
      );

    case 'stock':
      return (
        <span className={product.stock > 0 ? styles.inStock : styles.outStock}>
          {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
        </span>
      );

    case 'category':
      return (
        <span className={styles.category}>
          {product.category?.name || '—'}
        </span>
      );

    case 'description':
      return (
        <p className={styles.description}>
          {product.description?.slice(0, 120)}
          {product.description?.length > 120 ? '...' : ''}
        </p>
      );

    case 'action':
      return (
        <div className={styles.actionCell}>
          <button
            className="btn btn-primary btn-full"
            onClick={() => onAddToCart(product)}
            disabled={adding === product._id || product.stock === 0}
          >
            {adding === product._id ? (
              <><span className="spinner" />Adding...</>
            ) : product.stock === 0 ? (
              'Out of stock'
            ) : (
              'Add to cart'
            )}
          </button>
          <Link
            to={`/shop/${product.slug}`}
            className="btn btn-ghost btn-full"
          >
            View details
          </Link>
        </div>
      );

    default:
      return null;
  }
};

const ComparePage = () => {
  const { items, remove, clear } = useCompare();
  const { add } = useCart();
  const [adding, setAdding] = useState(null);
  const [addedMap, setAddedMap] = useState({});

  

  const handleAddToCart = async (product) => {
    if (product.stock === 0) return;
    setAdding(product._id);
    try {
      await add(product._id, 1);
      setAddedMap((p) => ({ ...p, [product._id]: true }));
      setTimeout(() => {
        setAddedMap((p) => ({ ...p, [product._id]: false }));
      }, 2500);
    } catch {}
    finally { setAdding(null); }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <SEO title="Compare products" />
        <div className={styles.emptyContent}>
          <svg width="56" height="56" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <h2>No products to compare</h2>
          <p>Browse the shop and click the compare button on any product to add it here.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Browse shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SEO title="Compare products" url="https://halfsec.co.za/compare" />
      <div className="container">

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Compare products</h1>
            <p className={styles.sub}>
              Comparing {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link to="/shop" className="btn btn-ghost btn-sm">
              ← Add more
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={clear}>
              Clear all
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.labelCol} />
                {items.map((product) => (
                  <th key={product._id} className={styles.productCol}>
                    <button
                      className={styles.removeProduct}
                      onClick={() => remove(product._id)}
                      aria-label={`Remove ${product.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.key}
                  className={`${styles.row} ${!row.label ? styles.rowNoLabel : ''}`}
                >
                  {row.label && (
                    <td className={styles.rowLabel}>{row.label}</td>
                  )}
                  {!row.label && <td className={styles.rowLabel} />}
                  {items.map((product) => (
                    <td key={product._id} className={styles.cell}>
                      <Cell
                        row={row}
                        product={product}
                        onAddToCart={handleAddToCart}
                        adding={adding}
                        added={addedMap[product._id]}
                      />
                    </td>
                  ))}
                  {/* Fill empty columns up to 3 */}
                  {[...Array(3 - items.length)].map((_, i) => (
                    <td key={`empty-${i}`} className={`${styles.cell} ${styles.emptyCell}`}>
                      <Link to="/shop" className={styles.addSlot}>
                        <svg width="20" height="20" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <line x1="12" y1="8" x2="12" y2="16"/>
                          <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                        {row.key === 'image' && 'Add product'}
                      </Link>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
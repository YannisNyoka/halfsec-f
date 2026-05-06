import { useState, useEffect } from 'react';
import { getRelatedProducts } from '../../api/products';
import ProductCard from './ProductCard';
import styles from './RelatedProducts.module.css';

const RelatedProducts = ({ categoryId, currentSlug, categoryName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    getRelatedProducts(categoryId)
      .then(({ data }) => {
        // Filter out the current product
        const filtered = data.products.filter(
          (p) => p.slug !== currentSlug
        ).slice(0, 4);
        setProducts(filtered);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryId, currentSlug]);

  // Don't render if no related products found
  if (!loading && products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>More from {categoryName}</h2>
          <p className={styles.sub}>You might also like these</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeletonGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;
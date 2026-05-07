import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getStockOverview,
  getLowStockProducts,
  updateStock,
} from '../../api/stock';
import styles from './AdminStock.module.css';

const AdminStock = () => {
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ stock: 0, lowStockThreshold: 3 });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, productsRes] = await Promise.all([
        getStockOverview(),
        getLowStockProducts(),
      ]);
      setOverview(overviewRes.data.overview);
      setProducts(productsRes.data.products);
    } catch {
      setError('Failed to load stock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (product) => {
    setEditing(product._id);
    setEditValues({
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    });
    setSuccess('');
    setError('');
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveStock = async (productId) => {
    if (editValues.stock < 0) {
      setError('Stock cannot be negative.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateStock(productId, {
        stock: Number(editValues.stock),
        lowStockThreshold: Number(editValues.lowStockThreshold),
      });
      setSuccess('Stock updated successfully.');
      setEditing(null);
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) return { label: 'Out of stock', cls: styles.statusOut };
    if (product.stock <= product.lowStockThreshold) return { label: 'Low stock', cls: styles.statusLow };
    return { label: 'In stock', cls: styles.statusIn };
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Stock management</h1>
          <p className={styles.sub}>Monitor and update product inventory</p>
        </div>
        <Link to="/admin/products" className="btn btn-ghost btn-sm">
          All products →
        </Link>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Overview stats */}
      {overview && (
        <div className={styles.statsGrid}>
          {[
            {
              label: 'Total products',
              value: overview.totalProducts,
              cls: '',
            },
            {
              label: 'In stock',
              value: overview.inStock,
              cls: styles.statIn,
            },
            {
              label: 'Low stock',
              value: overview.lowStock,
              cls: styles.statLow,
            },
            {
              label: 'Out of stock',
              value: overview.outOfStock,
              cls: styles.statOut,
            },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={`${styles.statValue} ${s.cls}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Low stock products */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Products needing attention
          {products.length > 0 && (
            <span className={styles.alertBadge}>{products.length}</span>
          )}
        </h2>

        {products.length === 0 ? (
          <div className={styles.allGood}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>All products are well stocked!</h3>
            <p>No products are running low at the moment.</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Product</span>
              <span>Category</span>
              <span>Stock</span>
              <span>Threshold</span>
              <span>Status</span>
              <span>Sold</span>
              <span>Actions</span>
            </div>

            {products.map((product) => {
              const status = getStockStatus(product);
              const isEditing = editing === product._id;

              return (
                <div key={product._id} className={`${styles.row} ${isEditing ? styles.rowEditing : ''}`}>
                  {/* Product */}
                  <div className={styles.productCell}>
                    <div className={styles.productImg}>
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} />
                      ) : (
                        <div className={styles.imgFallback} />
                      )}
                    </div>
                    <div>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productSlug}>{product.slug}</div>
                    </div>
                  </div>

                  {/* Category */}
                  <span className={styles.cell}>
                    {product.category?.name || '—'}
                  </span>

                  {/* Stock */}
                  <span className={styles.cell}>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        className={`form-input ${styles.stockInput}`}
                        value={editValues.stock}
                        onChange={(e) => setEditValues((p) => ({
                          ...p, stock: e.target.value,
                        }))}
                      />
                    ) : (
                      <span className={`${styles.stockNum} ${
                        product.stock === 0 ? styles.stockOut :
                        product.stock <= product.lowStockThreshold ? styles.stockLow :
                        styles.stockOk
                      }`}>
                        {product.stock}
                      </span>
                    )}
                  </span>

                  {/* Threshold */}
                  <span className={styles.cell}>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        className={`form-input ${styles.stockInput}`}
                        value={editValues.lowStockThreshold}
                        onChange={(e) => setEditValues((p) => ({
                          ...p, lowStockThreshold: e.target.value,
                        }))}
                      />
                    ) : (
                      <span className={styles.threshold}>
                        ≤ {product.lowStockThreshold}
                      </span>
                    )}
                  </span>

                  {/* Status */}
                  <span>
                    <span className={`${styles.statusBadge} ${status.cls}`}>
                      {status.label}
                    </span>
                  </span>

                  {/* Sold */}
                  <span className={styles.cell}>{product.sold || 0}</span>

                  {/* Actions */}
                  <div className={styles.actions}>
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => saveStock(product._id)}
                          disabled={saving}
                        >
                          {saving ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Save'}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => startEdit(product)}
                        >
                          Edit stock
                        </button>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Edit product
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStock;
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProductsAdmin, deleteProduct, toggleFeatured } from '../../api/admin';
import styles from './AdminProducts.module.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await getAllProductsAdmin({ page, limit: 15 });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((pr) => pr._id !== id));
    } catch {}
    finally { setDeleting(null); }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const { data } = await toggleFeatured(id);
      setProducts((p) => p.map((pr) => pr._id === id ? data.product : pr));
    } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.sub}>{pagination.total ?? 0} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add product
        </Link>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} /></div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <p>No products yet.</p>
          <Link to="/admin/products/new" className="btn btn-primary">Add your first product</Link>
        </div>
      ) : (
        <>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {products.map((product) => (
              <div key={product._id} className={styles.row}>
                <div className={styles.productCell}>
                  <div className={styles.productImg}>
                    {product.images?.[0]?.url
                      ? <img src={product.images[0].url} alt={product.name} />
                      : <div className={styles.imgFallback} />
                    }
                  </div>
                  <div>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productSlug}>{product.slug}</div>
                  </div>
                </div>
                <span className={styles.cell}>{product.category?.name || '—'}</span>
                <span className={styles.cell} style={{ color: 'var(--color-gold)', fontWeight: 700 }}>
                  R{product.price.toLocaleString()}
                </span>
                <span className={styles.cell}>
                  <span className={product.stock === 0 ? styles.outOfStock : ''}>
                    {product.stock}
                  </span>
                </span>
                <span className={styles.cell}>
                  <div className={styles.statusFlags}>
                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {product.isActive ? 'Active' : 'Hidden'}
                    </span>
                    {product.isFeatured && <span className="badge badge-gold">Featured</span>}
                  </div>
                </span>
                <div className={styles.actions}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleToggleFeatured(product._id)}
                    title={product.isFeatured ? 'Unfeature' : 'Feature'}
                  >
                    {product.isFeatured ? '★' : '☆'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                  >Edit</button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(product._id, product.name)}
                    disabled={deleting === product._id}
                  >
                    {deleting === product._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;
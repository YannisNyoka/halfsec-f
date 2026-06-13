import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProducts, deleteSellerProduct } from '../../api/seller';
import styles from './SellerProducts.module.css';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await getMyProducts({ page: p, limit: 20 });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(1); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteSellerProduct(id);
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch {}
    finally { setDeleting(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My products</h1>
          <p className={styles.sub}>{pagination.total || 0} listing{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/seller/products/new" className="btn btn-primary">
          + List new item
        </Link>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <p>You haven't listed any products yet.</p>
          <Link to="/seller/products/new" className="btn btn-primary btn-lg">
            List your first item
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
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
                          <div className={styles.productCategory}>
                            {product.category?.name || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.cell}>R{product.price.toLocaleString()}</td>
                    <td className={styles.cell}>
                      <span className={product.stock === 0 ? styles.outOfStock : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className={styles.cell}>{product.sold || 0}</td>
                    <td>
                      <span className={`badge ${product.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/seller/products/edit/${product._id}`} className="btn btn-ghost btn-sm">
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deleting === product._id}
                        >
                          {deleting === product._id
                            ? <span className="spinner" style={{ width: 12, height: 12 }} />
                            : 'Delete'
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1}
                onClick={() => { setPage(p => p - 1); fetchProducts(page - 1); }}>
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages}
                onClick={() => { setPage(p => p + 1); fetchProducts(page + 1); }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellerProducts;
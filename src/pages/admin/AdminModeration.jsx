import { useState, useEffect } from 'react';
import api from '../../api/axios';
import styles from './AdminModeration.module.css';

const AdminModeration = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products/admin/pending')
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAction = async (id, action) => {
    let note = '';
    if (action === 'reject') {
      note = window.prompt('Reason for rejection (shown to seller):') || '';
    }
    setActioning(id);
    try {
      await api.patch(`/products/admin/${id}/moderate`, { action, note });
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch {}
    finally { setActioning(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Listing moderation</h1>
          <p className={styles.sub}>{products.length} listing{products.length !== 1 ? 's' : ''} awaiting review</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>No listings pending review. 🎉</div>
      ) : (
        <div className={styles.list}>
          {products.map((p) => (
            <div key={p._id} className={styles.card}>
              <div className={styles.imgWrap}>
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt={p.name} />
                ) : (
                  <div className={styles.imgFallback} />
                )}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{p.name}</div>
                <div className={styles.meta}>
                  By {p.seller?.sellerProfile?.businessName || p.seller?.name}
                  {' · '}{p.category?.name}
                  {' · '}R{p.price.toLocaleString()}
                  {' · '}{p.condition}
                </div>
                <p className={styles.description}>{p.description}</p>
              </div>
              <div className={styles.actions}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAction(p._id, 'approve')}
                  disabled={actioning === p._id}
                >
                  {actioning === p._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Approve'}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleAction(p._id, 'reject')}
                  disabled={actioning === p._id}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
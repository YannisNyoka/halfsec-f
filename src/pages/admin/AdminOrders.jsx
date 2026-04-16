import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders } from '../../api/admin';
import styles from './AdminOrders.module.css';

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'badge-muted', confirmed: 'badge-gold', processing: 'badge-gold',
  shipped: 'badge-gold', delivered: 'badge-success', cancelled: 'badge-danger',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (status !== 'all') params.status = status;
    getAllOrders(params)
      .then(({ data }) => { setOrders(data.orders); setPagination(data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, page]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.sub}>{pagination.total ?? 0} total orders</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className={styles.tabs}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`${styles.tab} ${status === s ? styles.tabActive : ''}`}
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} /></div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Order #</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Items</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Status</span>
            <span></span>
          </div>
          {orders.length === 0 ? (
            <div className={styles.empty}>No orders found</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className={styles.row}>
                <span className={styles.orderNum}>{order.orderNumber}</span>
                <span className={styles.cell}>{order.user?.name || 'Unknown'}</span>
                <span className={styles.cell}>
                  {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                </span>
                <span className={styles.cell}>{order.items.length}</span>
                <span className={styles.amount}>R{order.total.toLocaleString()}</span>
                <span>
                  <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-muted'}`}>
                    {order.paymentStatus}
                  </span>
                </span>
                <span>
                  <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>
                    {order.orderStatus}
                  </span>
                </span>
                <Link to={`/admin/orders/${order._id}`} className={styles.viewLink}>View →</Link>
              </div>
            ))
          )}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
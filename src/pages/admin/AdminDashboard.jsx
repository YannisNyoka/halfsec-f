import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getAllOrders } from '../../api/admin';
import styles from './AdminDashboard.module.css';

const STATUS_COLORS = {
  pending: 'badge-muted', confirmed: 'badge-gold',
  processing: 'badge-gold', shipped: 'badge-gold',
  delivered: 'badge-success', cancelled: 'badge-danger',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getAllOrders({ limit: 5 }),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data.stats);
      setRecentOrders(ordersRes.data.orders);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Welcome back, here's what's happening with Halfsec today.</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total orders', value: stats?.totalOrders ?? 0, color: false },
          { label: 'Total revenue', value: `R${(stats?.totalRevenue ?? 0).toLocaleString()}`, color: true },
          { label: 'Pending orders', value: stats?.pendingOrders ?? 0, color: false },
          { label: 'Delivered', value: stats?.deliveredOrders ?? 0, color: true },
        ].map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={`${styles.statValue} ${stat.color ? styles.statGold : ''}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className={styles.quickLinks}>
        <Link to="/admin/products/new" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add product
        </Link>
        <Link to="/admin/categories" className="btn btn-ghost">Manage categories</Link>
        <Link to="/admin/orders" className="btn btn-ghost">View all orders</Link>
      </div>

      {/* Recent orders */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent orders</h2>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Order</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
            <span></span>
          </div>
          {recentOrders.length === 0 ? (
            <div className={styles.empty}>No orders yet</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className={styles.tableRow}>
                <span className={styles.orderNum}>{order.orderNumber}</span>
                <span className={styles.customer}>{order.user?.name || 'Unknown'}</span>
                <span className={styles.muted}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                <span className={styles.amount}>R{order.total.toLocaleString()}</span>
                <span><span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span></span>
                <Link to={`/admin/orders/${order._id}`} className={styles.viewLink}>View →</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
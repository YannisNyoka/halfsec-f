import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../api/orders';
import styles from './OrdersPage.module.css';
import SEO from '@/components/common/SEO';

const STATUS_COLORS = {
  pending: 'badge-muted',
  confirmed: 'badge-gold',
  processing: 'badge-gold',
  shipped: 'badge-gold',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  return (
    <div className={styles.page}>
      <SEO title="My orders" url="https://halfsec.co.za/orders" />
      <div className="container">
        <h1 className={styles.title}>My orders</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <h2>No orders yet</h2>
            <p>Once you place an order it will appear here</p>
            <Link to="/shop" className="btn btn-primary">Start shopping</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className={styles.order}>
                <div className={styles.orderLeft}>
                  <div className={styles.orderNumber}>{order.orderNumber}</div>
                  <div className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                  <div className={styles.orderItems}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className={styles.orderRight}>
                  <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>
                    {order.orderStatus}
                  </span>
                  <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-muted'}`}>
                    {order.paymentStatus}
                  </span>
                  <span className={styles.orderTotal}>R{order.total.toLocaleString()}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
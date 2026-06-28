import { useState, useEffect } from 'react';
import { getSellerOrders } from '../../api/seller';
import SellerOrderTracking from './SellerOrderTracking';
import styles from './SellerOrders.module.css';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await getSellerOrders({ page: p, limit: 20 });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(1); }, []);

  const itemTotal = (items) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleOrderUpdated = (orderId, updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, ...updatedOrder } : o))
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My sales</h1>
        <p className={styles.sub}>
          {pagination.total || 0} order{pagination.total !== 1 ? 's' : ''} containing your items
        </p>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <p>No sales yet. Once your items sell, they'll show up here.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {orders.map((order) => (
              <div key={order._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.orderNum}>{order.orderNumber}</span>
                    <span className={styles.customer}>· {order.customer?.name}</span>
                  </div>
                  <div className={styles.badges}>
                    <span className={`badge ${
                      order.orderStatus === 'delivered' ? 'badge-success' :
                      order.orderStatus === 'cancelled' ? 'badge-danger' :
                      'badge-gold'
                    }`}>
                      {order.orderStatus}
                    </span>
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-muted'}`}>
                      {order.paymentStatus}
                    </span>
                    <button
                      className={styles.expandBtn}
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    >
                      {expanded === order._id ? 'Hide details ↑' : 'Manage ↓'}
                    </button>
                  </div>
                </div>

                <div className={styles.items}>
                  {order.items.map((item, i) => (
                    <div key={i} className={styles.item}>
                      <div className={styles.itemImg}>
                        {item.image ? <img src={item.image} alt={item.name} /> : <div className={styles.imgFallback} />}
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemQty}>Qty: {item.quantity}</span>
                      </div>
                      <span className={styles.itemPrice}>
                        R{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.dateLabel}>
                    {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <span className={styles.total}>
                    Your earnings: R{itemTotal(order.items).toLocaleString()}
                  </span>
                </div>

                {/* Tracking section — expands when seller clicks "Manage" */}
                {expanded === order._id && (
                  <div className={styles.trackingSection}>
                    <SellerOrderTracking
                      order={order}
                      onUpdated={(updatedOrder) => handleOrderUpdated(order._id, updatedOrder)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1}
                onClick={() => { setPage(p => p - 1); fetchOrders(page - 1); }}>
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages}
                onClick={() => { setPage(p => p + 1); fetchOrders(page + 1); }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellerOrders;
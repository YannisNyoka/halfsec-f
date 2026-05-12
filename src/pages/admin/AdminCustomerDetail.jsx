import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomer, toggleCustomerStatus } from '../../api/customers';
import styles from './AdminCustomerDetail.module.css';

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getCustomer(id)
      .then(({ data }) => {
        setCustomer(data.customer);
        setOrders(data.orders);
        setStats(data.stats);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const { data } = await toggleCustomerStatus(id);
      setCustomer((c) => ({ ...c, isActive: data.isActive }));
    } catch {}
    finally { setToggling(false); }
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  if (!customer) return (
    <div style={{ padding: 32 }}>
      <div className="alert alert-error">Customer not found.</div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/admin/customers" className={styles.back}>← All customers</Link>
        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className={styles.name}>{customer.name}</h1>
              <p className={styles.email}>{customer.email}</p>
              <span className={`${styles.statusBadge} ${
                customer.isActive ? styles.statusActive : styles.statusInactive
              }`}>
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            className={`btn ${customer.isActive ? 'btn-ghost' : 'btn-primary'}`}
            onClick={handleToggle}
            disabled={toggling}
          >
            {toggling
              ? <><span className="spinner" />Loading...</>
              : customer.isActive ? 'Deactivate account' : 'Activate account'
            }
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total orders', value: stats.totalOrders || 0 },
          { label: 'Total spent', value: `R${(stats.totalSpent || 0).toLocaleString()}`, gold: true },
          { label: 'Avg order value', value: `R${Math.round(stats.avgOrderValue || 0).toLocaleString()}` },
          {
            label: 'Member since',
            value: new Date(customer.createdAt).toLocaleDateString('en-ZA', {
              day: 'numeric', month: 'long', year: 'numeric',
            }),
          },
        ].map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={`${styles.statValue} ${stat.gold ? styles.statGold : ''}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Contact info */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Contact information</h2>
        <div className={styles.infoGrid}>
          <div>
            <div className={styles.infoLabel}>Email</div>
            <div className={styles.infoValue}>{customer.email}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Phone</div>
            <div className={styles.infoValue}>{customer.phone || '—'}</div>
          </div>
          {customer.address?.street && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div className={styles.infoLabel}>Address</div>
              <div className={styles.infoValue}>
                {customer.address.street}, {customer.address.city},{' '}
                {customer.address.province} {customer.address.postalCode}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Recent orders</h2>
        {orders.length === 0 ? (
          <p className={styles.noOrders}>This customer has not placed any orders yet.</p>
        ) : (
          <div className={styles.ordersTable}>
            <div className={styles.ordersHeader}>
              <span>Order</span>
              <span>Status</span>
              <span>Payment</span>
              <span>Total</span>
              <span>Date</span>
              <span></span>
            </div>
            {orders.map((order) => (
              <div key={order._id} className={styles.orderRow}>
                <span className={styles.orderNum}>{order.orderNumber}</span>
                <span>
                  <span className={`badge ${
                    order.orderStatus === 'delivered' ? 'badge-success' :
                    order.orderStatus === 'cancelled' ? 'badge-danger' :
                    'badge-gold'
                  }`}>
                    {order.orderStatus}
                  </span>
                </span>
                <span>
                  <span className={`badge ${
                    order.paymentStatus === 'paid' ? 'badge-success' : 'badge-muted'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </span>
                <span className={styles.orderAmount}>
                  R{order.total.toLocaleString()}
                </span>
                <span className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                    day: 'numeric', month: 'short',
                  })}
                </span>
                <Link
                  to={`/admin/orders/${order._id}`}
                  className={styles.viewLink}
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerDetail;
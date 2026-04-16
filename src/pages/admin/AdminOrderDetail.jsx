import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderAdmin, updateOrderStatus } from '../../api/admin';
import styles from './AdminOrderDetail.module.css';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getOrderAdmin(id)
      .then(({ data }) => {
        setOrder(data.order);
        setOrderStatus(data.order.orderStatus);
        setPaymentStatus(data.order.paymentStatus);
      })
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    setSuccess(''); setError('');
    try {
      const { data } = await updateOrderStatus(id, { orderStatus, paymentStatus });
      setOrder(data.order);
      setSuccess('Order updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} /></div>;
  if (!order) return <div style={{ padding: 32 }}><div className="alert alert-error">{error}</div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link to="/admin/orders" className={styles.back}>← Back to orders</Link>
          <h1 className={styles.title}>Order {order.orderNumber}</h1>
          <p className={styles.sub}>
            {new Date(order.createdAt).toLocaleDateString('en-ZA', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className={styles.layout}>
        <div className={styles.main}>
          {/* Items */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Items ({order.items.length})</h2>
            <div className={styles.items}>
              {order.items.map((item, i) => (
                <div key={i} className={styles.item}>
                  <div className={styles.itemImg}>
                    {item.image ? <img src={item.image} alt={item.name} /> : <div className={styles.imgFallback} />}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQty}>Qty: {item.quantity} × R{item.price.toLocaleString()}</span>
                  </div>
                  <span className={styles.itemTotal}>R{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Shipping address</h2>
            <div className={styles.address}>
              <p><strong>{order.shippingAddress.name}</strong></p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p style={{ color: 'var(--color-gold)' }}>{order.shippingAddress.phone}</p>
            </div>
          </div>

          {order.notes && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Customer notes</h2>
              <p className={styles.notes}>{order.notes}</p>
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          {/* Update status */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Update status</h2>
            <div className="form-group">
              <label className="form-label">Order status</label>
              <select className="form-select" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Payment status</label>
              <select className="form-select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 16 }}
              onClick={handleUpdate}
              disabled={updating}
            >
              {updating ? <><span className="spinner" />Updating...</> : 'Save changes'}
            </button>
          </div>

          {/* Summary */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Payment summary</h2>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>Subtotal</span><span>R{order.itemsTotal.toLocaleString()}</span></div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span style={{ color: order.shippingCost === 0 ? 'var(--color-success)' : 'inherit' }}>
                  {order.shippingCost === 0 ? 'Free' : `R${order.shippingCost}`}
                </span>
              </div>
              <div style={{ height: 1, background: 'var(--color-border)' }} />
              <div className={styles.summaryTotal}><span>Total</span><span>R{order.total.toLocaleString()}</span></div>
            </div>
            <div className={styles.payMethod}>
              <span className={styles.pmLabel}>Method</span>
              <span className={styles.pmValue}>{order.paymentMethod.toUpperCase()}</span>
            </div>
          </div>

          {/* Customer */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Customer</h2>
            <div className={styles.customerInfo}>
              <div className={styles.customerAvatar}>
                {order.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.customerName}>{order.user?.name}</div>
                <div className={styles.customerEmail}>{order.user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
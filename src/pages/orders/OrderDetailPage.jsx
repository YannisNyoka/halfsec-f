import { useState, useEffect } from 'react';
import { useParams, useLocation, Link,useSearchParams } from 'react-router-dom';
import { getMyOrder } from '../../api/orders';
import styles from './OrderDetailPage.module.css';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS = {
  pending: 'badge-muted', confirmed: 'badge-gold', processing: 'badge-gold',
  shipped: 'badge-gold', delivered: 'badge-success', cancelled: 'badge-danger',
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams(); 
  const justPlaced = location.state?.justPlaced || searchParams.get('paid') === 'true';


  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  if (error || !order) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ color: 'var(--color-text-secondary)' }}>{error}</h2>
      <Link to="/orders" className="btn btn-outline" style={{ marginTop: 16 }}>Back to orders</Link>
    </div>
  );

  const currentStep = STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className={styles.page}>
      <div className="container">

        {justPlaced && (
          <div className="alert alert-success" style={{ marginBottom: 24 }}>
            🎉 Your order has been placed! We'll confirm it shortly.
          </div>
        )}

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Order {order.orderNumber}</h1>
            <p className={styles.date}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <div className={styles.badges}>
            <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
            <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-muted'}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className={styles.tracker}>
            {STEPS.map((step, i) => (
              <div key={step} className={styles.trackStep}>
                <div className={`${styles.trackDot} ${i <= currentStep ? styles.trackDotActive : ''}`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`${styles.trackLabel} ${i <= currentStep ? styles.trackLabelActive : ''}`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`${styles.trackLine} ${i < currentStep ? styles.trackLineActive : ''}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.main}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Items ordered</h2>
              <div className={styles.items}>
                {order.items.map((item, i) => (
                  <div key={i} className={styles.item}>
                    <div className={styles.itemImg}>
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <div className={styles.imgFallback} />
                      }
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
            </div>

            {/* Shipping address */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Shipping address</h2>
              <div className={styles.address}>
                <p className={styles.addressName}>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                <p>{order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className={styles.addressPhone}>{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.sidebar}>
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
              <div className={styles.paymentMethod}>
                <span className={styles.pmLabel}>Payment method</span>
                <span className={styles.pmValue}>{order.paymentMethod.toUpperCase()}</span>
              </div>
            </div>

            <Link to="/orders" className="btn btn-ghost btn-full">Back to orders</Link>
            <Link to="/shop" className="btn btn-primary btn-full">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
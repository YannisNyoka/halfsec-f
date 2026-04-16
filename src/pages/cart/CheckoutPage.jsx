import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../api/orders';
import useAuth from '../../hooks/useAuth';
import styles from './CheckoutPage.module.css';

const SA_PROVINCES = [
  'Eastern Cape','Free State','Gauteng','KwaZulu-Natal',
  'Limpopo','Mpumalanga','Northern Cape','North West','Western Cape',
];

const CheckoutPage = () => {
  const { cart, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shippingCost = total >= 500 ? 0 : 80;
  const orderTotal = total + shippingCost;

  const [form, setForm] = useState({
    name: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    province: user?.address?.province || '',
    postalCode: user?.address?.postalCode || '',
    phone: user?.phone || '',
    paymentMethod: 'eft',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.street.trim()) e.street = 'Street address is required.';
    if (!form.city.trim()) e.city = 'City is required.';
    if (!form.province) e.province = 'Province is required.';
    if (!form.postalCode.trim()) e.postalCode = 'Postal code is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!cart?.items?.length) {
      navigate('/cart');
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const { data } = await placeOrder({
        shippingAddress: {
          name: form.name,
          street: form.street,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
          country: 'South Africa',
          phone: form.phone,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });
      await clear();
      navigate(`/orders/${data.order._id}`, { state: { justPlaced: true } });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items?.length) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ color: 'var(--color-text-secondary)' }}>Your cart is empty</h2>
      <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Browse shop</Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Checkout</h1>

        {serverError && <div className="alert alert-error" style={{ marginBottom: 24 }}>{serverError}</div>}

        <div className={styles.layout}>
          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Shipping address</h2>
              <div className={styles.formGrid}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Full name</label>
                  <input name="name" className={`form-input ${errors.name ? 'error' : ''}`}
                    value={form.name} onChange={handleChange} placeholder="Recipient name" />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Street address</label>
                  <input name="street" className={`form-input ${errors.street ? 'error' : ''}`}
                    value={form.street} onChange={handleChange} placeholder="123 Main Street" />
                  {errors.street && <span className="form-error">{errors.street}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input name="city" className={`form-input ${errors.city ? 'error' : ''}`}
                    value={form.city} onChange={handleChange} placeholder="Johannesburg" />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Province</label>
                  <select name="province" className={`form-select ${errors.province ? 'error' : ''}`}
                    value={form.province} onChange={handleChange}>
                    <option value="">Select province</option>
                    {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.province && <span className="form-error">{errors.province}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Postal code</label>
                  <input name="postalCode" className={`form-input ${errors.postalCode ? 'error' : ''}`}
                    value={form.postalCode} onChange={handleChange} placeholder="2000" />
                  {errors.postalCode && <span className="form-error">{errors.postalCode}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone number</label>
                  <input name="phone" className={`form-input ${errors.phone ? 'error' : ''}`}
                    value={form.phone} onChange={handleChange} placeholder="082 123 4567" />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Payment method</h2>
              <div className={styles.paymentOptions}>
                {[
                  { value: 'eft', label: 'EFT / Bank transfer', icon: '🏦' },
                  { value: 'card', label: 'Credit / Debit card', icon: '💳' },
                  { value: 'payfast', label: 'PayFast', icon: '⚡' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`${styles.paymentOption} ${form.paymentMethod === opt.value ? styles.paymentSelected : ''}`}
                  >
                    <input
                      type="radio" name="paymentMethod"
                      value={opt.value} checked={form.paymentMethod === opt.value}
                      onChange={handleChange} style={{ display: 'none' }}
                    />
                    <span className={styles.paymentIcon}>{opt.icon}</span>
                    <span className={styles.paymentLabel}>{opt.label}</span>
                    {form.paymentMethod === opt.value && (
                      <span className={styles.paymentCheck}>✓</span>
                    )}
                  </label>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Order notes <span>(optional)</span></h2>
              <textarea
                name="notes" className="form-input" rows={3}
                value={form.notes} onChange={handleChange}
                placeholder="Any special instructions for your order..."
                style={{ resize: 'vertical' }}
              />
            </section>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" />Placing order...</> : `Place order — R${orderTotal.toLocaleString()}`}
            </button>
          </form>

          {/* Order summary sidebar */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order summary</h2>
            <div className={styles.summaryItems}>
              {cart.items.map((item) => item.product && (
                <div key={item.product._id} className={styles.summaryItem}>
                  <div className={styles.summaryItemImg}>
                    {item.product.images?.[0]?.url
                      ? <img src={item.product.images[0].url} alt={item.product.name} />
                      : <div className={styles.summaryImgFallback} />
                    }
                    <span className={styles.summaryQtyBadge}>{item.quantity}</span>
                  </div>
                  <div className={styles.summaryItemInfo}>
                    <span className={styles.summaryItemName}>{item.product.name}</span>
                  </div>
                  <span className={styles.summaryItemPrice}>
                    R{(item.priceAtAdd * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>Subtotal</span><span>R{total.toLocaleString()}</span></div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span style={{ color: shippingCost === 0 ? 'var(--color-success)' : 'inherit' }}>
                  {shippingCost === 0 ? 'Free' : `R${shippingCost}`}
                </span>
              </div>
              <div className={styles.divider} />
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>R{orderTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getOfferCheckout, purchaseOffer } from '../../api/offers';
import { createYocoCheckout } from '../../api/payment';
import ProtectionFeeInfo from '../../components/common/ProtectionFeeInfo';
import SEO from '../../components/common/SEO';
import styles from '../cart/CheckoutPage.module.css';

const SA_PROVINCES = [
  'Eastern Cape','Free State','Gauteng','KwaZulu-Natal',
  'Limpopo','Mpumalanga','Northern Cape','North West','Western Cape',
];

const OfferCheckoutPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    province: user?.address?.province || '',
    postalCode: user?.address?.postalCode || '',
    phone: user?.phone || '',
    paymentMethod: 'yoco',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    getOfferCheckout(id)
      .then(({ data }) => {
        if (data.alreadyPurchased) {
          navigate(`/orders/${data.orderId}`, { replace: true });
          return;
        }
        setPreview(data);
      })
      .catch((err) => {
        setLoadError(err.response?.data?.message || 'This offer is not available to purchase.');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

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

    setSubmitting(true);
    setServerError('');

    try {
      const { data } = await purchaseOffer(id, {
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

      const order = data.order;

      if (form.paymentMethod === 'yoco') {
        const { data: payData } = await createYocoCheckout(order._id);
        window.location.href = payData.checkoutUrl;
      } else {
        navigate(`/orders/${order._id}`, { state: { justPlaced: true } });
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to complete purchase. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ color: 'var(--color-text-secondary)' }}>{loadError}</h2>
        <Link to="/watchlist" className="btn btn-primary" style={{ marginTop: 16 }}>Back to my offers</Link>
      </div>
    );
  }

  const { offer, itemsTotal, buyerProtectionFee, shippingCost, total } = preview;
  const product = offer.product;

  return (
    <div className={styles.page}>
      <SEO title="Complete your purchase" />
      <div className="container">
        <h1 className={styles.title}>Complete your purchase</h1>

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            {serverError}
          </div>
        )}

        <div className={styles.layout}>
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Shipping */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Shipping address</h2>
              <div className={styles.formGrid}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Full name</label>
                  <input name="name"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={form.name} onChange={handleChange}
                    placeholder="Recipient name" />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Street address</label>
                  <input name="street"
                    className={`form-input ${errors.street ? 'error' : ''}`}
                    value={form.street} onChange={handleChange}
                    placeholder="123 Main Street" />
                  {errors.street && <span className="form-error">{errors.street}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input name="city"
                    className={`form-input ${errors.city ? 'error' : ''}`}
                    value={form.city} onChange={handleChange}
                    placeholder="Johannesburg" />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Province</label>
                  <select name="province"
                    className={`form-select ${errors.province ? 'error' : ''}`}
                    value={form.province} onChange={handleChange}>
                    <option value="">Select province</option>
                    {SA_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.province && <span className="form-error">{errors.province}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Postal code</label>
                  <input name="postalCode"
                    className={`form-input ${errors.postalCode ? 'error' : ''}`}
                    value={form.postalCode} onChange={handleChange}
                    placeholder="2000" />
                  {errors.postalCode && <span className="form-error">{errors.postalCode}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone number</label>
                  <input name="phone"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    value={form.phone} onChange={handleChange}
                    placeholder="082 123 4567" />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Payment method</h2>
              <div className={styles.paymentOptions}>
                {[
                  {
                    value: 'yoco',
                    label: 'Pay by card',
                    sub: 'Visa, Mastercard — secure Yoco checkout',
                    recommended: true,
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5">
                        <rect x="1" y="4" width="22" height="16" rx="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    ),
                  },
                  {
                    value: 'eft',
                    label: 'EFT / Bank transfer',
                    sub: 'Manual bank transfer — order held until payment received',
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <path d="M2 10h20"/>
                      </svg>
                    ),
                  },
                ].map((opt) => (
                  <label key={opt.value}
                    className={`${styles.paymentOption} ${form.paymentMethod === opt.value ? styles.paymentSelected : ''}`}
                  >
                    <input type="radio" name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={handleChange}
                      style={{ display: 'none' }} />
                    <span className={styles.paymentIcon}>{opt.icon}</span>
                    <div className={styles.paymentInfo}>
                      <span className={styles.paymentLabel}>
                        {opt.label}
                        {opt.recommended && (
                          <span className={styles.recommended}>Recommended</span>
                        )}
                      </span>
                      <span className={styles.paymentSub}>{opt.sub}</span>
                    </div>
                    {form.paymentMethod === opt.value && (
                      <span className={styles.paymentCheck}>✓</span>
                    )}
                  </label>
                ))}
              </div>

              {form.paymentMethod === 'yoco' && (
                <div className={styles.yocoInfo}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  You'll be redirected to Yoco's secure payment page to enter your card details.
                </div>
              )}

              {form.paymentMethod === 'eft' && (
                <div className={styles.eftInfo}>
                  <strong>Banking details:</strong><br />
                  Bank: Capitec · Account: 2331479069<br />
                  Branch: 250655 · Reference: your order number
                </div>
              )}
            </section>

            {/* Notes */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Order notes{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: 13 }}>
                  (optional)
                </span>
              </h2>
              <textarea name="notes" className="form-input" rows={3}
                value={form.notes} onChange={handleChange}
                placeholder="Any special instructions..."
                style={{ resize: 'vertical' }} />
            </section>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
            >
              {submitting ? (
                <><span className="spinner" />Completing purchase...</>
              ) : form.paymentMethod === 'yoco' ? (
                `Pay R${total.toLocaleString()} securely`
              ) : (
                `Complete purchase — R${total.toLocaleString()}`
              )}
            </button>
          </form>

          {/* Summary sidebar */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order summary</h2>
            <div className={styles.summaryItems}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemImg}>
                  {product?.images?.[0]?.url
                    ? <img src={product.images[0].url} alt={product.name} />
                    : <div className={styles.summaryImgFallback} />
                  }
                  <span className={styles.summaryQtyBadge}>1</span>
                </div>
                <span className={styles.summaryItemName}>{product?.name}</span>
                <span className={styles.summaryItemPrice}>
                  <span style={{ textDecoration: 'line-through', color: 'var(--color-muted)', fontSize: 12, marginRight: 6 }}>
                    R{offer.originalPrice.toLocaleString()}
                  </span>
                  R{offer.offerPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.divider} />
            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>Negotiated price</span>
                <span>R{itemsTotal.toLocaleString()}</span>
              </div>

              {buyerProtectionFee > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.feeLabel}>
                    Buyer Protection Fee
                    <ProtectionFeeInfo />
                  </span>
                  <span>R{buyerProtectionFee.toLocaleString()}</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={shippingCost === 0 ? styles.freeShipping : ''}>
                  {shippingCost === 0 ? 'Free' : `R${shippingCost}`}
                </span>
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>R{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCheckoutPage;

import { useState } from 'react';
import api from '../../api/axios';
import styles from './SellerOrderTracking.module.css';

const COURIERS = [
  'The Courier Guy',
  'Pudo',
  'Pargo',
  'Aramex / Fastway',
  'DHL',
  'PostNet',
  'Dawn Wing',
  'Other',
];

const SellerOrderTracking = ({ order, onUpdated }) => {
  const [form, setForm] = useState({
    trackingNumber: order.trackingNumber || '',
    courierName: order.courierName || '',
    estimatedDelivery: order.estimatedDelivery
      ? new Date(order.estimatedDelivery).toISOString().split('T')[0]
      : '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.trackingNumber.trim()) {
      setError('Tracking number is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/orders/${order._id}/tracking`, form);
      setSuccess('Tracking info saved! Buyer has been notified.');
      setTimeout(() => setSuccess(''), 3000);
      if (onUpdated) onUpdated(data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tracking info.');
    } finally {
      setSaving(false);
    }
  };

  const alreadyShipped = !!order.trackingNumber;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13" rx="2"/>
          <path d="M16 8h4l3 3v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        <h3 className={styles.title}>
          {alreadyShipped ? 'Update tracking' : 'Add tracking info'}
        </h3>
        {alreadyShipped && (
          <span className={`badge badge-success`}>Shipped</span>
        )}
      </div>

      {alreadyShipped && (
        <div className={styles.currentTracking}>
          <span className={styles.trackingLabel}>Current tracking:</span>
          <span className={styles.trackingNum}>{order.trackingNumber}</span>
          {order.courierName && (
            <span className={styles.courierName}>via {order.courierName}</span>
          )}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className="form-group">
            <label className="form-label">Courier</label>
            <select
              name="courierName"
              className="form-select"
              value={form.courierName}
              onChange={handleChange}
            >
              <option value="">Select courier</option>
              {COURIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tracking number *</label>
            <input
              name="trackingNumber"
              className="form-input"
              value={form.trackingNumber}
              onChange={handleChange}
              placeholder="e.g. TCG123456789"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Est. delivery <span style={{ color: 'var(--color-muted)', fontSize: 11 }}>(optional)</span>
            </label>
            <input
              type="date"
              name="estimatedDelivery"
              className="form-input"
              value={form.estimatedDelivery}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
          style={{ width: 'fit-content' }}
        >
          {saving
            ? <><span className="spinner" />Saving...</>
            : alreadyShipped ? 'Update tracking' : 'Mark as shipped & save tracking'
          }
        </button>
      </form>

      <p className={styles.hint}>
        Once saved, the buyer will be notified that their order has shipped and can see the tracking details on their order page.
      </p>
    </div>
  );
};

export default SellerOrderTracking;
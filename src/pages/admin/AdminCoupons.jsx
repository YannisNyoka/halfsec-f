import { useState, useEffect } from 'react';
import {
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  toggleCoupon,
} from '../../api/coupons';
import styles from './AdminCoupons.module.css';

const INITIAL_FORM = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '',
  userUsageLimit: '1',
  isActive: true,
  expiresAt: '',
  startsAt: '',
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCoupons = async () => {
    try {
      const { data } = await getAllCoupons();
      setCoupons(data.coupons);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await createCoupon({
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        userUsageLimit: Number(form.userUsageLimit) || 1,
        expiresAt: form.expiresAt || null,
        startsAt: form.startsAt || null,
      });
      setSuccess('Coupon created!');
      setShowForm(false);
      setForm(INITIAL_FORM);
      await fetchCoupons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
      setCoupons((p) => p.filter((c) => c._id !== id));
    } catch {}
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleCoupon(id);
      setCoupons((p) => p.map((c) => c._id === id ? { ...c, isActive: data.coupon.isActive } : c));
    } catch {}
  };

  const isExpired = (coupon) =>
    coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return { label: 'Inactive', cls: styles.statusInactive };
    if (isExpired(coupon)) return { label: 'Expired', cls: styles.statusExpired };
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit)
      return { label: 'Used up', cls: styles.statusExpired };
    return { label: 'Active', cls: styles.statusActive };
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Coupons</h1>
          <p className={styles.sub}>Create and manage promo codes</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm((s) => !s); setError(''); }}
        >
          {showForm ? 'Cancel' : '+ New coupon'}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className={styles.form}>
          <h2 className={styles.formTitle}>New coupon</h2>
          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Code *</label>
              <input
                name="code"
                className="form-input"
                value={form.code}
                onChange={handleChange}
                placeholder="SUMMER20"
                style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                name="description"
                className="form-input"
                value={form.description}
                onChange={handleChange}
                placeholder="Summer sale 20% off"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select name="type" className="form-select"
                value={form.type} onChange={handleChange}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (R)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Value * {form.type === 'percentage' ? '(%)' : '(R)'}
              </label>
              <input
                name="value"
                type="number"
                min="1"
                max={form.type === 'percentage' ? '100' : undefined}
                className="form-input"
                value={form.value}
                onChange={handleChange}
                placeholder={form.type === 'percentage' ? '20' : '50'}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min order amount (R)</label>
              <input
                name="minOrderAmount"
                type="number"
                min="0"
                className="form-input"
                value={form.minOrderAmount}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            {form.type === 'percentage' && (
              <div className="form-group">
                <label className="form-label">Max discount (R)</label>
                <input
                  name="maxDiscount"
                  type="number"
                  min="0"
                  className="form-input"
                  value={form.maxDiscount}
                  onChange={handleChange}
                  placeholder="Optional cap"
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Total usage limit</label>
              <input
                name="usageLimit"
                type="number"
                min="1"
                className="form-input"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="Unlimited"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Per user limit</label>
              <input
                name="userUsageLimit"
                type="number"
                min="1"
                className="form-input"
                value={form.userUsageLimit}
                onChange={handleChange}
                placeholder="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start date</label>
              <input
                name="startsAt"
                type="datetime-local"
                className="form-input"
                value={form.startsAt}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry date</label>
              <input
                name="expiresAt"
                type="datetime-local"
                className="form-input"
                value={form.expiresAt}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formFooter}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              <span>Active immediately</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setShowForm(false); setError(''); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? <><span className="spinner" />Creating...</> : 'Create coupon'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Coupons table */}
      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : coupons.length === 0 ? (
        <div className={styles.empty}>
          <p>No coupons yet. Create your first promo code!</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min order</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <tr key={coupon._id}>
                    <td>
                      <div className={styles.codeCell}>
                        <span className={styles.code}>{coupon.code}</span>
                        {coupon.description && (
                          <span className={styles.codeDesc}>{coupon.description}</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.cell}>
                      {coupon.type === 'percentage' ? '%' : 'Fixed'}
                    </td>
                    <td className={styles.cell}>
                      {coupon.type === 'percentage'
                        ? `${coupon.value}%`
                        : `R${coupon.value}`
                      }
                      {coupon.maxDiscount && (
                        <span className={styles.maxDiscount}>
                          {' '}(max R{coupon.maxDiscount})
                        </span>
                      )}
                    </td>
                    <td className={styles.cell}>
                      {coupon.minOrderAmount > 0
                        ? `R${coupon.minOrderAmount}`
                        : '—'
                      }
                    </td>
                    <td className={styles.cell}>
                      {coupon.usageCount}
                      {coupon.usageLimit !== null
                        ? ` / ${coupon.usageLimit}`
                        : ' / ∞'
                      }
                    </td>
                    <td className={styles.cell}>
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString('en-ZA', {
                            day: 'numeric', month: 'short', year: '2-digit',
                          })
                        : '—'
                      }
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`btn btn-ghost btn-sm`}
                          onClick={() => handleToggle(coupon._id)}
                        >
                          {coupon.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(coupon._id, coupon.code)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
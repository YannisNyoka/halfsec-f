import { useState } from 'react';
import { validateCoupon } from '../../api/coupons';
import styles from './CouponInput.module.css';

const CouponInput = ({ orderTotal, onApply, onRemove, appliedCoupon }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await validateCoupon(code.trim(), orderTotal);
      onApply(data);
      setCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setError('');
    onRemove();
  };

  if (appliedCoupon) {
    return (
      <div className={styles.applied}>
        <div className={styles.appliedInfo}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <div>
            <span className={styles.appliedCode}>{appliedCoupon.coupon.code}</span>
            <span className={styles.appliedSaving}>
              {' '}— You save R{appliedCoupon.discountAmount.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          type="button"
          className={styles.removeBtn}
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <form onSubmit={handleApply} className={styles.form}>
        <input
          className={`form-input ${styles.input} ${error ? 'error' : ''}`}
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          maxLength={20}
          autoComplete="off"
          autoCapitalize="characters"
        />
        <button
          type="submit"
          className={`btn btn-outline ${styles.applyBtn}`}
          disabled={loading || !code.trim()}
        >
          {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Apply'}
        </button>
      </form>
      {error && <p className="form-error" style={{ marginTop: 6 }}>{error}</p>}
    </div>
  );
};

export default CouponInput;
import { useState } from 'react';
import { rateSeller } from '../../api/sellerRatings';
import StarRating from './StarRating';
import styles from './RateSellerCard.module.css';

const RateSellerCard = ({ order, subOrder, onRated }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Only show for seller items, once, after escrow resolved
  if (!subOrder.seller) return null;
  if (subOrder.rated || done) {
    return (
      <div className={styles.thanksBox}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Thanks for rating this seller!
      </div>
    );
  }
  if (!['released', 'refunded'].includes(subOrder.escrowStatus)) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await rateSeller(order._id, subOrder._id, { rating, comment: comment.trim() });
      setDone(true);
      onRated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.box}>
      <h3 className={styles.title}>How was this seller?</h3>
      <p className={styles.sub}>Your feedback helps other buyers.</p>

      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={styles.starBtn}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => { setRating(star); setError(''); }}
          >
            <svg
              width="28" height="28" viewBox="0 0 24 24"
              fill={(hover || rating) >= star ? 'var(--color-gold)' : 'none'}
              stroke="var(--color-gold)" strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        ))}
      </div>

      <textarea
        className="form-input"
        placeholder="Leave a comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={500}
        style={{ resize: 'vertical' }}
      />

      {error && <div className={styles.error}>{error}</div>}

      <button
        className="btn btn-primary btn-sm"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? <><span className="spinner" style={{ width: 12, height: 12 }} />Submitting...</> : 'Submit rating'}
      </button>
    </div>
  );
};

export default RateSellerCard;
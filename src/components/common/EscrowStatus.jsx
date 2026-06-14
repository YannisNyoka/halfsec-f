import { useState } from 'react';
import { confirmReceipt, raiseDispute } from '../../api/escrow';
import DisputeModal from './DisputeModal';
import styles from './EscrowStatus.module.css';

const getDaysRemaining = (autoReleaseAt) => {
  if (!autoReleaseAt) return null;
  const diff = new Date(autoReleaseAt) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const EscrowStatus = ({ order, subOrder, onUpdate }) => {
  const [confirming, setConfirming] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!window.confirm('Confirm that you\'ve received this item as described? Payment will be released to the seller.')) {
      return;
    }
    setConfirming(true);
    setError('');
    try {
      const { data } = await confirmReceipt(order._id, subOrder._id);
      setMessage(data.message);
      onUpdate?.({ ...subOrder, escrowStatus: 'released' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm.');
    } finally {
      setConfirming(false);
    }
  };

  const handleDisputeSubmit = async (reason, description) => {
    const { data } = await raiseDispute(order._id, subOrder._id, { reason, description });
    setMessage(data.message);
    onUpdate?.({ ...subOrder, escrowStatus: 'disputed', dispute: { reason, description, resolution: 'none' } });
    setShowDispute(false);
  };

  // ── Already resolved ──
  if (subOrder.escrowStatus === 'released') {
    return (
      <div className={`${styles.box} ${styles.released}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>Payment released to seller</span>
      </div>
    );
  }

  if (subOrder.escrowStatus === 'refunded') {
    return (
      <div className={`${styles.box} ${styles.refunded}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6"/>
          <path d="M21 17a9 9 0 00-15-6.7L3 13"/>
        </svg>
        <span>Refunded to you</span>
      </div>
    );
  }

  if (subOrder.escrowStatus === 'disputed') {
    return (
      <div className={`${styles.box} ${styles.disputed}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <div className={styles.disputedTitle}>Dispute under review</div>
          <div className={styles.disputedSub}>
            Our team is reviewing this. We'll email you once it's resolved.
          </div>
        </div>
      </div>
    );
  }

  // ── Held — show confirm/dispute UI only if order delivered ──
  if (order.orderStatus !== 'delivered') {
    return (
      <div className={`${styles.box} ${styles.heldPending}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span>Payment held securely until delivery</span>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(subOrder.autoReleaseAt);

  return (
    <div className={`${styles.box} ${styles.held}`}>
      {message && <div className={styles.successMsg}>{message}</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {!message && (
        <>
          <div className={styles.heldHeader}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <div>
              <div className={styles.heldTitle}>Payment held in escrow</div>
              {daysRemaining !== null && (
                <div className={styles.heldSub}>
                  {daysRemaining > 0
                    ? `Auto-releases to seller in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} if no action is taken`
                    : 'Auto-release is due — please confirm or raise an issue soon'
                  }
                </div>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? <><span className="spinner" style={{ width: 12, height: 12 }} />Confirming...</> : 'Confirm receipt'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowDispute(true)}
            >
              Report an issue
            </button>
          </div>
        </>
      )}

      {showDispute && (
        <DisputeModal
          onClose={() => setShowDispute(false)}
          onSubmit={handleDisputeSubmit}
        />
      )}
    </div>
  );
};

export default EscrowStatus;
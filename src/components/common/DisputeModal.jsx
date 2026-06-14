import { useState } from 'react';
import styles from './DisputeModal.module.css';

const REASONS = [
  'Item not received',
  'Item significantly not as described',
  'Item damaged or defective',
  'Wrong item received',
  'Missing parts or accessories',
  'Other',
];

const DisputeModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Please describe the issue in more detail (at least 10 characters).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(reason, description.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit dispute.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Report an issue</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p className={styles.sub}>
          Let us know what went wrong. Payment will stay on hold while we review your case.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">What's the issue?</label>
            <select
              className="form-select"
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
            >
              <option value="">Select a reason</option>
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Describe what happened</label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(''); }}
              rows={4}
              maxLength={1000}
              placeholder="Please provide as much detail as possible..."
              style={{ resize: 'vertical' }}
            />
            <span className="form-hint">{description.length}/1000</span>
          </div>

          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? <><span className="spinner" />Submitting...</> : 'Submit dispute'}
            </button>
            <button type="button" className="btn btn-ghost btn-full" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;
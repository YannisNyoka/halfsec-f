import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSellerPayoutDetail, recordPayout } from '../../api/payouts';
import styles from './AdminPayoutDetail.module.css';

const AdminPayoutDetail = () => {
  const { sellerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [method, setMethod] = useState('eft');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = () => {
    getSellerPayoutDetail(sellerId)
      .then(({ data }) => {
        setData(data);
        // Select all available by default
        setSelected(new Set(data.balance.availableSubOrders.map((s) => s.subOrderId)));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [sellerId]);

  const toggle = (subOrderId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(subOrderId)) next.delete(subOrderId);
      else next.add(subOrderId);
      return next;
    });
  };

  const selectedTotal = data?.balance.availableSubOrders
    .filter((s) => selected.has(s.subOrderId))
    .reduce((sum, s) => sum + s.amount, 0) || 0;

  const handlePay = async () => {
    if (selected.size === 0) {
      setError('Select at least one item to include.');
      return;
    }
    if (!window.confirm(`Record a payout of R${selectedTotal.toLocaleString()} to ${data.seller.name}? Make sure you've already completed the EFT.`)) {
      return;
    }

    setSubmitting(true);
    setError(''); setSuccess('');
    try {
      const subOrderIds = data.balance.availableSubOrders
        .filter((s) => selected.has(s.subOrderId))
        .map((s) => ({ orderId: s.order, subOrderId: s.subOrderId }));

      await recordPayout(sellerId, { method, reference, notes, subOrderIds });
      setSuccess('Payout recorded successfully.');
      setReference(''); setNotes('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payout.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  const { seller, balance, payouts } = data;

  return (
    <div className={styles.page}>
      <Link to="/admin/payouts" className={styles.back}>← All sellers</Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{seller.sellerProfile?.businessName || seller.name}</h1>
          <p className={styles.sub}>{seller.email}</p>
        </div>
      </div>

      {/* Bank details */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Banking details</h2>
        <div className={styles.bankGrid}>
          <div>
            <div className={styles.bankLabel}>Account holder</div>
            <div className={styles.bankValue}>{seller.sellerProfile?.bankDetails?.accountHolder || '—'}</div>
          </div>
          <div>
            <div className={styles.bankLabel}>Bank</div>
            <div className={styles.bankValue}>{seller.sellerProfile?.bankDetails?.bankName || '—'}</div>
          </div>
          <div>
            <div className={styles.bankLabel}>Account number</div>
            <div className={styles.bankValue} style={{ fontFamily: 'monospace' }}>
              {seller.sellerProfile?.bankDetails?.accountNumber || '—'}
            </div>
          </div>
          <div>
            <div className={styles.bankLabel}>Branch code</div>
            <div className={styles.bankValue} style={{ fontFamily: 'monospace' }}>
              {seller.sellerProfile?.bankDetails?.branchCode || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Balance summary */}
      <div className={styles.balanceGrid}>
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>In escrow</div>
          <div className={styles.balanceValue}>R{balance.held.toLocaleString()}</div>
        </div>
        <div className={`${styles.balanceCard} ${styles.balanceHighlight}`}>
          <div className={styles.balanceLabel}>Available now</div>
          <div className={styles.balanceValue}>R{balance.available.toLocaleString()}</div>
        </div>
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Paid out (all time)</div>
          <div className={styles.balanceValue}>R{balance.paidOut.toLocaleString()}</div>
        </div>
      </div>

      {/* Items available for payout */}
      {balance.availableSubOrders.length > 0 ? (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Released items awaiting payout</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className={styles.subOrdersList}>
            {balance.availableSubOrders.map((sub) => (
              <label key={sub.subOrderId} className={styles.subOrderRow}>
                <input
                  type="checkbox"
                  checked={selected.has(sub.subOrderId)}
                  onChange={() => toggle(sub.subOrderId)}
                  className={styles.checkbox}
                />
                <div className={styles.subOrderInfo}>
                  <Link to={`/admin/orders/${sub.order}`} className={styles.subOrderNum}>
                    {sub.orderNumber}
                  </Link>
                  <div className={styles.subOrderItems}>
                    {sub.items.map((i) => i.name).join(', ')}
                  </div>
                  <div className={styles.subOrderDate}>
                    Released {new Date(sub.releasedAt).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
                <div className={styles.subOrderAmount}>R{sub.amount.toLocaleString()}</div>
              </label>
            ))}
          </div>

          <div className={styles.payoutForm}>
            <div className={styles.payoutTotal}>
              <span>Total to pay</span>
              <span className={styles.payoutTotalAmount}>R{selectedTotal.toLocaleString()}</span>
            </div>

            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Method</label>
                <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="eft">EFT</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reference number</label>
                <input
                  className="form-input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. bank transaction ref"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (visible to seller)</label>
              <textarea
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional note for the seller's payout email"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handlePay}
              disabled={submitting || selected.size === 0}
            >
              {submitting
                ? <><span className="spinner" />Recording...</>
                : `Mark R${selectedTotal.toLocaleString()} as paid via EFT`
              }
            </button>
            <p className={styles.payoutHint}>
              Complete the EFT in your banking app first, then record it here.
              The seller will get an email confirmation.
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>No released items awaiting payout right now.</div>
      )}

      {/* Payout history */}
      {payouts.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Payout history</h2>
          <div className={styles.historyList}>
            {payouts.map((p) => (
              <div key={p._id} className={styles.historyRow}>
                <div>
                  <div className={styles.historyAmount}>R{p.amount.toLocaleString()}</div>
                  <div className={styles.historyDate}>
                    {new Date(p.paidAt).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                    {p.reference && ` · Ref: ${p.reference}`}
                  </div>
                  {p.notes && <div className={styles.historyNotes}>{p.notes}</div>}
                </div>
                <span className="badge badge-success">{p.method.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutDetail;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDisputes, resolveDispute } from '../../api/escrow';
import styles from './AdminDisputes.module.css';

const TABS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All' },
];

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('open');
  const [resolving, setResolving] = useState(null);
  const [notes, setNotes] = useState({});

  const fetchDisputes = async (status = tab) => {
    setLoading(true);
    try {
      const { data } = await getDisputes(status);
      setDisputes(data.disputes);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDisputes('open'); }, []);

  const handleTab = (status) => {
    setTab(status);
    fetchDisputes(status);
  };

  const handleResolve = async (orderId, subOrderId, resolution) => {
    const label = resolution === 'released_to_seller' ? 'release funds to the seller' : 'refund the buyer';
    if (!window.confirm(`Are you sure you want to ${label}? This cannot be undone.`)) return;

    setResolving(subOrderId);
    try {
      await resolveDispute(orderId, subOrderId, {
        resolution,
        adminNotes: notes[subOrderId] || '',
      });
      fetchDisputes(tab);
    } catch {}
    finally { setResolving(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Disputes</h1>
          <p className={styles.sub}>Review and resolve buyer-reported issues</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.value}
            className={`${styles.tab} ${tab === t.value ? styles.tabActive : ''}`}
            onClick={() => handleTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : disputes.length === 0 ? (
        <div className={styles.empty}>
          {tab === 'open' ? 'No open disputes. 🎉' : 'No disputes found.'}
        </div>
      ) : (
        <div className={styles.list}>
          {disputes.map((d) => (
            <div key={d.subOrderId} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <Link to={`/admin/orders/${d.orderId}`} className={styles.orderLink}>
                    {d.orderNumber}
                  </Link>
                  <span className={styles.dateRaised}>
                    Raised {new Date(d.dispute.raisedAt).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <span className={`badge ${
                  d.dispute.resolution === 'none' ? 'badge-danger' :
                  d.dispute.resolution === 'refunded_to_buyer' ? 'badge-muted' :
                  'badge-success'
                }`}>
                  {d.dispute.resolution === 'none' ? 'Open' :
                    d.dispute.resolution === 'refunded_to_buyer' ? 'Refunded buyer' : 'Released to seller'}
                </span>
              </div>

              <div className={styles.parties}>
                <div className={styles.party}>
                  <div className={styles.partyLabel}>Buyer</div>
                  <div className={styles.partyName}>{d.customer?.name}</div>
                  <div className={styles.partyEmail}>{d.customer?.email}</div>
                </div>
                <div className={styles.party}>
                  <div className={styles.partyLabel}>Seller</div>
                  <div className={styles.partyName}>
                    {d.seller?.sellerProfile?.businessName || d.seller?.name || 'Halfsec (platform)'}
                  </div>
                  {d.seller?.email && <div className={styles.partyEmail}>{d.seller.email}</div>}
                </div>
              </div>

              <div className={styles.items}>
                {d.items.map((item, i) => (
                  <div key={i} className={styles.item}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>R{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className={styles.subtotal}>
                  <span>Disputed amount</span>
                  <span>R{d.subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className={styles.disputeDetails}>
                <div className={styles.reasonRow}>
                  <span className={styles.reasonLabel}>Reason:</span>
                  <span className={styles.reasonValue}>{d.dispute.reason}</span>
                </div>
                <p className={styles.description}>{d.dispute.description}</p>
              </div>

              {d.dispute.resolution === 'none' ? (
                <div className={styles.resolveSection}>
                  <textarea
                    className="form-input"
                    placeholder="Add notes for this resolution (shown to both parties)..."
                    rows={2}
                    value={notes[d.subOrderId] || ''}
                    onChange={(e) => setNotes((p) => ({ ...p, [d.subOrderId]: e.target.value }))}
                    style={{ resize: 'vertical', marginBottom: 10 }}
                  />
                  <div className={styles.resolveActions}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleResolve(d.orderId, d.subOrderId, 'released_to_seller')}
                      disabled={resolving === d.subOrderId}
                    >
                      {resolving === d.subOrderId
                        ? <span className="spinner" style={{ width: 12, height: 12 }} />
                        : 'Release to seller'
                      }
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleResolve(d.orderId, d.subOrderId, 'refunded_to_buyer')}
                      disabled={resolving === d.subOrderId}
                    >
                      Refund buyer
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.resolvedInfo}>
                  Resolved {new Date(d.dispute.resolvedAt).toLocaleDateString('en-ZA', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {d.dispute.adminNotes && (
                    <div className={styles.adminNotes}>{d.dispute.adminNotes}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
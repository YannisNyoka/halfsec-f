import { useState, useEffect } from 'react';
import { getSellerOffers, acceptOffer, declineOffer } from '../../api/offers';
import styles from './SellerOffers.module.css';

const STATUS_COLORS = {
  pending: 'badge-gold',
  accepted: 'badge-success',
  declined: 'badge-danger',
  expired: 'badge-muted',
  withdrawn: 'badge-muted',
};

const timeLeft = (expiresAt) => {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
};

const SellerOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending');
  const [actioning, setActioning] = useState(null);
  const [notes, setNotes] = useState({});

  const fetchOffers = async (status) => {
    setLoading(true);
    try {
      const { data } = await getSellerOffers(status);
      setOffers(data.offers);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOffers('pending'); }, []);

  const handleTab = (status) => {
    setStatusTab(status);
    fetchOffers(status);
  };

  const handleAccept = async (id) => {
    if (!window.confirm('Accept this offer? The buyer will be notified to complete the purchase.')) return;
    setActioning(id);
    try {
      await acceptOffer(id, { sellerNote: notes[id] || '' });
      fetchOffers(statusTab);
    } catch {}
    finally { setActioning(null); }
  };

  const handleDecline = async (id) => {
    setActioning(id);
    try {
      await declineOffer(id, { sellerNote: notes[id] || '' });
      fetchOffers(statusTab);
    } catch {}
    finally { setActioning(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Offers received</h1>
        <p className={styles.sub}>Review and respond to buyer offers</p>
      </div>

      <div className={styles.tabs}>
        {['pending', 'accepted', 'declined', 'all'].map((s) => (
          <button
            key={s}
            className={`${styles.tab} ${statusTab === s ? styles.tabActive : ''}`}
            onClick={() => handleTab(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : offers.length === 0 ? (
        <div className={styles.empty}>
          No {statusTab === 'all' ? '' : statusTab} offers yet.
        </div>
      ) : (
        <div className={styles.list}>
          {offers.map((o) => (
            <div key={o._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.productInfo}>
                  <div className={styles.productImg}>
                    {o.product?.images?.[0]?.url
                      ? <img src={o.product.images[0].url} alt={o.product?.name} />
                      : <div className={styles.imgFallback} />
                    }
                  </div>
                  <div>
                    <div className={styles.productName}>{o.product?.name}</div>
                    <div className={styles.productPrice}>
                      Listed at R{o.originalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={styles.offerInfo}>
                  <div className={styles.offerAmount}>
                    R{o.offerPrice.toLocaleString()}
                  </div>
                  <div className={styles.offerDiscount}>
                    {Math.round(((o.originalPrice - o.offerPrice) / o.originalPrice) * 100)}% below listing
                  </div>
                </div>
              </div>

              <div className={styles.buyerRow}>
                <span className={styles.buyerName}>
                  From: {o.buyer?.name}
                </span>
                <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                {o.status === 'pending' && (
                  <span className={styles.timeLeft}>{timeLeft(o.expiresAt)}</span>
                )}
              </div>

              {o.message && (
                <div className={styles.buyerMessage}>
                  "{o.message}"
                </div>
              )}

              {o.status === 'pending' && (
                <div className={styles.respondSection}>
                  <textarea
                    className="form-input"
                    placeholder="Add a note to the buyer (optional)..."
                    rows={2}
                    value={notes[o._id] || ''}
                    onChange={(e) => setNotes((p) => ({ ...p, [o._id]: e.target.value }))}
                    style={{ resize: 'vertical', marginBottom: 10 }}
                  />
                  <div className={styles.respondActions}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAccept(o._id)}
                      disabled={actioning === o._id}
                    >
                      {actioning === o._id
                        ? <span className="spinner" style={{ width: 12, height: 12 }} />
                        : 'Accept offer'
                      }
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDecline(o._id)}
                      disabled={actioning === o._id}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {o.sellerNote && o.status !== 'pending' && (
                <div className={styles.sellerNote}>
                  Your note: "{o.sellerNote}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOffers;
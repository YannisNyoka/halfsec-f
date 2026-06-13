import { useState, useEffect } from 'react';
import { getAllSellers, approveSeller, rejectSeller, toggleSellerSuspension } from '../../api/seller';
import styles from './AdminSellers.module.css';

const TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
];

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [actioning, setActioning] = useState(null);

  const fetchSellers = async (status = tab) => {
    setLoading(true);
    try {
      const { data } = await getAllSellers(status ? { status } : {});
      setSellers(data.sellers);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSellers('pending'); }, []);

  const handleTab = (status) => {
    setTab(status);
    fetchSellers(status);
  };

  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await approveSeller(id);
      fetchSellers(tab);
    } catch {}
    finally { setActioning(null); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') || '';
    setActioning(id);
    try {
      await rejectSeller(id, reason);
      fetchSellers(tab);
    } catch {}
    finally { setActioning(null); }
  };

  const handleToggle = async (id) => {
    setActioning(id);
    try {
      await toggleSellerSuspension(id);
      fetchSellers(tab);
    } catch {}
    finally { setActioning(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sellers</h1>
          <p className={styles.sub}>Review applications and manage seller accounts</p>
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
      ) : sellers.length === 0 ? (
        <div className={styles.empty}>No sellers found.</div>
      ) : (
        <div className={styles.list}>
          {sellers.map((seller) => (
            <div key={seller._id} className={styles.card}>
              <div className={styles.cardMain}>
                <div className={styles.avatar}>{seller.name?.charAt(0).toUpperCase()}</div>
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <span className={styles.businessName}>{seller.sellerProfile.businessName}</span>
                    <span className={`${styles.statusBadge} ${styles['status_' + seller.sellerProfile.status]}`}>
                      {seller.sellerProfile.status}
                    </span>
                  </div>
                  <div className={styles.meta}>{seller.name} · {seller.email}</div>
                  <div className={styles.meta}>{seller.sellerProfile.phone}</div>
                  {seller.sellerProfile.bio && (
                    <div className={styles.bio}>{seller.sellerProfile.bio}</div>
                  )}
                  <div className={styles.bankInfo}>
                    {seller.sellerProfile.bankDetails?.bankName} ·
                    {' '}{seller.sellerProfile.bankDetails?.accountHolder} ·
                    {' '}****{seller.sellerProfile.bankDetails?.accountNumber?.slice(-4)}
                  </div>
                  {seller.sellerProfile.status === 'rejected' && seller.sellerProfile.rejectionReason && (
                    <div className={styles.rejectionReason}>
                      Rejection reason: {seller.sellerProfile.rejectionReason}
                    </div>
                  )}
                  <div className={styles.date}>
                    Applied {new Date(seller.sellerProfile.appliedAt).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                {seller.sellerProfile.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApprove(seller._id)}
                      disabled={actioning === seller._id}
                    >
                      {actioning === seller._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Approve'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(seller._id)}
                      disabled={actioning === seller._id}
                    >
                      Reject
                    </button>
                  </>
                )}
                {(seller.sellerProfile.status === 'approved' || seller.sellerProfile.status === 'suspended') && (
                  <button
                    className={`btn btn-sm ${seller.sellerProfile.status === 'approved' ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => handleToggle(seller._id)}
                    disabled={actioning === seller._id}
                  >
                    {actioning === seller._id
                      ? <span className="spinner" style={{ width: 12, height: 12 }} />
                      : seller.sellerProfile.status === 'approved' ? 'Suspend' : 'Reinstate'
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSellers;
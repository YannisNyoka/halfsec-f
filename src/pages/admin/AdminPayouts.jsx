import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBalances } from '../../api/payouts';
import styles from './AdminPayouts.module.css';

const AdminPayouts = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBalances()
      .then(({ data }) => setBalances(data.balances))
      .finally(() => setLoading(false));
  }, []);

  const totals = balances.reduce(
    (acc, b) => ({
      held: acc.held + b.held,
      available: acc.available + b.available,
      paidOut: acc.paidOut + b.paidOut,
    }),
    { held: 0, available: 0, paidOut: 0 }
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Payouts</h1>
          <p className={styles.sub}>Seller balances and payout management</p>
        </div>
      </div>

      {/* Platform totals */}
      <div className={styles.totalsGrid}>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Total held in escrow</div>
          <div className={styles.totalValue}>R{totals.held.toLocaleString()}</div>
        </div>
        <div className={`${styles.totalCard} ${styles.totalUrgent}`}>
          <div className={styles.totalLabel}>Owed to sellers (available)</div>
          <div className={styles.totalValue}>R{totals.available.toLocaleString()}</div>
        </div>
        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Total paid out (all time)</div>
          <div className={styles.totalValue}>R{totals.paidOut.toLocaleString()}</div>
        </div>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : balances.length === 0 ? (
        <div className={styles.empty}>No seller sales yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Seller</th>
                <th>In escrow</th>
                <th>Available</th>
                <th>Paid out</th>
                <th>Bank details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.seller._id}>
                  <td>
                    <div className={styles.sellerCell}>
                      <div className={styles.avatar}>{b.seller.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className={styles.sellerName}>{b.seller.businessName || b.seller.name}</div>
                        <div className={styles.sellerEmail}>{b.seller.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.cell}>R{b.held.toLocaleString()}</td>
                  <td className={styles.cell}>
                    <span className={b.available > 0 ? styles.availableAmount : ''}>
                      R{b.available.toLocaleString()}
                    </span>
                  </td>
                  <td className={styles.cell}>R{b.paidOut.toLocaleString()}</td>
                  <td className={styles.cell}>
                    {b.bankDetails?.bankName ? (
                      <span className={styles.bankInfo}>
                        {b.bankDetails.bankName} · ****{b.bankDetails.accountNumber?.slice(-4)}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <Link
                      to={`/admin/payouts/${b.seller._id}`}
                      className={`btn btn-sm ${b.available > 0 ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {b.available > 0 ? 'Pay seller' : 'View details'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
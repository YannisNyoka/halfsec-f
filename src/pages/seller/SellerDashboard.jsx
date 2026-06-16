import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerStats } from '../../api/seller';
import SEO from '../../components/common/SEO';
import styles from './SellerDashboard.module.css';
import { getMyBalance, getMyPayoutHistory } from '../../api/payouts';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
const [payouts, setPayouts] = useState([]);

useEffect(() => {
  getSellerStats().then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  getMyBalance().then(({ data }) => setBalance(data.balance)).catch(() => {});
  getMyPayoutHistory().then(({ data }) => setPayouts(data.payouts.slice(0, 5))).catch(() => {});
}, []);

  useEffect(() => {
    getSellerStats()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  return (
    <div className={styles.page}>
      <SEO title="Seller dashboard" />
      <div className={styles.header}>
        <h1 className={styles.title}>Seller dashboard</h1>
        <p className={styles.sub}>Manage your listings and track your sales</p>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: 'Active listings', value: stats.activeProducts },
          { label: 'Total listings', value: stats.totalProducts },
          { label: 'Out of stock', value: stats.outOfStock },
          { label: 'Items sold', value: stats.totalSold },
          { label: 'Total orders', value: stats.totalOrders },
          { label: 'Total revenue', value: `R${stats.totalRevenue.toLocaleString()}`, gold: true },
        ].map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={`${styles.statValue} ${stat.gold ? styles.statGold : ''}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {balance && (
  <div className={styles.balanceGrid}>
    <div className={`${styles.balanceCard} ${styles.balanceHeld}`}>
      <div className={styles.balanceIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <div>
        <div className={styles.balanceLabel}>In escrow</div>
        <div className={styles.balanceValue}>R{balance.held.toLocaleString()}</div>
        <div className={styles.balanceHint}>Pending delivery confirmation</div>
      </div>
    </div>

    <div className={`${styles.balanceCard} ${styles.balanceAvailable}`}>
      <div className={styles.balanceIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 8v8M12 8v8M8 8v8"/>
        </svg>
      </div>
      <div>
        <div className={styles.balanceLabel}>Available for payout</div>
        <div className={styles.balanceValue}>R{balance.available.toLocaleString()}</div>
        <div className={styles.balanceHint}>
          {balance.available > 0 ? "We'll pay this out via EFT soon" : "Nothing pending right now"}
        </div>
      </div>
    </div>

    <div className={`${styles.balanceCard} ${styles.balancePaid}`}>
      <div className={styles.balanceIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div>
        <div className={styles.balanceLabel}>Total paid out</div>
        <div className={styles.balanceValue}>R{balance.paidOut.toLocaleString()}</div>
        <div className={styles.balanceHint}>All time</div>
      </div>
    </div>
  </div>
)}

{/* Recent payouts */}
{payouts.length > 0 && (
  <div className={styles.card}>
    <h2 className={styles.cardTitle}>Recent payouts</h2>
    <div className={styles.payoutsList}>
      {payouts.map((p) => (
        <div key={p._id} className={styles.payoutRow}>
          <div>
            <div className={styles.payoutAmount}>R{p.amount.toLocaleString()}</div>
            <div className={styles.payoutDate}>
              {new Date(p.paidAt).toLocaleDateString('en-ZA', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
              {p.reference && ` · Ref: ${p.reference}`}
            </div>
          </div>
          <span className="badge badge-success">{p.method.toUpperCase()}</span>
        </div>
      ))}
    </div>
  </div>
)}

      <div className={styles.quickLinks}>
        <Link to="/seller/products/new" className="btn btn-primary">
          + List a new item
        </Link>
        <Link to="/seller/products" className="btn btn-outline">
          Manage my products
        </Link>
        <Link to="/seller/orders" className="btn btn-outline">
          View my sales
        </Link>
      </div>

      <div className={styles.infoCard}>
        <h2 className={styles.infoTitle}>How payouts work</h2>
        <p className={styles.infoText}>
          When a buyer purchases your item, the full payment is held securely by Halfsec.
          Once the order is marked delivered and the buyer confirms receipt
          (or the review window passes), the amount owed to you is added to your payout balance.
          We settle payouts via EFT periodically using the banking details in your profile.
        </p>
      </div>
    </div>
  );
};

export default SellerDashboard;
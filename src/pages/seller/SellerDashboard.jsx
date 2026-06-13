import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerStats } from '../../api/seller';
import SEO from '../../components/common/SEO';
import styles from './SellerDashboard.module.css';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
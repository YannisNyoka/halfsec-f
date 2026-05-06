import { useState, useEffect } from 'react';
import { getAnalytics } from '../../api/analytics';
import styles from './AdminAnalytics.module.css';

const PERIODS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const STATUS_COLORS = {
  pending: '#888',
  confirmed: '#f5a623',
  processing: '#f5a623',
  shipped: '#3b82f6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const formatCurrency = (n) => `R${(n || 0).toLocaleString()}`;
const formatChange = (n) => {
  if (n === 0) return null;
  return { value: Math.abs(n), up: n > 0 };
};

const MiniChart = ({ data, color = '#f5a623' }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const width = 300;
  const height = 60;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.revenue / max) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={styles.miniChart}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const BarChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className={styles.emptyChart}>No data for this period</div>
  );

  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className={styles.barChart}>
      {data.map((day, i) => (
        <div key={i} className={styles.barWrap} title={`${day.date}\nR${day.revenue.toLocaleString()}\n${day.orders} order${day.orders !== 1 ? 's' : ''}`}>
          <div
            className={styles.bar}
            style={{ height: `${Math.max((day.revenue / max) * 100, day.revenue > 0 ? 4 : 0)}%` }}
          />
          {data.length <= 14 && (
            <span className={styles.barLabel}>
              {new Date(day.date).getDate()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getAnalytics(period)
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: 32 }}>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  const { overview, revenueByDay, ordersByStatus, topProducts, recentOrders, ordersByPayment } = data;

  const stats = [
    {
      label: 'Total revenue',
      value: formatCurrency(overview.revenue.current),
      change: formatChange(overview.revenue.change),
      gold: true,
    },
    {
      label: 'Orders',
      value: overview.orders.current,
      change: formatChange(overview.orders.change),
    },
    {
      label: 'New customers',
      value: overview.customers.current,
      change: formatChange(overview.customers.change),
    },
    {
      label: 'Avg order value',
      value: formatCurrency(overview.avgOrderValue),
      change: null,
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.sub}>Store performance overview</p>
        </div>
        <div className={styles.periodTabs}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`${styles.periodTab} ${period === p.value ? styles.periodActive : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={`${styles.statValue} ${stat.gold ? styles.statGold : ''}`}>
              {stat.value}
            </div>
            {stat.change && (
              <div className={`${styles.statChange} ${stat.change.up ? styles.changeUp : styles.changeDown}`}>
                {stat.change.up ? '↑' : '↓'} {stat.change.value}%
                <span className={styles.changePeriod}> vs prev {period}d</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Revenue over time</h2>
          <span className={styles.cardSub}>
            {formatCurrency(overview.revenue.current)} in last {period} days
          </span>
        </div>
        <BarChart data={revenueByDay} />
      </div>

      {/* Two column section */}
      <div className={styles.twoCol}>
        {/* Top products */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Top selling products</h2>
            <span className={styles.cardSub}>By revenue</span>
          </div>
          {topProducts.length === 0 ? (
            <div className={styles.emptyChart}>No sales in this period</div>
          ) : (
            <div className={styles.topProducts}>
              {topProducts.map((product, i) => (
                <div key={product._id} className={styles.topProduct}>
                  <span className={styles.topRank}>#{i + 1}</span>
                  <div className={styles.topImg}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className={styles.topImgFallback} />
                    )}
                  </div>
                  <div className={styles.topInfo}>
                    <span className={styles.topName}>{product.name}</span>
                    <span className={styles.topSold}>{product.totalSold} sold</span>
                  </div>
                  <span className={styles.topRevenue}>
                    {formatCurrency(product.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by status */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Orders by status</h2>
            <span className={styles.cardSub}>{overview.orders.current} total</span>
          </div>
          {ordersByStatus.length === 0 ? (
            <div className={styles.emptyChart}>No orders in this period</div>
          ) : (
            <div className={styles.statusList}>
              {ordersByStatus.map((s) => {
                const pct = Math.round((s.count / overview.orders.current) * 100);
                return (
                  <div key={s._id} className={styles.statusItem}>
                    <div className={styles.statusTop}>
                      <span className={styles.statusName}>
                        <span
                          className={styles.statusDot}
                          style={{ background: STATUS_COLORS[s._id] || '#888' }}
                        />
                        {s._id}
                      </span>
                      <span className={styles.statusCount}>{s.count}</span>
                    </div>
                    <div className={styles.statusBar}>
                      <div
                        className={styles.statusFill}
                        style={{
                          width: `${pct}%`,
                          background: STATUS_COLORS[s._id] || '#888',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment methods */}
          {ordersByPayment.length > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--color-border)', margin: '16px 0' }} />
              <h3 className={styles.subTitle}>Payment methods</h3>
              <div className={styles.paymentList}>
                {ordersByPayment.map((p) => (
                  <div key={p._id} className={styles.paymentItem}>
                    <span className={styles.paymentMethod}>
                      {p._id?.toUpperCase()}
                    </span>
                    <span className={styles.paymentCount}>{p.count} orders</span>
                    <span className={styles.paymentRevenue}>
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Recent orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className={styles.emptyChart}>No orders in this period</div>
        ) : (
          <div className={styles.recentTable}>
            <div className={styles.recentHeader}>
              <span>Order</span>
              <span>Customer</span>
              <span>Status</span>
              <span>Total</span>
              <span>Date</span>
            </div>
            {recentOrders.map((order) => (
              <div key={order._id} className={styles.recentRow}>
                <span className={styles.recentOrderNum}>{order.orderNumber}</span>
                <span className={styles.recentCustomer}>
                  {order.user?.name || 'Unknown'}
                </span>
                <span>
                  <span className={`badge ${
                    order.orderStatus === 'delivered' ? 'badge-success' :
                    order.orderStatus === 'cancelled' ? 'badge-danger' :
                    'badge-gold'
                  }`}>
                    {order.orderStatus}
                  </span>
                </span>
                <span className={styles.recentAmount}>
                  {formatCurrency(order.total)}
                </span>
                <span className={styles.recentDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                    day: 'numeric', month: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminAnalytics;
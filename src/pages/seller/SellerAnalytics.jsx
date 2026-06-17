import { useState, useEffect, useCallback } from 'react';
import {
  getSellerOverview,
  getTopProducts,
  getEscrowBreakdown,
  getOrderStatusBreakdown,
} from '../../api/sellerAnalytics';
import SEO from '../../components/common/SEO';
import styles from './SellerAnalytics.module.css';

const PERIODS = [
  { value: '7d',  label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y',  label: '1 year' },
];

// ── Tiny sparkline SVG chart ─────────────────────────────────────────────────────
const Sparkline = ({ data, color = 'var(--color-gold)', height = 50 }) => {
  if (!data || data.length < 2) return null;
  const values = data.map((d) => d.revenue);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 200;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.sparkline}
      preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Bar chart ─────────────────────────────────────────────────────────────────────
const BarChart = ({ data, valueKey = 'revenue', color = 'var(--color-gold)' }) => {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d[valueKey]);
  const max = Math.max(...values, 1);
  const [tooltip, setTooltip] = useState(null);

  // Group by week for 1y to avoid too many bars
  const display = data.length > 60
    ? data.filter((_, i) => i % 7 === 0)
    : data;

  return (
    <div className={styles.barChart}>
      <div className={styles.bars}>
        {display.map((d, i) => {
          const val = d[valueKey];
          const pct = max > 0 ? (val / max) * 100 : 0;
          return (
            <div
              key={i}
              className={styles.barWrap}
              onMouseEnter={() => setTooltip({ i, d })}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                className={styles.bar}
                style={{ height: `${Math.max(pct, val > 0 ? 2 : 0)}%`, background: color }}
              />
              {tooltip?.i === i && (
                <div className={styles.barTooltip}>
                  <div className={styles.tooltipDate}>
                    {new Date(d.date).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short',
                    })}
                  </div>
                  <div className={styles.tooltipValue}>
                    {valueKey === 'revenue'
                      ? `R${val.toLocaleString()}`
                      : val
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.barAxisLabels}>
        {display.length > 0 && (
          <>
            <span>{new Date(display[0].date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
            <span>{new Date(display[Math.floor(display.length / 2)].date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
            <span>{new Date(display[display.length - 1].date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
          </>
        )}
      </div>
    </div>
  );
};

// ── Donut chart ───────────────────────────────────────────────────────────────────
const DonutChart = ({ segments }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return (
    <div className={styles.donutEmpty}>No data yet</div>
  );

  let cumulative = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 160 160" className={styles.donut}>
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const offset = circumference * (1 - cumulative);
          const dash = circumference * pct;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx="80" cy="80" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" className={styles.donutCenter}>
          {total}
        </text>
        <text x="80" y="92" textAnchor="middle" className={styles.donutSub}>
          total
        </text>
      </svg>
      <div className={styles.donutLegend}>
        {segments.map((seg, i) => (
          <div key={i} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: seg.color }} />
            <div>
              <div className={styles.legendLabel}>{seg.label}</div>
              <div className={styles.legendValue}>
                R{seg.value.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Change badge ──────────────────────────────────────────────────────────────────
const ChangeBadge = ({ value }) => {
  if (value === 0) return null;
  const up = value > 0;
  return (
    <span className={`${styles.changeBadge} ${up ? styles.changeUp : styles.changeDown}`}>
      {up ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// Main page
// ════════════════════════════════════════════════════════════════════════════════
const SellerAnalytics = () => {
  const [period, setPeriod] = useState('30d');
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [escrow, setEscrow] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState('revenue');

  const fetchAll = useCallback(async (p) => {
    setLoading(true);
    try {
      const [overviewRes, topRes, escrowRes, statusRes] = await Promise.all([
        getSellerOverview(p),
        getTopProducts(p),
        getEscrowBreakdown(),
        getOrderStatusBreakdown(p),
      ]);
      setOverview(overviewRes.data);
      setTopProducts(topRes.data.topProducts);
      setEscrow(escrowRes.data);
      setOrderStatuses(statusRes.data.orderStatuses);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(period); }, [period]);

  const handlePeriod = (p) => {
    setPeriod(p);
  };

  const escrowSegments = escrow ? [
    { label: 'Held', value: escrow.amounts.held, color: 'var(--color-gold)' },
    { label: 'Released', value: escrow.amounts.released, color: 'var(--color-success)' },
    { label: 'Paid out', value: escrow.amounts.refunded, color: 'var(--color-muted)' },
    { label: 'Disputed', value: escrow.amounts.disputed, color: 'var(--color-danger)' },
  ].filter((s) => s.value > 0) : [];

  const maxOrderStatus = orderStatuses
    ? Math.max(...Object.values(orderStatuses), 1)
    : 1;

  const STATUS_COLORS = {
    pending: 'var(--color-muted)',
    confirmed: '#3b82f6',
    processing: 'var(--color-gold)',
    shipped: '#8b5cf6',
    delivered: 'var(--color-success)',
    cancelled: 'var(--color-danger)',
  };

  return (
    <div className={styles.page}>
      <SEO title="Seller analytics" />

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.sub}>Track your sales performance over time</p>
        </div>
        <div className={styles.periodSelector}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`${styles.periodBtn} ${period === p.value ? styles.periodActive : ''}`}
              onClick={() => handlePeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : (
        <>
          {/* ── Summary stat cards ── */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Revenue</span>
                <ChangeBadge value={overview?.summary.revenueChange} />
              </div>
              <div className={styles.statValue}>
                R{(overview?.summary.revenue || 0).toLocaleString()}
              </div>
              <Sparkline data={overview?.revenueChart} />
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Orders</span>
                <ChangeBadge value={overview?.summary.ordersChange} />
              </div>
              <div className={styles.statValue}>
                {overview?.summary.orders || 0}
              </div>
              <Sparkline
                data={overview?.revenueChart.map((d) => ({ ...d, revenue: d.orders }))}
                color="#3b82f6"
              />
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Items sold</span>
              </div>
              <div className={styles.statValue}>
                {overview?.summary.items || 0}
              </div>
              <Sparkline
                data={overview?.revenueChart.map((d) => ({ ...d, revenue: d.items }))}
                color="var(--color-success)"
              />
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Avg order value</span>
              </div>
              <div className={styles.statValue}>
                R{(overview?.summary.avgOrderValue || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* ── Revenue / Orders chart ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Performance over time</h2>
              <div className={styles.chartTabs}>
                {['revenue', 'orders', 'items'].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.chartTab} ${chartTab === tab ? styles.chartTabActive : ''}`}
                    onClick={() => setChartTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {overview?.revenueChart && overview.revenueChart.length > 0 ? (
              <BarChart
                data={overview.revenueChart}
                valueKey={chartTab}
                color={
                  chartTab === 'revenue' ? 'var(--color-gold)' :
                  chartTab === 'orders' ? '#3b82f6' :
                  'var(--color-success)'
                }
              />
            ) : (
              <div className={styles.noData}>No data for this period.</div>
            )}
          </div>

          <div className={styles.twoCol}>
            {/* ── Top products ── */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Top selling items</h2>
              {topProducts.length === 0 ? (
                <div className={styles.noData}>No sales in this period.</div>
              ) : (
                <div className={styles.topProductsList}>
                  {topProducts.map((p, i) => {
                    const maxRev = topProducts[0]?.revenue || 1;
                    const pct = (p.revenue / maxRev) * 100;
                    return (
                      <div key={p.productId || i} className={styles.topProduct}>
                        <div className={styles.topProductRank}>{i + 1}</div>
                        <div className={styles.topProductImg}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} />
                          ) : (
                            <div className={styles.imgFallback} />
                          )}
                        </div>
                        <div className={styles.topProductInfo}>
                          <div className={styles.topProductName}>{p.name}</div>
                          <div className={styles.topProductBar}>
                            <div
                              className={styles.topProductBarFill}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className={styles.topProductStats}>
                            <span>{p.unitsSold} sold</span>
                            <span>R{p.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Escrow breakdown ── */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Funds breakdown</h2>
              <DonutChart segments={escrowSegments} />
            </div>
          </div>

          {/* ── Order status breakdown ── */}
          {orderStatuses && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Order statuses this period</h2>
              <div className={styles.statusGrid}>
                {Object.entries(orderStatuses).map(([status, count]) => (
                  <div key={status} className={styles.statusItem}>
                    <div className={styles.statusBarWrap}>
                      <div
                        className={styles.statusBar}
                        style={{
                          height: `${(count / maxOrderStatus) * 100}%`,
                          background: STATUS_COLORS[status] || 'var(--color-muted)',
                          minHeight: count > 0 ? 4 : 0,
                        }}
                      />
                    </div>
                    <div className={styles.statusCount}>{count}</div>
                    <div className={styles.statusLabel}>{status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellerAnalytics;
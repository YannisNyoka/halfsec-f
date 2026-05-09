import styles from './OrderTimeline.module.css';

const STATUS_ICONS = {
  pending: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  confirmed: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  processing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  shipped: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  delivered: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  cancelled: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
};

const STATUS_COLORS = {
  pending: styles.colorPending,
  confirmed: styles.colorConfirmed,
  processing: styles.colorProcessing,
  shipped: styles.colorShipped,
  delivered: styles.colorDelivered,
  cancelled: styles.colorCancelled,
};

const OrderTimeline = ({ timeline = [], currentStatus, trackingNumber, courierName, estimatedDelivery }) => {
  if (!timeline || timeline.length === 0) return null;

  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>Order timeline</h3>

      {/* Tracking info */}
      {(trackingNumber || courierName || estimatedDelivery) && (
        <div className={styles.trackingCard}>
          {courierName && (
            <div className={styles.trackingItem}>
              <span className={styles.trackingLabel}>Courier</span>
              <span className={styles.trackingValue}>{courierName}</span>
            </div>
          )}
          {trackingNumber && (
            <div className={styles.trackingItem}>
              <span className={styles.trackingLabel}>Tracking number</span>
              <span className={`${styles.trackingValue} ${styles.trackingCode}`}>
                {trackingNumber}
              </span>
            </div>
          )}
          {estimatedDelivery && (
            <div className={styles.trackingItem}>
              <span className={styles.trackingLabel}>Estimated delivery</span>
              <span className={styles.trackingValue}>
                {new Date(estimatedDelivery).toLocaleDateString('en-ZA', {
                  weekday: 'long', day: 'numeric',
                  month: 'long', year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className={styles.timeline}>
        {[...timeline].reverse().map((entry, i) => {
          const isLatest = i === 0;
          const colorClass = STATUS_COLORS[entry.status] || styles.colorPending;

          return (
            <div
              key={i}
              className={`${styles.entry} ${isLatest ? styles.entryLatest : ''}`}
            >
              {/* Line connector */}
              {i < timeline.length - 1 && (
                <div className={styles.connector} />
              )}

              {/* Icon */}
              <div className={`${styles.icon} ${colorClass} ${isLatest ? styles.iconLatest : ''}`}>
                {STATUS_ICONS[entry.status] || STATUS_ICONS.pending}
              </div>

              {/* Content */}
              <div className={styles.content}>
                <div className={styles.statusRow}>
                  <span className={`${styles.statusLabel} ${colorClass}`}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </span>
                  <span className={styles.timestamp}>
                    {new Date(entry.timestamp).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {entry.message && (
                  <p className={styles.message}>{entry.message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
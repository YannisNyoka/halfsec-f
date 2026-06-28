import styles from './TrackingInfo.module.css';

// Courier tracking URL builders — opens the courier's tracking page
const COURIER_URLS = {
  'The Courier Guy': (n) => `https://www.thecourierguy.co.za/track/?waybill=${n}`,
  'Pudo': (n) => `https://pudo.co.za/track?waybill=${n}`,
  'Pargo': (n) => `https://pargo.co.za/track?reference=${n}`,
  'Aramex / Fastway': (n) => `https://www.aramex.co.za/tools/track?l=${n}`,
  'DHL': (n) => `https://www.dhl.com/za-en/home/tracking.html?tracking-id=${n}`,
  'PostNet': (n) => `https://www.postnet.co.za/track?waybill=${n}`,
  'Dawn Wing': (n) => `https://www.dawnwing.co.za/tracking?waybill=${n}`,
};

const TrackingInfo = ({ order }) => {
  if (!order.trackingNumber) return null;

  const trackingUrl = order.courierName && COURIER_URLS[order.courierName]
    ? COURIER_URLS[order.courierName](order.trackingNumber)
    : null;

  const estDelivery = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-ZA', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="15" height="13" rx="2"/>
            <path d="M16 8h4l3 3v5h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <div>
          <div className={styles.title}>Your order is on its way!</div>
          {order.courierName && (
            <div className={styles.courier}>Shipped via {order.courierName}</div>
          )}
        </div>
        <span className="badge badge-success">Shipped</span>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Tracking number</span>
          <span className={styles.trackingNum}>{order.trackingNumber}</span>
        </div>
        {estDelivery && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Estimated delivery</span>
            <span className={styles.detailValue}>{estDelivery}</span>
          </div>
        )}
      </div>

      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.trackBtn}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Track on {order.courierName} website
        </a>
      )}
    </div>
  );
};

export default TrackingInfo;
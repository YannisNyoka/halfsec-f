import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../../api/notifications';
import { useNotifications } from '../../context/NotificationContext.jsx';
import SEO from '../../components/common/SEO';
import styles from './NotificationsPage.module.css';

const TYPE_ICONS = {
  order_placed: '🛍️',
  order_confirmed: '✅',
  order_processing: '📦',
  order_shipped: '🚚',
  order_delivered: '🎉',
  order_cancelled: '❌',
  escrow_released: '💰',
  escrow_disputed: '⚠️',
  dispute_resolved: '⚖️',
  payout_processed: '🏦',
  seller_approved: '🎊',
  seller_rejected: '📋',
  new_order_seller: '🛒',
  review_reminder: '⭐',
  low_stock: '📉',
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { setUnreadCount, refresh } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchNotifications = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getMyNotifications({ page: p, limit: 20 });
      setNotifications(data.notifications);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(1); }, []);

  const handleClick = async (n) => {
    if (!n.read) {
      await markAsRead(n._id);
      setNotifications((prev) =>
        prev.map((x) => x._id === n._id ? { ...x, read: true } : x)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    refresh();
  };

  const handleClearRead = async () => {
    await clearReadNotifications();
    setNotifications((prev) => prev.filter((n) => !n.read));
    refresh();
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className={styles.page}>
      <SEO title="Notifications" />
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.sub}>
              {pagination.total || 0} total
              {unread > 0 && ` · ${unread} unread`}
            </p>
          </div>
          <div className={styles.headerActions}>
            {unread > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handleMarkAll}>
                Mark all read
              </button>
            )}
            {notifications.some((n) => n.read) && (
              <button className="btn btn-ghost btn-sm" onClick={handleClearRead}>
                Clear read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="page-loader">
            <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <h2>All caught up!</h2>
            <p>No notifications yet. Activity on your orders and listings will show up here.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
                onClick={() => handleClick(n)}
              >
                <div className={styles.itemIcon}>
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>
                <div className={styles.itemContent}>
                  <div className={styles.itemTitle}>{n.title}</div>
                  <div className={styles.itemMessage}>{n.message}</div>
                  <div className={styles.itemTime}>{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read && <div className={styles.unreadDot} />}
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, n._id)}
                  aria-label="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => { setPage((p) => p - 1); fetchNotifications(page - 1); }}
            >
              ← Prev
            </button>
            <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= pagination.pages}
              onClick={() => { setPage((p) => p + 1); fetchNotifications(page + 1); }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
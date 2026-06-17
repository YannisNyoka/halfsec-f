import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext.jsx';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../../api/notifications';
import styles from './NotificationBell.module.css';

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
  return new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
};

const NotificationBell = () => {
  const { unreadCount, setUnreadCount, refresh } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getMyNotifications({ page: p, limit: 15 });
      if (p === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }
      setHasMore(p < data.pagination.pages);
      setUnreadCount(data.unreadCount);
    } catch {}
    finally { setLoading(false); }
  }, [setUnreadCount]);

  // Open dropdown
  const handleOpen = () => {
    setOpen((o) => {
      if (!o) { setPage(1); fetchNotifications(1); }
      return !o;
    });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((n) => n._id === notification._id ? { ...n, read: true } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
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
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNotifications(next);
  };

  return (
    <div className={styles.wrap} ref={dropdownRef}>
      <button
        className={styles.bell}
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>
              Notifications
              {unreadCount > 0 && (
                <span className={styles.unreadPill}>{unreadCount} new</span>
              )}
            </span>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button className={styles.headerBtn} onClick={handleMarkAll}>
                  Mark all read
                </button>
              )}
              {notifications.some((n) => n.read) && (
                <button className={styles.headerBtn} onClick={handleClearRead}>
                  Clear read
                </button>
              )}
            </div>
          </div>

          <div className={styles.list}>
            {loading && notifications.length === 0 ? (
              <div className={styles.loading}>
                <div className="spinner" style={{ width: 24, height: 24, borderTopColor: 'var(--color-gold)' }} />
              </div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
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
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, n._id)}
                    aria-label="Delete notification"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  {!n.read && <div className={styles.unreadDot} />}
                </div>
              ))
            )}

            {hasMore && (
              <button className={styles.loadMore} onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
          <div className={styles.dropdownFooter}>
  <button
    className={styles.viewAllBtn}
    onClick={() => { setOpen(false); navigate('/notifications'); }}
  >
    View all notifications
  </button>
</div>
        </div>
      )}
    </div>
    
  );
};

export default NotificationBell;
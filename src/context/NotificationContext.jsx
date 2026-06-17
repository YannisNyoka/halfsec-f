import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUnreadCount } from '../api/notifications';
import useAuth from '../hooks/useAuth';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.count);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    refresh();
    intervalRef.current = setInterval(refresh, 30000);
    return () => clearInterval(intervalRef.current);
  }, [isAuthenticated, refresh]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};
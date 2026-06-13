import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getMyApplicationStatus } from '../../api/seller';
import { useTheme } from '../../context/ThemeContext.jsx';
import styles from './SellerLayout.module.css';

const NAV_ITEMS = [
  { to: '/seller', label: 'Dashboard', end: true, icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { to: '/seller/products', label: 'My products', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
    </svg>
  )},
  { to: '/seller/orders', label: 'Sales', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
    </svg>
  )},
  { to: '/seller/profile', label: 'Profile', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
];

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const SellerLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    getMyApplicationStatus()
      .then(({ data }) => {
        if (data.sellerProfile?.status === 'approved') {
          setApproved(true);
        } else {
          navigate('/sell', { replace: true });
        }
      })
      .catch(() => navigate('/sell', { replace: true }))
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (checking) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  if (!approved) return null;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          half<span>sec</span>
          <span className={styles.sellerTag}>Seller</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navActive : ''}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>Seller</div>
            </div>
          </div>

          <button onClick={toggleTheme} className={styles.themeToggle}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
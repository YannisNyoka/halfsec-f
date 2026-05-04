import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import styles from './Navbar.module.css';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const Navbar = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          half<span>sec</span>
        </Link>

        <div className={styles.links}>
          <Link to="/shop" className={styles.link}>Shop</Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className={styles.cartLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Cart
                {itemCount > 0 && (
                  <span className={styles.cartBadge}>{itemCount}</span>
                )}
              </Link>
             <Link to="/orders" className={styles.link}>Orders</Link>
    <Link to="/profile" className={styles.link}>
      <span className={styles.profileAvatar}>
        {user?.name?.charAt(0).toUpperCase()}
      </span>
    </Link>
    {isAdmin && (
      <Link to="/admin" className={styles.adminLink}>Admin</Link>
    )}
    <button onClick={handleLogout} className={styles.logoutBtn}>
      Logout
    </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>Login</Link>
              <Link to="/register" className={`btn btn-primary ${styles.registerBtn}`}>
                Register
              </Link>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={styles.themeBtn}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
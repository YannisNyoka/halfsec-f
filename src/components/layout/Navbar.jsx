import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import SearchBar from '../common/SearchBar';
import styles from './Navbar.module.css';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2">
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
    stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const Navbar = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`;

  return (
    <>
      <nav className={styles.nav}>
        <div className={`container ${styles.inner}`}>

          {/* Logo */}
          <Link to="/" className={styles.logo}>
            half<span>sec</span>
          </Link>

          {/* Desktop search */}
          <div className={styles.desktopSearch}>
            <SearchBar placeholder="Search products..." />
          </div>

          {/* Desktop links */}
          <div className={styles.desktopLinks}>
            <Link to="/shop" className={styles.link}>Shop</Link>

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className={styles.iconLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  {itemCount > 0 && (
                    <span className={styles.badge}>{itemCount}</span>
                  )}
                </Link>

                {/* Wishlist */}
                <Link to="/wishlist" className={styles.iconLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                  {wishlistCount > 0 && (
                    <span className={`${styles.badge} ${styles.badgeHeart}`}>
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Profile avatar */}
                <Link to="/profile" className={styles.avatar}>
                  {user?.name?.charAt(0).toUpperCase()}
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
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={styles.themeBtn}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Mobile right side */}
          <div className={styles.mobileRight}>
            {isAuthenticated && (
              <Link to="/cart" className={styles.iconLink}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span className={styles.badge}>{itemCount}</span>
                )}
              </Link>
            )}

            {/* Hamburger */}
            <button
              className={`${styles.hamburger} ${drawerOpen ? styles.hamburgerOpen : ''}`}
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${drawerOpen ? styles.overlayVisible : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!drawerOpen}
      >
        {/* Drawer header */}
        <div className={styles.drawerHeader}>
          <Link to="/" className={styles.drawerLogo}>
            half<span>sec</span>
          </Link>
          <button
            className={styles.closeBtn}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Mobile search */}
        <div className={styles.drawerSearch}>
          <SearchBar placeholder="Search products..." />
        </div>

        {/* User info (if logged in) */}
        {isAuthenticated && (
          <div className={styles.drawerUser}>
            <div className={styles.drawerAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.drawerUserName}>{user?.name}</div>
              <div className={styles.drawerUserEmail}>{user?.email}</div>
            </div>
          </div>
        )}

        <div className={styles.drawerDivider} />

        {/* Nav links */}
        <nav className={styles.drawerNav}>
          <NavLink to="/shop" className={navLinkClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Shop
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/cart" className={navLinkClass}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Cart
                {itemCount > 0 && (
                  <span className={styles.drawerBadge}>{itemCount}</span>
                )}
              </NavLink>

              <NavLink to="/wishlist" className={navLinkClass}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                Wishlist
                {wishlistCount > 0 && (
                  <span className={styles.drawerBadge}>{wishlistCount}</span>
                )}
              </NavLink>

              <NavLink to="/orders" className={navLinkClass}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                </svg>
                My orders
              </NavLink>

              <NavLink to="/profile" className={navLinkClass}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                My profile
              </NavLink>

              {isAdmin && (
                <>
                  <div className={styles.drawerDivider} />
                  <NavLink to="/admin" className={navLinkClass}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Admin dashboard
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Create account
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.drawerDivider} />

        {/* Drawer footer */}
        <div className={styles.drawerFooter}>
          {/* Theme toggle */}
          <button
            className={styles.drawerThemeBtn}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

          {isAuthenticated && (
            <button
              className={styles.drawerLogoutBtn}
              onClick={handleLogout}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
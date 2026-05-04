import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { updateProfile, changePassword } from '../../api/profile';
import SEO from '../../components/common/SEO';
import styles from './ProfilePage.module.css';

const SA_PROVINCES = [
  'Eastern Cape','Free State','Gauteng','KwaZulu-Natal',
  'Limpopo','Mpumalanga','Northern Cape','North West','Western Cape',
];

const ProfilePage = () => {
  const { user, checkAuth } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    province: user?.address?.province || '',
    postalCode: user?.address?.postalCode || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileChange = (e) => {
    setProfileForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setProfileError('');
    setProfileSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileError('Name is required.');
      return;
    }
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          province: profileForm.province,
          postalCode: profileForm.postalCode,
          country: 'South Africa',
        },
      });
      await checkAuth(); // refresh user in context
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one number.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <SEO title="My profile" url="https://halfsec.co.za/profile" />
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className={styles.name}>{user?.name}</h1>
            <p className={styles.email}>{user?.email}</p>
            <span className={`badge ${user?.role === 'admin' ? 'badge-gold' : 'badge-muted'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div className={styles.quickLinks}>
          <Link to="/orders" className={styles.quickLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <span>My orders</span>
          </Link>
          <Link to="/cart" className={styles.quickLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span>My cart</span>
          </Link>
          <Link to="/shop" className={styles.quickLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Browse shop</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Personal info
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'address' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('address')}
          >
            Delivery address
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'password' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change password
          </button>
        </div>

        <div className={styles.content}>
          {/* ── Personal info tab ── */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className={styles.form}>
              <h2 className={styles.formTitle}>Personal information</h2>

              {profileError && <div className="alert alert-error">{profileError}</div>}
              {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

              <div className={styles.formGrid}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Full name</label>
                  <input
                    name="name"
                    className="form-input"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email address</label>
                  <input
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <span className="form-hint">Email cannot be changed.</span>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Phone number</label>
                  <input
                    name="phone"
                    className="form-input"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="082 123 4567"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={profileLoading}
                >
                  {profileLoading
                    ? <><span className="spinner" />Saving...</>
                    : 'Save changes'
                  }
                </button>
              </div>
            </form>
          )}

          {/* ── Delivery address tab ── */}
          {activeTab === 'address' && (
            <form onSubmit={handleProfileSubmit} className={styles.form}>
              <h2 className={styles.formTitle}>Delivery address</h2>
              <p className={styles.formSub}>
                This address will be pre-filled at checkout.
              </p>

              {profileError && <div className="alert alert-error">{profileError}</div>}
              {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

              <div className={styles.formGrid}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Street address</label>
                  <input
                    name="street"
                    className="form-input"
                    value={profileForm.street}
                    onChange={handleProfileChange}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    name="city"
                    className="form-input"
                    value={profileForm.city}
                    onChange={handleProfileChange}
                    placeholder="Johannesburg"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Province</label>
                  <select
                    name="province"
                    className="form-select"
                    value={profileForm.province}
                    onChange={handleProfileChange}
                  >
                    <option value="">Select province</option>
                    {SA_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Postal code</label>
                  <input
                    name="postalCode"
                    className="form-input"
                    value={profileForm.postalCode}
                    onChange={handleProfileChange}
                    placeholder="2000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    className="form-input"
                    value="South Africa"
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={profileLoading}
                >
                  {profileLoading
                    ? <><span className="spinner" />Saving...</>
                    : 'Save address'
                  }
                </button>
              </div>
            </form>
          )}

          {/* ── Password tab ── */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className={styles.form}>
              <h2 className={styles.formTitle}>Change password</h2>
              <p className={styles.formSub}>
                Use a strong password with at least 8 characters,
                one uppercase letter and one number.
              </p>

              {passwordError && <div className="alert alert-error">{passwordError}</div>}
              {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

              <div className={styles.formGrid}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Current password</label>
                  <input
                    name="currentPassword"
                    type="password"
                    className="form-input"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New password</label>
                  <input
                    name="newPassword"
                    type="password"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Min 8 chars"
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm new password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Password strength indicator */}
              {passwordForm.newPassword && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBar}>
                    {[
                      passwordForm.newPassword.length >= 8,
                      /[A-Z]/.test(passwordForm.newPassword),
                      /[0-9]/.test(passwordForm.newPassword),
                      /[^A-Za-z0-9]/.test(passwordForm.newPassword),
                    ].map((met, i) => (
                      <div
                        key={i}
                        className={`${styles.strengthSegment} ${met ? styles.strengthMet : ''}`}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthLabel}>
                    {(() => {
                      const score = [
                        passwordForm.newPassword.length >= 8,
                        /[A-Z]/.test(passwordForm.newPassword),
                        /[0-9]/.test(passwordForm.newPassword),
                        /[^A-Za-z0-9]/.test(passwordForm.newPassword),
                      ].filter(Boolean).length;
                      if (score <= 1) return 'Weak';
                      if (score === 2) return 'Fair';
                      if (score === 3) return 'Good';
                      return 'Strong';
                    })()}
                  </span>
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? <><span className="spinner" />Changing...</>
                    : 'Change password'
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
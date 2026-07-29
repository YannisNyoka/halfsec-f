import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { resetPassword } from '../../api/auth';
import styles from './AuthPage.module.css';
import SEO from '@/components/common/SEO';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await resetPassword(token, form.newPassword);
      await checkAuth();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset password"
        description="Choose a new password for your Halfsec account."
        url="https://halfsec.co.za/reset-password"
      />
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Link to="/" className={styles.brand}>half<span>sec</span></Link>
            <h1 className={styles.title}>Choose a new password</h1>
            <p className={styles.subtitle}>Make it something you'll remember this time.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
              {error.includes('invalid') || error.includes('expired') ? (
                <>
                  {' '}
                  <Link to="/forgot-password" className={styles.footerLink}>Request a new link</Link>
                </>
              ) : null}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                className="form-input"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-input"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? <><span className="spinner" />Resetting...</> : 'Reset password'}
            </button>
          </form>

          <p className={styles.footer}>
            Remembered your password?{' '}
            <Link to="/login" className={styles.footerLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;

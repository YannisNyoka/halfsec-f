import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import styles from './AuthPage.module.css';
import SEO from '@/components/common/SEO';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      // Always show the same success state — never reveal whether the email exists.
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Forgot password"
        description="Reset your Halfsec account password."
        url="https://halfsec.co.za/forgot-password"
      />
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Link to="/" className={styles.brand}>half<span>sec</span></Link>
            <h1 className={styles.title}>Forgot your password?</h1>
            <p className={styles.subtitle}>
              {submitted
                ? 'Check your inbox for a link to reset it.'
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {submitted ? (
            <div className="alert alert-success">
              If an account exists for that email, we've sent a password reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? <><span className="spinner" />Sending...</> : 'Send reset link'}
              </button>
            </form>
          )}

          <p className={styles.footer}>
            Remembered your password?{' '}
            <Link to="/login" className={styles.footerLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { applyAsSeller, getMyApplicationStatus } from '../../api/seller';
import SEO from '../../components/common/SEO';
import styles from './BecomeSellerPage.module.css';

const BANKS = [
  'ABSA', 'Capitec', 'FNB', 'Nedbank', 'Standard Bank',
  'TymeBank', 'Discovery Bank', 'Bidvest Bank', 'Other',
];

const BecomeSellerPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    bio: '',
    phone: '',
    bankDetails: {
      accountHolder: '',
      bankName: '',
      accountNumber: '',
      branchCode: '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/sell' } } });
      return;
    }
    getMyApplicationStatus()
      .then(({ data }) => setStatus(data.sellerProfile))
      .catch(() => setStatus({ status: 'none' }))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bank.')) {
      const key = name.split('.')[1];
      setForm((p) => ({ ...p, bankDetails: { ...p.bankDetails, [key]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.phone.trim()) {
      setError('Business name and phone are required.');
      return;
    }
    const { accountHolder, bankName, accountNumber, branchCode } = form.bankDetails;
    if (!accountHolder || !bankName || !accountNumber || !branchCode) {
      setError('Complete banking details are required for payouts.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await applyAsSeller(form);
      setStatus({ status: 'pending' });
      setSuccess('Application submitted! We\'ll review it within 1-2 business days.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  return (
    <div className={styles.page}>
      <SEO title="Sell on Halfsec" url="https://halfsec.co.za/sell" />
      <div className="container">

        {/* Already approved */}
        {status?.status === 'approved' && (
          <div className={styles.statusCard}>
            <div className={styles.statusIcon} style={{ color: 'var(--color-success)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>You're an approved seller!</h2>
            <p>Head to your seller dashboard to list products and view your sales.</p>
            <Link to="/seller" className="btn btn-primary btn-lg">
              Go to seller dashboard →
            </Link>
          </div>
        )}

        {/* Pending */}
        {status?.status === 'pending' && (
          <div className={styles.statusCard}>
            <div className={styles.statusIcon} style={{ color: 'var(--color-gold)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h2>Application under review</h2>
            <p>
              We've received your application and are reviewing it.
              You'll get an email once it's approved — usually within 1-2 business days.
            </p>
          </div>
        )}

        {/* Suspended */}
        {status?.status === 'suspended' && (
          <div className={styles.statusCard}>
            <div className={styles.statusIcon} style={{ color: 'var(--color-danger)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <h2>Your seller account is suspended</h2>
            <p>
              Please contact us at{' '}
              <a href="mailto:hello@halfsec.co.za">hello@halfsec.co.za</a> for more information.
            </p>
          </div>
        )}

        {/* Application form — show for 'none' and 'rejected' */}
        {(status?.status === 'none' || status?.status === 'rejected') && (
          <>
            <div className={styles.header}>
              <h1 className={styles.title}>Sell on Halfsec</h1>
              <p className={styles.sub}>
                Join our community of sellers and reach thousands of buyers looking for
                quality second-hand items. Just fill in your details below to apply.
                {' '}<Link to="/how-it-works">See how selling works →</Link>
              </p>
            </div>

            {status?.status === 'rejected' && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                Your previous application was not approved
                {status.rejectionReason ? `: ${status.rejectionReason}` : '.'}
                {' '}You're welcome to apply again with updated information.
              </div>
            )}

            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About your business</h2>
                <div className={styles.formGrid}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Business / shop name *</label>
                    <input
                      name="businessName"
                      className="form-input"
                      value={form.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Vintage Finds JHB"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone number *</label>
                    <input
                      name="phone"
                      className="form-input"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="082 123 4567"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      About you / what you sell{' '}
                      <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <textarea
                      name="bio"
                      className="form-input"
                      value={form.bio}
                      onChange={handleChange}
                      rows={3}
                      maxLength={500}
                      placeholder="Tell buyers a bit about yourself and what kind of items you sell..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Banking details</h2>
                <p className={styles.sectionSub}>
                  We'll use these details to pay you for your sales. Kept private and secure.
                </p>
                <div className={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label">Account holder name *</label>
                    <input
                      name="bank.accountHolder"
                      className="form-input"
                      value={form.bankDetails.accountHolder}
                      onChange={handleChange}
                      placeholder="As it appears on your bank account"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bank *</label>
                    <select
                      name="bank.bankName"
                      className="form-select"
                      value={form.bankDetails.bankName}
                      onChange={handleChange}
                    >
                      <option value="">Select bank</option>
                      {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account number *</label>
                    <input
                      name="bank.accountNumber"
                      className="form-input"
                      value={form.bankDetails.accountNumber}
                      onChange={handleChange}
                      placeholder="1234567890"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Branch code *</label>
                    <input
                      name="bank.branchCode"
                      className="form-input"
                      value={form.bankDetails.branchCode}
                      onChange={handleChange}
                      placeholder="250655"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </section>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={submitting}
              >
                {submitting
                  ? <><span className="spinner" />Submitting...</>
                  : 'Submit application'
                }
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BecomeSellerPage;
import { useState, useEffect } from 'react';
import { getMyApplicationStatus, updateSellerProfile } from '../../api/seller';
import styles from './SellerProfile.module.css';

const BANKS = ['ABSA', 'Capitec', 'FNB', 'Nedbank', 'Standard Bank', 'TymeBank', 'Discovery Bank', 'Bidvest Bank', 'Other'];

const SellerProfile = () => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getMyApplicationStatus().then(({ data }) => {
      const p = data.sellerProfile;
      setForm({
        businessName: p.businessName || '',
        bio: p.bio || '',
        phone: p.phone || '',
        bankDetails: {
          accountHolder: p.bankDetails?.accountHolder || '',
          bankName: p.bankDetails?.bankName || '',
          accountNumber: p.bankDetails?.accountNumber || '',
          branchCode: p.bankDetails?.branchCode || '',
        },
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bank.')) {
      const key = name.split('.')[1];
      setForm((p) => ({ ...p, bankDetails: { ...p.bankDetails, [key]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
    setSuccess(''); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(''); setSuccess('');
    try {
      await updateSellerProfile(form);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Seller profile</h1>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Business info</h2>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Business name</label>
              <input name="businessName" className="form-input" value={form.businessName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input name="phone" className="form-input" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Bio</label>
              <textarea name="bio" className="form-input" value={form.bio} onChange={handleChange}
                rows={3} maxLength={500} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Banking details</h2>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Account holder</label>
              <input name="bank.accountHolder" className="form-input" value={form.bankDetails.accountHolder} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Bank</label>
              <select name="bank.bankName" className="form-select" value={form.bankDetails.bankName} onChange={handleChange}>
                <option value="">Select bank</option>
                {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Account number</label>
              <input name="bank.accountNumber" className="form-input" value={form.bankDetails.accountNumber} onChange={handleChange} style={{ fontFamily: 'monospace' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Branch code</label>
              <input name="bank.branchCode" className="form-input" value={form.bankDetails.branchCode} onChange={handleChange} style={{ fontFamily: 'monospace' }} />
            </div>
          </div>
        </section>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving ? <><span className="spinner" />Saving...</> : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default SellerProfile;
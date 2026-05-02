import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styles from './AuthPage.module.css';
import SEO from '@/components/common/SEO';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.trim()) newErrors.email = 'Email is required.';
    if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.password)) newErrors.password = 'Password must contain an uppercase letter.';
    if (!/[0-9]/.test(form.password)) newErrors.password = 'Password must contain a number.';
    if (form.password !== form.confirm) newErrors.confirm = 'Passwords do not match.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/shop', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
  <SEO
    title="Create account"
    description="Create a free Halfsec account and start shopping quality second-hand items at half the price."
    url="https://halfsec.co.za/register"
  />
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.brand}>half<span>sec</span></Link>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Start shopping second hand</p>
        </div>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full name</label>
            <input
              id="name" name="name" type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name} onChange={handleChange}
              placeholder="Your name" autoComplete="name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={form.password} onChange={handleChange}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm" name="confirm" type="password"
              className={`form-input ${errors.confirm ? 'error' : ''}`}
              value={form.confirm} onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? <><span className="spinner" />Creating account...</> : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default RegisterPage;
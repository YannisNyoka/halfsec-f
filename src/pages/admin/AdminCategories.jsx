import { useState, useEffect } from 'react';
import { getAllCategoriesAdmin, createCategory, deleteCategory } from '../../api/admin';
import styles from './AdminCategories.module.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = () => {
    getAllCategoriesAdmin()
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setCreating(true); setError('');
    try {
      await createCategory(form);
      setForm({ name: '', description: '' });
      setSuccess('Category created!');
      setTimeout(() => setSuccess(''), 2000);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await deleteCategory(id);
      setCategories((p) => p.filter((c) => c._id !== id));
    } catch {}
    finally { setDeleting(null); }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Categories</h1>

      <div className={styles.layout}>
        {/* Create form */}
        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>Add new category</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleCreate} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Electronics" />
            </div>
            <div className="form-group">
              <label className="form-label">Description <span style={{ color: 'var(--color-muted)', fontSize: 11 }}>(optional)</span></label>
              <input className="form-input" value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? <><span className="spinner" />Creating...</> : 'Create category'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className={styles.listCard}>
          <h2 className={styles.cardTitle}>All categories ({categories.length})</h2>
          {loading ? (
            <div className="page-loader"><div className="spinner" style={{ width: 24, height: 24, borderTopColor: 'var(--color-gold)' }} /></div>
          ) : categories.length === 0 ? (
            <p className={styles.empty}>No categories yet.</p>
          ) : (
            <div className={styles.list}>
              {categories.map((cat) => (
                <div key={cat._id} className={styles.catRow}>
                  <div>
                    <div className={styles.catName}>{cat.name}</div>
                    {cat.description && <div className={styles.catDesc}>{cat.description}</div>}
                  </div>
                  <div className={styles.catActions}>
                    <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(cat._id, cat.name)}
                      disabled={deleting === cat._id}
                    >
                      {deleting === cat._id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
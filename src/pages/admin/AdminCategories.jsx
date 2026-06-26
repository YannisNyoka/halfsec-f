import { useState, useEffect } from 'react';
import { getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory } from '../../api/admin';
import styles from './AdminCategories.module.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImageSelection = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const resetForm = () => {
    setForm({ name: '', description: '' });
    clearImageSelection();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setCreating(true); setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      if (imageFile) formData.append('image', imageFile);

      await createCategory(formData);
      resetForm();
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

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">
                Category image <span style={{ color: 'var(--color-muted)', fontSize: 11 }}>(optional)</span>
              </label>
              {imagePreview ? (
                <div className={styles.imagePreviewWrap}>
                  <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                  <button type="button" className={styles.clearImageBtn} onClick={clearImageSelection}>
                    Remove
                  </button>
                </div>
              ) : (
                <label className={styles.uploadZone}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Click to upload image</span>
                  <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>

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
                  <div className={styles.catThumb}>
                    {cat.image?.url ? (
                      <img src={cat.image.url} alt={cat.name} />
                    ) : (
                      <div className={styles.catThumbFallback}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.catInfo}>
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
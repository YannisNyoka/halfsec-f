import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getSellerProduct,
  createSellerProduct,
  updateSellerProduct,
} from '../../api/seller';
import { getCategories } from '../../api/products';
import api from '../../api/axios';
import styles from './SellerProductForm.module.css';

const CONDITIONS = ['new', 'like new', 'good', 'fair', 'poor'];

const INITIAL = {
  name: '', description: '', price: '', originalPrice: '',
  category: '', condition: 'good', stock: '1', tags: '',
  images: [],
};

const SellerProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.categories)).catch(() => {});
    if (isEdit) {
      getSellerProduct(id).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice || '',
          category: p.category?._id || '',
          condition: p.condition,
          stock: p.stock,
          tags: p.tags?.join(', ') || '',
          images: p.images || [],
        });
      }).catch(() => navigate('/seller/products')).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      // Send all selected files in one request under the field name "images"
      // (matches upload.array('images', 5) on the backend route)
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      // No manual Content-Type header — let the browser set the multipart boundary
      const { data } = await api.post('/upload', formData);

      // The route returns { images: [{ url, publicId }, ...] }
      const uploaded = data.images.map((img) => ({ url: img.url, publicId: img.publicId }));

      setForm((p) => ({ ...p, images: [...p.images, ...uploaded] }));
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.category) {
      setError('Name, description, price and category are required.');
      return;
    }
    if (form.images.length === 0) {
      setError('Please add at least one image.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        condition: form.condition,
        stock: Number(form.stock),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        images: form.images,
      };

      if (isEdit) {
        await updateSellerProduct(id, payload);
      } else {
        await createSellerProduct(payload);
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/seller/products" className={styles.back}>← My products</Link>
        <h1 className={styles.title}>{isEdit ? 'Edit listing' : 'List a new item'}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="form-group">
          <label className="form-label">Product name *</label>
          <input name="name" className="form-input" value={form.name} onChange={handleChange}
            placeholder="e.g. Levi's 501 Jeans" />
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea name="description" className="form-input" value={form.description}
            onChange={handleChange} rows={4} style={{ resize: 'vertical' }}
            placeholder="Describe the item, its condition, any flaws..." />
        </div>

        <div className={styles.grid2}>
          <div className="form-group">
            <label className="form-label">Price (R) *</label>
            <input name="price" type="number" min="0" className="form-input"
              value={form.price} onChange={handleChange} placeholder="350" />
          </div>
          <div className="form-group">
            <label className="form-label">Original price (R)</label>
            <input name="originalPrice" type="number" min="0" className="form-input"
              value={form.originalPrice} onChange={handleChange} placeholder="Optional" />
          </div>
        </div>

        <div className={styles.grid2}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" className="form-select" value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Condition *</label>
            <select name="condition" className="form-select" value={form.condition} onChange={handleChange}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.grid2}>
          <div className="form-group">
            <label className="form-label">Stock quantity *</label>
            <input name="stock" type="number" min="0" className="form-input"
              value={form.stock} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Tags</label>
            <input name="tags" className="form-input" value={form.tags} onChange={handleChange}
              placeholder="vintage, denim, casual" />
          </div>
        </div>

        {/* Images */}
        <div className="form-group">
          <label className="form-label">Photos *</label>
          <div className={styles.imageGrid}>
            {form.images.map((img, i) => (
              <div key={i} className={styles.imagePreview}>
                <img src={img.url} alt="" />
                <button type="button" className={styles.removeImg} onClick={() => removeImage(i)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
            <label className={styles.uploadBtn}>
              {uploading ? (
                <span className="spinner" style={{ width: 18, height: 18, borderTopColor: 'var(--color-gold)' }} />
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                  Add photo
                </>
              )}
              <input type="file" accept="image/*" multiple onChange={handleImageUpload}
                style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving
              ? <><span className="spinner" />Saving...</>
              : isEdit ? 'Save changes' : 'List item'
            }
          </button>
          <Link to="/seller/products" className="btn btn-ghost btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerProductForm;
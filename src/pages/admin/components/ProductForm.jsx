import { useState, useEffect } from 'react';
import { uploadImages, deleteImage } from '../../../api/admin';
import { getAllCategoriesAdmin } from '../../../api/admin';
import styles from './ProductForm.module.css';

const CONDITIONS = ['like new', 'good', 'fair', 'poor'];

const ProductForm = ({ initial = {}, onSubmit, loading, submitLabel = 'Save product' }) => {
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: '', condition: 'like new', stock: '1',
    isFeatured: false, isActive: true, tags: '',
    ...initial,
    tags: initial.tags?.join(', ') || '',
    price: initial.price?.toString() || '',
    originalPrice: initial.originalPrice?.toString() || '',
    stock: initial.stock?.toString() || '1',
  });
  const [images, setImages] = useState(initial.images || []);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getAllCategoriesAdmin()
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 5) {
      setErrors((p) => ({ ...p, images: 'Maximum 5 images allowed.' }));
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const { data } = await uploadImages(formData);
      setImages((p) => [...p, ...data.images]);
    } catch {
      setErrors((p) => ({ ...p, images: 'Upload failed. Try again.' }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (img, index) => {
    try {
      await deleteImage(img.publicId);
    } catch {}
    setImages((p) => p.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price is required.';
    if (!form.category) e.category = 'Category is required.';
    if (!form.condition) e.condition = 'Condition is required.';
    if (images.length === 0) e.images = 'At least one image is required.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category,
      condition: form.condition,
      stock: Number(form.stock) || 1,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Images */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Product images</h3>
        <div className={styles.imageGrid}>
          {images.map((img, i) => (
            <div key={i} className={styles.imageThumb}>
              <img src={img.url} alt={`Product ${i + 1}`} />
              <button
                type="button"
                className={styles.deleteImg}
                onClick={() => handleDeleteImage(img, i)}
              >×</button>
              {i === 0 && <span className={styles.mainBadge}>Main</span>}
            </div>
          ))}
          {images.length < 5 && (
            <label className={styles.uploadBtn}>
              {uploading ? (
                <span className="spinner" style={{ borderTopColor: 'var(--color-gold)' }} />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>Upload</span>
                </>
              )}
              <input
                type="file" accept="image/*" multiple
                onChange={handleImageUpload} style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
          )}
        </div>
        {errors.images && <span className="form-error">{errors.images}</span>}
      </div>

      {/* Basic info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Basic info</h3>
        <div className={styles.grid2}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Product name</label>
            <input name="name" className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name} onChange={handleChange} placeholder="e.g. Vintage Levi's Jacket" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea name="description" className={`form-input ${errors.description ? 'error' : ''}`}
              value={form.description} onChange={handleChange}
              rows={4} style={{ resize: 'vertical' }}
              placeholder="Describe the item, its condition, size, brand..." />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" className={`form-select ${errors.category ? 'error' : ''}`}
              value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Condition</label>
            <select name="condition" className="form-select" value={form.condition} onChange={handleChange}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input name="tags" className="form-input" value={form.tags} onChange={handleChange}
              placeholder="vintage, denim, jacket" />
          </div>
        </div>
      </div>

      {/* Pricing & stock */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pricing & stock</h3>
        <div className={styles.grid2}>
          <div className="form-group">
            <label className="form-label">Selling price (R)</label>
            <input name="price" type="number" min="0" step="0.01"
              className={`form-input ${errors.price ? 'error' : ''}`}
              value={form.price} onChange={handleChange} placeholder="350" />
            {errors.price && <span className="form-error">{errors.price}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Original price (R) <span className={styles.optional}>optional</span></label>
            <input name="originalPrice" type="number" min="0" step="0.01"
              className="form-input"
              value={form.originalPrice} onChange={handleChange} placeholder="899" />
          </div>
          <div className="form-group">
            <label className="form-label">Stock quantity</label>
            <input name="stock" type="number" min="0"
              className="form-input"
              value={form.stock} onChange={handleChange} placeholder="1" />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Settings</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkbox}>
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
            <span className={styles.checkmark} />
            Feature this product on the homepage
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            <span className={styles.checkmark} />
            Product is active (visible in shop)
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || uploading}>
          {loading ? <><span className="spinner" />Saving...</> : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
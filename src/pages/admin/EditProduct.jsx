import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { updateProduct } from '../../api/admin';
import api from '../../api/axios';
import ProductForm from './components/ProductForm';
import styles from './AdminFormPage.module.css';

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/admin/all`)
      .then(({ data }) => {
        const found = data.products.find((p) => p._id === id);
        if (found) setProduct(found);
        else setError('Product not found.');
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await updateProduct(id, data);
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-gold)' }} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/admin/products" className={styles.back}>← Back to products</Link>
        <h1 className={styles.title}>Edit product</h1>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {product && <ProductForm initial={product} onSubmit={handleSubmit} loading={loading} submitLabel="Save changes" />}
    </div>
  );
};

export default EditProduct;
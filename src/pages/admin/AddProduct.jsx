import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProduct } from '../../api/admin';
import ProductForm from './components/ProductForm';
import styles from './AdminFormPage.module.css';

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await createProduct(data);
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/admin/products" className={styles.back}>← Back to products</Link>
        <h1 className={styles.title}>Add new product</h1>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      <ProductForm onSubmit={handleSubmit} loading={loading} submitLabel="Create product" />
    </div>
  );
};

export default AddProduct;
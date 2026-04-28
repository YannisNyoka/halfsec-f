import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import styles from './CartPage.module.css';

const CartPage = () => {
  // ✅ ALL hooks are inside the component
  const { cart, loading, itemCount, total, update, remove, fetchCart } = useCart();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});
  const [removing, setRemoving] = useState({});

  // Refetch cart every time this page is visited
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdate = async (productId, quantity) => {
    setUpdating((p) => ({ ...p, [productId]: true }));
    try { await update(productId, quantity); } catch {}
    finally { setUpdating((p) => ({ ...p, [productId]: false })); }
  };

  const handleRemove = async (productId) => {
    setRemoving((p) => ({ ...p, [productId]: true }));
    try { await remove(productId); } catch {}
    finally { setRemoving((p) => ({ ...p, [productId]: false })); }
  };

  const shippingCost = total >= 500 ? 0 : 80;
  const orderTotal = total + shippingCost;

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  if (!cart || itemCount === 0) return (
    <div className={styles.empty}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <h2>Your cart is empty</h2>
      <p>Browse the shop and add something you love</p>
      <Link to="/shop" className="btn btn-primary btn-lg">Browse shop</Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>
          Your cart <span>({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
        </h1>

        <div className={styles.layout}>
          {/* Cart items */}
          <div className={styles.items}>
            {cart.items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={product._id} className={styles.item}>
                  <div className={styles.itemImage}>
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <div className={styles.imageFallback}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className={styles.itemDetails}>
                    <Link to={`/shop/${product.slug}`} className={styles.itemName}>
                      {product.name}
                    </Link>
                    <div className={styles.itemMeta}>
                      <span className="badge badge-muted">{product.condition}</span>
                      <span className={styles.unitPrice}>R{item.priceAtAdd.toLocaleString()} each</span>
                    </div>
                  </div>

                  <div className={styles.itemQty}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => item.quantity > 1 && handleUpdate(product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating[product._id]}
                    >−</button>
                    <span className={styles.qtyValue}>
                      {updating[product._id]
                        ? <span className="spinner" style={{ width: 14, height: 14 }} />
                        : item.quantity}
                    </span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => handleUpdate(product._id, item.quantity + 1)}
                      disabled={item.quantity >= product.stock || updating[product._id]}
                    >+</button>
                  </div>

                  <div className={styles.itemPrice}>
                    R{(item.priceAtAdd * item.quantity).toLocaleString()}
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(product._id)}
                    disabled={removing[product._id]}
                    aria-label="Remove item"
                  >
                    {removing[product._id]
                      ? <span className="spinner" style={{ width: 14, height: 14 }} />
                      : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      )
                    }
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order summary</h2>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>R{total.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={shippingCost === 0 ? styles.free : ''}>
                  {shippingCost === 0 ? 'Free' : `R${shippingCost}`}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className={styles.freeShipNote}>
                  Add R{(500 - total).toLocaleString()} more for free shipping
                </p>
              )}
              <div className={styles.divider} />
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>R{orderTotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => navigate('/checkout')}
            >
              Proceed to checkout
            </button>
            <Link to="/shop" className="btn btn-ghost btn-full" style={{ marginTop: 8 }}>
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
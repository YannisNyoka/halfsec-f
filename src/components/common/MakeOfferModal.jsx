import { useState } from 'react';
import { makeOffer } from '../../api/offers';
import styles from './MakeOfferModal.module.css';

const MakeOfferModal = ({ product, onClose, onSuccess }) => {
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const minOffer = Math.ceil(product.price * 0.3);
  const maxOffer = product.price - 1;
  const discount = offerPrice
    ? Math.round(((product.price - Number(offerPrice)) / product.price) * 100)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerPrice || Number(offerPrice) < minOffer) {
      setError(`Minimum offer is R${minOffer.toLocaleString()} (30% of listing price).`);
      return;
    }
    if (Number(offerPrice) >= product.price) {
      setError(`Offer must be below R${product.price.toLocaleString()}.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await makeOffer({
        productId: product._id,
        offerPrice: Number(offerPrice),
        message: message.trim(),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send offer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Make an offer</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Product preview */}
        <div className={styles.productPreview}>
          <div className={styles.productImg}>
            {product.images?.[0]?.url
              ? <img src={product.images[0].url} alt={product.name} />
              : <div className={styles.imgFallback} />
            }
          </div>
          <div>
            <div className={styles.productName}>{product.name}</div>
            <div className={styles.listingPrice}>
              Listed at <strong>R{product.price.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Your offer price</label>
            <div className={styles.priceInputWrap}>
              <span className={styles.currency}>R</span>
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: 32 }}
                value={offerPrice}
                onChange={(e) => { setOfferPrice(e.target.value); setError(''); }}
                placeholder={Math.round(product.price * 0.8)}
                min={minOffer}
                max={maxOffer}
                autoFocus
              />
            </div>
            <span className="form-hint">
              Min R{minOffer.toLocaleString()} · Max R{maxOffer.toLocaleString()}
              {discount !== null && discount > 0 && (
                <span className={styles.discountHint}> · {discount}% off listing price</span>
              )}
            </span>
          </div>

          {/* Quick offer suggestions */}
          <div className={styles.suggestions}>
            {[0.9, 0.8, 0.7].map((pct) => {
              const suggested = Math.round(product.price * pct);
              return (
                <button
                  key={pct}
                  type="button"
                  className={`${styles.suggestionBtn} ${Number(offerPrice) === suggested ? styles.suggestionActive : ''}`}
                  onClick={() => { setOfferPrice(suggested); setError(''); }}
                >
                  R{suggested.toLocaleString()}
                  <span className={styles.suggestionPct}>({Math.round((1 - pct) * 100)}% off)</span>
                </button>
              );
            })}
          </div>

          <div className="form-group">
            <label className="form-label">
              Message to seller{' '}
              <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              className="form-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="e.g. I can collect in person, happy to pay cash..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className={styles.terms}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            The seller has 48 hours to respond. Your offer is binding — if accepted, you'll be prompted to complete the purchase at your offered price.
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={submitting || !offerPrice}
          >
            {submitting
              ? <><span className="spinner" />Sending offer...</>
              : `Send offer of R${offerPrice ? Number(offerPrice).toLocaleString() : '—'}`
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default MakeOfferModal;
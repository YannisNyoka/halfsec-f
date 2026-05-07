import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getProductReviews,
  getMyReview,
  createReview,
  updateReview,
  deleteReview,
} from '../../api/reviews';
import useAuth from '../../hooks/useAuth';
import StarRating, { RatingDisplay } from './StarRating';
import styles from './ProductReviews.module.css';

const ProductReviews = ({ product }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [distribution, setDistribution] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [page, setPage] = useState(1);

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getProductReviews(product._id, { page: p, limit: 5 });
      setReviews(data.reviews);
      setDistribution(data.distribution);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchMyReview = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await getMyReview(product._id);
      setMyReview(data.review);
      if (data.review) {
        setForm({
          rating: data.review.rating,
          title: data.review.title || '',
          body: data.review.body || '',
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchReviews(1);
    fetchMyReview();
  }, [product._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      setFormError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');
    try {
      if (myReview) {
        await updateReview(myReview._id, form);
        setFormSuccess('Review updated!');
      } else {
        await createReview({ productId: product._id, ...form });
        setFormSuccess('Review submitted! Thank you.');
      }
      setShowForm(false);
      await fetchMyReview();
      await fetchReviews(1);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await deleteReview(myReview._id);
      setMyReview(null);
      setForm({ rating: 0, title: '', body: '' });
      setFormSuccess('');
      await fetchReviews(1);
    } catch {}
  };

  const totalReviews = pagination.total || 0;
  const avgRating = product.rating?.average || 0;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        Customer reviews
        {totalReviews > 0 && (
          <span className={styles.titleCount}>({totalReviews})</span>
        )}
      </h2>

      {/* Rating summary */}
      {totalReviews > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryLeft}>
            <div className={styles.bigRating}>{avgRating.toFixed(1)}</div>
            <RatingDisplay rating={avgRating} count={totalReviews} size={20} />
            <p className={styles.summaryLabel}>out of 5</p>
          </div>
          <div className={styles.summaryBars}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] || 0;
              const pct = totalReviews > 0
                ? Math.round((count / totalReviews) * 100)
                : 0;
              return (
                <div key={star} className={styles.distRow}>
                  <span className={styles.distLabel}>{star} ★</span>
                  <div className={styles.distBarWrap}>
                    <div
                      className={styles.distBar}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={styles.distCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write review button / form */}
      {isAuthenticated && (
        <div className={styles.writeSection}>
          {myReview && !showForm ? (
            <div className={styles.myReviewBanner}>
              <div>
                <span className={styles.myReviewLabel}>Your review</span>
                <RatingDisplay rating={myReview.rating} showCount={false} />
                {myReview.title && (
                  <p className={styles.myReviewTitle}>{myReview.title}</p>
                )}
              </div>
              <div className={styles.myReviewActions}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowForm(true)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : !showForm ? (
            <button
              className="btn btn-outline"
              onClick={() => setShowForm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Write a review
            </button>
          ) : null}

          {showForm && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h3 className={styles.formTitle}>
                {myReview ? 'Edit your review' : 'Write a review'}
              </h3>

              {formError && <div className="alert alert-error">{formError}</div>}
              {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

              <div className={styles.formField}>
                <label className="form-label">Your rating *</label>
                <StarRating
                  value={form.rating}
                  onChange={(r) => setForm((p) => ({ ...p, rating: r }))}
                  size={32}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Title (optional)</label>
                <input
                  className="form-input"
                  placeholder="Summarise your experience"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Review (optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Tell others about this product..."
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  rows={4}
                  maxLength={1000}
                  style={{ resize: 'vertical' }}
                />
                <span className="form-hint">
                  {form.body.length}/1000 characters
                </span>
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? <><span className="spinner" />Submitting...</>
                    : myReview ? 'Update review' : 'Submit review'
                  }
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowForm(false);
                    setFormError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className={styles.loginPrompt}>
          <Link to="/login" className={styles.loginLink}>Sign in</Link>
          {' '}to write a review
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <div className="spinner" style={{ width: 28, height: 28, borderTopColor: 'var(--color-gold)' }} />
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.noReviews}>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review._id} className={styles.review}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewAvatar}>
                  {review.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className={styles.reviewMeta}>
                  <div className={styles.reviewTopRow}>
                    <span className={styles.reviewAuthor}>
                      {review.user?.name}
                    </span>
                    {review.verified && (
                      <span className={styles.verifiedBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Verified purchase
                      </span>
                    )}
                  </div>
                  <div className={styles.reviewRatingRow}>
                    <RatingDisplay
                      rating={review.rating}
                      showCount={false}
                      size={14}
                    />
                    <span className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-ZA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {review.title && (
                <h4 className={styles.reviewTitle}>{review.title}</h4>
              )}
              {review.body && (
                <p className={styles.reviewBody}>{review.body}</p>
              )}

              {/* Delete own review inline */}
              {user && review.user?._id === user.id && (
                <div className={styles.reviewOwnerActions}>
                  <button
                    className={styles.ownReviewBtn}
                    onClick={() => {
                      setForm({
                        rating: review.rating,
                        title: review.title || '',
                        body: review.body || '',
                      });
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`}
                  onClick={() => {
                    setPage(i + 1);
                    fetchReviews(i + 1);
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
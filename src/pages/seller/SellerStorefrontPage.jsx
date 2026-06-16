import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSellerRatings } from '../../api/sellerRatings';
import StarRating from '../../components/common/StarRating';
import SEO from '../../components/common/SEO';
import styles from './SellerStorefrontPage.module.css';

const SellerStorefrontPage = () => {
  const { sellerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = (p = 1) => {
    setLoading(true);
    getSellerRatings(sellerId, { page: p, limit: 10 })
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(1); }, [sellerId]);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--color-gold)' }} />
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--color-muted)' }}>
      Seller not found.
    </div>
  );

  const { seller, ratings, distribution, pagination } = data;
  const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className={styles.page}>
      <SEO title={`${seller.name} — Seller on Halfsec`} />
      <div className="container">

        <div className={styles.header}>
          <div className={styles.avatar}>{seller.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className={styles.name}>{seller.name}</h1>
            {seller.bio && <p className={styles.bio}>{seller.bio}</p>}
            <div className={styles.ratingSummary}>
              <StarRating rating={seller.rating.average} size={18} />
              <span className={styles.ratingText}>
                {seller.rating.average.toFixed(1)} ({seller.rating.count} review{seller.rating.count !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>

        {totalRatings > 0 && (
          <div className={styles.distribution}>
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className={styles.distRow}>
                <span className={styles.distStar}>{star} ★</span>
                <div className={styles.distBarWrap}>
                  <div
                    className={styles.distBar}
                    style={{ width: `${totalRatings ? (distribution[star] / totalRatings) * 100 : 0}%` }}
                  />
                </div>
                <span className={styles.distCount}>{distribution[star]}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.reviews}>
          <h2 className={styles.reviewsTitle}>Reviews</h2>
          {ratings.length === 0 ? (
            <p className={styles.noReviews}>This seller doesn't have any reviews yet.</p>
          ) : (
            ratings.map((r) => (
              <div key={r._id} className={styles.review}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewer}>{r.buyer?.name || 'Anonymous'}</span>
                  <StarRating rating={r.rating} size={14} />
                </div>
                {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                <span className={styles.reviewDate}>
                  {new Date(r.createdAt).toLocaleDateString('en-ZA', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
            ))
          )}
        </div>

        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1}
              onClick={() => { setPage((p) => p - 1); fetchData(page - 1); }}>
              ← Prev
            </button>
            <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages}
              onClick={() => { setPage((p) => p + 1); fetchData(page + 1); }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerStorefrontPage;
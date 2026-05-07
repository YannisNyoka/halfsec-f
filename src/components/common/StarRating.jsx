import { useState } from 'react';
import styles from './StarRating.module.css';

const Star = ({ filled, half, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled || half ? '#f5a623' : 'none'}
    stroke="#f5a623"
    strokeWidth="1.5"
  >
    {half ? (
      <>
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="#f5a623" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="url(#halfGrad)"
          stroke="#f5a623"
          strokeWidth="1.5"
        />
      </>
    ) : (
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    )}
  </svg>
);

// Display-only rating
export const RatingDisplay = ({ rating, count, size = 16, showCount = true }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} filled size={size} />);
    } else if (i - 0.5 <= rating) {
      stars.push(<Star key={i} half size={size} />);
    } else {
      stars.push(<Star key={i} size={size} />);
    }
  }
  return (
    <div className={styles.displayWrap}>
      <div className={styles.stars}>{stars}</div>
      {showCount && (
        <span className={styles.count}>
          {rating > 0 ? rating.toFixed(1) : ''}
          {count > 0 ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
};

// Interactive rating input
const StarRating = ({ value = 0, onChange, size = 28 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.inputWrap}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={styles.starBtn}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star filled={(hover || value) >= star} size={size} />
        </button>
      ))}
      {value > 0 && (
        <span className={styles.ratingLabel}>
          {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
};

export default StarRating;
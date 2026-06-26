import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './CategoryBanner.module.css';

const CategoryBanner = ({ categories }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % categories.length);
  }, [categories.length]);

  const prev = () => {
    setCurrent((p) => (p - 1 + categories.length) % categories.length);
  };

  // Auto-advance every 4 seconds unless hovered
  useEffect(() => {
    if (paused || categories.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next, categories.length]);

  if (!categories.length) return null;

  return (
    <div
      className={styles.banner}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className={styles.track}>
        {categories.map((cat, i) => (
          <div
            key={cat._id}
            className={`${styles.slide} ${i === current ? styles.active : ''}`}
            aria-hidden={i !== current}
          >
            {/* Background image */}
            {cat.image?.url ? (
              <img
                src={cat.image.url}
                alt={cat.name}
                className={styles.bg}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <div className={styles.bgFallback} />
            )}

            {/* Dark overlay so text is always readable */}
            <div className={styles.overlay} />

            {/* Content */}
            <div className={`container ${styles.content}`}>
              <span className={styles.label}>Browse category</span>
              <h2 className={styles.title}>{cat.name}</h2>
              {cat.description && (
                <p className={styles.desc}>{cat.description}</p>
              )}
              <Link
                to={`/shop?category=${cat._id}`}
                className={styles.cta}
              >
                Shop {cat.name} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {categories.length > 1 && (
        <>
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous category">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next category">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {categories.length > 1 && (
        <div className={styles.dots}>
          {categories.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryBanner;
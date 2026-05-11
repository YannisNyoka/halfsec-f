import { useState, useEffect, useCallback } from 'react';
import styles from './BackToTop.module.css';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Show button after scrolling 400px
    setVisible(scrollY > 400);

    // Calculate scroll progress 0-100
    setProgress(docHeight > 0 ? Math.round((scrollY / docHeight) * 100) : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG circle progress
  const size = 44;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      className={`${styles.btn} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      title={`Back to top (${progress}%)`}
    >
      {/* Progress ring */}
      <svg
        className={styles.ring}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          className={styles.ringTrack}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          className={styles.ringProgress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Arrow icon */}
      <svg
        className={styles.arrow}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};

export default BackToTop;
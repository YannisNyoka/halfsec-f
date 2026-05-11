import { useState, useEffect, useCallback } from 'react';
import styles from './ScrollProgressBar.module.css';

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (progress === 0) return null;

  return (
    <div className={styles.track}>
      <div
        className={styles.bar}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ScrollProgressBar;
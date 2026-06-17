import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PriceRangeSlider.module.css';

const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [dragging, setDragging] = useState(null); // 'min' | 'max'
  const trackRef = useRef(null);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const getPercent = (v) => ((v - min) / (max - min)) * 100;

  const getPosFromEvent = useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const raw = (clientX - rect.left) / rect.width;
    const step = 50;
    return Math.round((clamp(raw, 0, 1) * (max - min) + min) / step) * step;
  }, [min, max]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const pos = getPosFromEvent(e);
      if (dragging === 'min') {
        onChange([clamp(pos, min, value[1] - 50), value[1]]);
      } else {
        onChange([value[0], clamp(pos, value[0] + 50, max)]);
      }
    };
    const up = () => setDragging(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, value, min, max, getPosFromEvent, onChange]);

  const leftPct = getPercent(value[0]);
  const rightPct = getPercent(value[1]);

  return (
    <div className={styles.wrap}>
      <div className={styles.labels}>
        <span>R{value[0].toLocaleString()}</span>
        <span>R{value[1].toLocaleString()}</span>
      </div>
      <div className={styles.track} ref={trackRef}>
        <div
          className={styles.fill}
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        {/* Min thumb */}
        <div
          className={`${styles.thumb} ${dragging === 'min' ? styles.thumbActive : ''}`}
          style={{ left: `${leftPct}%` }}
          onMouseDown={() => setDragging('min')}
          onTouchStart={() => setDragging('min')}
          role="slider"
          aria-valuenow={value[0]}
          aria-valuemin={min}
          aria-valuemax={value[1]}
        />
        {/* Max thumb */}
        <div
          className={`${styles.thumb} ${dragging === 'max' ? styles.thumbActive : ''}`}
          style={{ left: `${rightPct}%` }}
          onMouseDown={() => setDragging('max')}
          onTouchStart={() => setDragging('max')}
          role="slider"
          aria-valuenow={value[1]}
          aria-valuemin={value[0]}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default PriceRangeSlider;
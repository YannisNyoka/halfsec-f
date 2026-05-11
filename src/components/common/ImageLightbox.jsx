import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './ImageLightbox.module.css';

const ImageLightbox = ({ images, initialIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState({});
  const imgRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchDistRef = useRef(null);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const goNext = useCallback(() => {
    resetZoom();
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length, resetZoom]);

  const goPrev = useCallback(() => {
    resetZoom();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length, resetZoom]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.5, 4));
      if (e.key === '-') setZoom((z) => Math.max(z - 0.5, 1));
      if (e.key === '0') resetZoom();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev, resetZoom]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Double click to zoom
  const handleDoubleClick = (e) => {
    e.preventDefault();
    if (zoom > 1) {
      resetZoom();
    } else {
      const rect = imgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
      setZoom(2.5);
      setPan({ x, y });
    }
  };

  // Mouse drag for panning
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ ...pan });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    setPan({ x: panStart.x + dx, y: panStart.y + dy });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Scroll to zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setZoom((z) => Math.max(1, Math.min(4, z + delta)));
    if (zoom + delta <= 1) resetZoom();
  };

  // Touch support
  const getDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
        time: Date.now(),
      };
    }
    if (e.touches.length === 2) {
      touchDistRef.current = getDistance(e.touches[0], e.touches[1]);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2 && touchDistRef.current) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      const scale = dist / touchDistRef.current;
      touchDistRef.current = dist;
      setZoom((z) => Math.max(1, Math.min(4, z * scale)));
    } else if (e.touches.length === 1 && touchStartRef.current && zoom > 1) {
      const dx = (e.touches[0].clientX - touchStartRef.current.x) / zoom;
      const dy = (e.touches[0].clientY - touchStartRef.current.y) / zoom;
      setPan({
        x: touchStartRef.current.panX + dx,
        y: touchStartRef.current.panY + dy,
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (
      touchStartRef.current &&
      zoom <= 1 &&
      e.changedTouches.length === 1 &&
      Date.now() - touchStartRef.current.time < 300
    ) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      if (Math.abs(dx) > 50) {
        dx < 0 ? goNext() : goPrev();
      }
    }
    if (zoom <= 1) touchDistRef.current = null;
  };

  const currentImage = images[current];

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.counter}>
          {current + 1} / {images.length}
        </span>
        <div className={styles.controls}>
          {/* Zoom out */}
          <button
            className={styles.controlBtn}
            onClick={() => {
              const next = Math.max(1, zoom - 0.5);
              setZoom(next);
              if (next <= 1) resetZoom();
            }}
            disabled={zoom <= 1}
            aria-label="Zoom out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          {/* Zoom level */}
          <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>

          {/* Zoom in */}
          <button
            className={styles.controlBtn}
            onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
            disabled={zoom >= 4}
            aria-label="Zoom in"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          {/* Reset zoom */}
          {zoom > 1 && (
            <button
              className={styles.controlBtn}
              onClick={resetZoom}
              aria-label="Reset zoom"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 109-9M3 3v6h6"/>
              </svg>
            </button>
          )}

          {/* Close */}
          <button
            className={`${styles.controlBtn} ${styles.closeBtn}`}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main image */}
      <div
        className={`${styles.imageWrap} ${zoom > 1 ? styles.zoomed : ''}`}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading skeleton */}
        {!loaded[current] && (
          <div className={styles.skeleton} />
        )}

        <img
          ref={imgRef}
          src={currentImage?.url}
          alt={`Image ${current + 1}`}
          className={styles.image}
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            opacity: loaded[current] ? 1 : 0,
          }}
          onLoad={() => setLoaded((p) => ({ ...p, [current]: true }))}
          draggable={false}
        />
      </div>

      {/* Prev / Next arrows */}
      {images.length > 1 && (
        <>
          <button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous image"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next image"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, i) => (
            <button
              key={i}
              className={`${styles.thumb} ${i === current ? styles.thumbActive : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
                setCurrent(i);
              }}
            >
              <img src={img.url} alt={`Thumbnail ${i + 1}`} />
            </button>
          ))}
        </div>
      )}

      {/* Hints */}
      <div className={styles.hints}>
        <span>Double-click to zoom</span>
        <span>·</span>
        <span>Scroll to zoom</span>
        {images.length > 1 && (
          <>
            <span>·</span>
            <span>← → to navigate</span>
          </>
        )}
        <span>·</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
};

export default ImageLightbox;
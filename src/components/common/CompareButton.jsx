import { useCompare } from '../../context/CompareContext.jsx';
import styles from './CompareButton.module.css';

const CompareButton = ({ product, size = 'sm' }) => {
  const { toggle, isInCompare, isFull } = useCompare();
  const inCompare = isInCompare(product._id);
  const disabled = isFull && !inCompare;

  return (
    <button
      className={`
        ${styles.btn}
        ${styles[size]}
        ${inCompare ? styles.active : ''}
        ${disabled ? styles.disabled : ''}
      `}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      disabled={disabled}
      title={
        inCompare
          ? 'Remove from compare'
          : disabled
          ? 'Compare list is full (max 3)'
          : 'Add to compare'
      }
      aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        {inCompare ? (
          <polyline points="20 6 9 17 4 12" />
        ) : (
          <>
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </>
        )}
      </svg>
      {size !== 'sm' && (
        <span>{inCompare ? 'Added' : disabled ? 'Full' : 'Compare'}</span>
      )}
    </button>
  );
};

export default CompareButton;
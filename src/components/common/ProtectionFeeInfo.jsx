import { useState } from 'react';
import styles from './ProtectionFeeInfo.module.css';

const ProtectionFeeInfo = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.infoBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="What is the Buyer Protection Fee?"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </button>

      {open && (
        <div className={styles.popover}>
          <div className={styles.popoverTitle}>What's this?</div>
          <p className={styles.popoverText}>
            Your payment is held securely until you confirm you've received your
            item as described. If something's wrong, we'll help sort it out.
            This small fee covers that protection on every order.
          </p>
          <button className={styles.closeBtn} onClick={() => setOpen(false)}>Got it</button>
        </div>
      )}
    </div>
  );
};

export default ProtectionFeeInfo;
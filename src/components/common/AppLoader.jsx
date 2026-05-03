import styles from './AppLoader.module.css';

const AppLoader = ({ message = 'Loading...' }) => (
  <div className={styles.overlay}>
    <div className={styles.content}>
      <div className={styles.logo}>
        half<span>sec</span>
      </div>
      <div className={styles.spinnerWrap}>
        <div className={styles.spinner} />
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  </div>
);

export default AppLoader;
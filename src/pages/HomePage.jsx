import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className={styles.hero}>
      <div className={`container ${styles.content}`}>
        <span className={styles.badge}>Second hand. First class.</span>
        <h1 className={styles.heading}>
          Find unique items<br />at <span>half</span> the price
        </h1>
        <p className={styles.sub}>
          Curated second-hand goods — quality checked, fairly priced.
        </p>
        <div className={styles.actions}>
          <Link to="/shop" className="btn btn-primary btn-lg">Browse the shop</Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-outline btn-lg">Create account</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="btn btn-outline btn-lg">Admin dashboard</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
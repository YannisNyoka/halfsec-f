import { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.page}>
          <div className={styles.content}>

            <div className={styles.icon}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.sub}>
              An unexpected error occurred. Our team has been notified.
              Try refreshing the page or going back to the homepage.
            </p>

            {/* Error details in dev mode */}
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.details}>
                <summary className={styles.detailsSummary}>
                  Error details (dev only)
                </summary>
                <pre className={styles.errorText}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className={styles.actions}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => window.location.reload()}
              >
                Refresh page
              </button>
              <Link
                to="/"
                className="btn btn-outline btn-lg"
                onClick={this.handleReset}
              >
                Go home
              </Link>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => {
                  this.handleReset();
                  window.history.back();
                }}
              >
                ← Go back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
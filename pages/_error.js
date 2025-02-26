import React from 'react';
import styles from '../styles/Home.module.css';

function Error({ statusCode }) {
  return (
    <div className={styles.errorContainer}>
      <h1 className={styles.errorTitle}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </h1>
      <p className={styles.errorMessage}>
        Please try refreshing the page or contact support if the problem persists.
      </p>
      <button 
        className={styles.errorButton}
        onClick={() => window.location.href = '/'}
      >
        Go to Home
      </button>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 
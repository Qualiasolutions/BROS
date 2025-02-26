import React from 'react';
import styles from '../styles/Home.module.css';

const LoadingScreen = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingDots}>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
      </div>
      <div className={styles.loadingText}>Processing your request...</div>
    </div>
  );
};

export default LoadingScreen;
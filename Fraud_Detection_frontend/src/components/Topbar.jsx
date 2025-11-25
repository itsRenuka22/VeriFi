import { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import styles from '../styles/Topbar.module.css';

const Topbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [showPopup, setShowPopup] = useState(false);

  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <input type="search" placeholder="Search user IDs, transactions, devices…" aria-label="Global search" />
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className={styles.iconButton}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div 
          className={styles.avatarContainer}
          onMouseEnter={() => setShowPopup(true)}
          onMouseLeave={() => setShowPopup(false)}
          onClick={() => setShowPopup(!showPopup)}
          role="button"
          tabIndex={0}
          aria-label="Admin user"
        >
          <div className={styles.avatar}>
            <span>Admin</span>
          </div>
          {showPopup && (
            <div className={styles.popup} role="tooltip" aria-live="polite">
              Admin for Fraud Detection Dashboard
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;


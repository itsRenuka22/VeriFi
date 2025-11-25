import { NavLink, useLocation } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

const Sidebar = ({ links }) => {
  const location = useLocation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>🛡️</span>
        <div>
          <h1>Fraud Detection</h1>
          <p>Console</p>
        </div>
      </div>
      <nav className={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            aria-current={location.pathname === link.path ? 'page' : undefined}
          >
            <span className={styles.icon}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.footer}>
        <p className={styles.version}>v0.1.0</p>
        <p className={styles.caption}>Live environment</p>
      </div>
    </aside>
  );
};

export default Sidebar;


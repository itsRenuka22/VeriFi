import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import styles from '../styles/Layout.module.css';

const navigationLinks = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/transactions', label: 'Transactions', icon: '💳' },
  { path: '/decisions', label: 'Decisions', icon: '⚖️' },
  { path: '/alerts', label: 'Alerts', icon: '🚨' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

const Layout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar links={navigationLinks} />
      <div className={styles.mainContent}>
        <Topbar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;


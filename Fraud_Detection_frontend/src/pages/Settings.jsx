import styles from '../styles/Settings.module.css';

const SettingsPage = () => (
  <div className={styles.wrapper}>
    <header>
      <h1>Settings</h1>
      <p>Configure alert routing, rule thresholds, and integrations (coming soon).</p>
    </header>
    <section className="card">
      <h2>Integrations</h2>
      <p className={styles.empty}>Connect Slack, PagerDuty, and case management once available.</p>
    </section>
    <section className="card">
      <h2>Rule thresholds</h2>
      <p className={styles.empty}>
        The settings UI will surface configuration from the fraud-service. Update via YAML or env vars until then.
      </p>
    </section>
  </div>
);

export default SettingsPage;


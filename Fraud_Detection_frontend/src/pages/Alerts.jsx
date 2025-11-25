import { useEffect, useMemo, useState } from 'react';
import AlertListItem from '../components/AlertListItem.jsx';
import { fetchAlerts } from '../services/fraudApi.js';
import styles from '../styles/Alerts.module.css';

const severityOrder = ['BLOCK', 'REVIEW'];

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [query, setQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      const data = await fetchAlerts();
      setAlerts(data);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return alerts
      .filter((alert) => {
        const matchesDecision = decisionFilter === 'ALL' || alert.decision === decisionFilter;
        const matchesQuery =
          !query ||
          alert.userId.toLowerCase().includes(lower) ||
          alert.transactionId.toLowerCase().includes(lower) ||
          alert.reasons.some((reason) => reason.toLowerCase().includes(lower));
        return matchesDecision && matchesQuery;
      })
      .sort(
        (a, b) =>
          severityOrder.indexOf(a.decision) - severityOrder.indexOf(b.decision) ||
          new Date(b.createdAt) - new Date(a.createdAt)
      );
  }, [alerts, query, decisionFilter]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1>Alerts</h1>
          <p>High-risk transactions routed to manual review or direct block notifications.</p>
        </div>
        <div className={styles.controls}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts…" />
          <select value={decisionFilter} onChange={(event) => setDecisionFilter(event.target.value)}>
            <option value="ALL">All outcomes</option>
            <option value="BLOCK">Blocks</option>
            <option value="REVIEW">Reviews</option>
          </select>
        </div>
      </header>
      <section className={styles.list}>
        {filtered.map((alert) => (
          <AlertListItem key={alert.id} alert={alert} />
        ))}
      </section>
    </div>
  );
};

export default AlertsPage;


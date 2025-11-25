import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SummaryCard from '../components/SummaryCard.jsx';
import AlertListItem from '../components/AlertListItem.jsx';
import TransactionsTable from '../components/TransactionsTable.jsx';
import { api } from '../api/client.js';
import { fetchAlerts, fetchDecisionBreakdown, fetchKpis, fetchLatencySeries, fetchTransactions } from '../services/fraudApi.js';
import styles from '../styles/Dashboard.module.css';

const DashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [latency, setLatency] = useState([]);
  const [decisionSplit, setDecisionSplit] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [kpiResp, latencyResp, decisionResp, txResp, alertsResp] = await Promise.all([
          fetchKpis(),
          fetchLatencySeries(),
          fetchDecisionBreakdown(),
          fetchTransactions({ limit: 6 }),
          fetchAlerts()
        ]);
        setKpis(kpiResp);
        setLatency(latencyResp);
        setDecisionSplit(decisionResp);
        setRecentTransactions(txResp);
        setAlerts(alertsResp);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !kpis) {
    return (
      <div className={styles.loading}>
        <div className="loading" role="status" aria-live="polite">
          <span className="sr-only">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1>Dashboard</h1>
          <p>Real-time overview of fraud detection metrics and activity</p>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <section className={styles.kpiGrid}>
        {kpis && (
          <>
            <SummaryCard 
              label="Processed Volume" 
              value={kpis.totalVolume}
              unit="currency"
              icon="💰" 
              color="accent" 
            />
            <SummaryCard
              label="Events / minute"
              value={kpis.velocityPerMin}
              icon="⚡"
              unit="count"
              color="accent"
            />
            <SummaryCard 
              label="Block rate" 
              value={kpis.blockRate}
              unit="percent"
              icon="🛑" 
              color="warning" 
            />
            <SummaryCard
              label="Review SLA"
              value={kpis.reviewSLA}
              icon="⏱️"
              color="success"
            />
          </>
        )}
      </section>

      <section className={styles.visualRow}>
        {latency.length > 0 && (
          <div className="card">
            <header className={styles.cardHeader}>
              <div>
                <h3>Latency Trends</h3>
                <p>Processing latency over time</p>
              </div>
            </header>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={latency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Legend />
                <Line type="monotone" dataKey="p95" stroke="#3b82f6" name="P95 Latency (ms)" strokeWidth={2} />
                <Line type="monotone" dataKey="p99" stroke="#ef4444" name="P99 Latency (ms)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card">
          <header className={styles.cardHeader}>
            <div>
              <h3>Decision Distribution</h3>
              <p>Distribution of outcomes</p>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie 
                data={decisionSplit} 
                dataKey="value" 
                nameKey="name" 
                innerRadius={70} 
                outerRadius={110} 
                paddingAngle={3}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {decisionSplit.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.gridSplit}>
        <div className="card">
          <header className={styles.cardHeader}>
            <div>
              <h3>Recent Transactions</h3>
              <p>Latest transaction activity</p>
            </div>
          </header>
          <TransactionsTable data={recentTransactions} />
        </div>

        <div className="card">
          <header className={styles.cardHeader}>
            <div>
              <h3>High-Risk Alerts</h3>
              <p>Most recent escalations</p>
            </div>
          </header>
          <div className={styles.alertList}>
            {alerts.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No alerts</p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <AlertListItem key={alert.id} alert={alert} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

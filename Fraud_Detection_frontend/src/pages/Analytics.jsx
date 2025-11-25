import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { api } from '../api/client.js';
import { fetchDecisionBreakdown, fetchLatencySeries } from '../services/fraudApi.js';
import styles from '../styles/Analytics.module.css';

const AnalyticsPage = () => {
  const [decisionBreakdown, setDecisionBreakdown] = useState([]);
  const [latencyData, setLatencyData] = useState([]);
  const [riskScoreDistribution, setRiskScoreDistribution] = useState([]);
  const [topRiskReasons, setTopRiskReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [breakdown, latency] = await Promise.all([
          fetchDecisionBreakdown(),
          fetchLatencySeries()
        ]);
        setDecisionBreakdown(breakdown);
        setLatencyData(latency);

        // Get recent decisions for risk score distribution
        const decisions = await api.recentDecisions(200, 0);
        const scores = (decisions.content ?? []).map(d => Math.round(d.score));
        
        // Create histogram buckets
        const buckets = Array.from({ length: 10 }, (_, i) => ({
          range: `${i * 10}-${(i + 1) * 10}`,
          count: 0
        }));
        
        scores.forEach(score => {
          const bucketIndex = Math.min(Math.floor(score / 10), 9);
          buckets[bucketIndex].count++;
        });
        
        setRiskScoreDistribution(buckets);

        // Extract top risk reasons
        const reasonsMap = new Map();
        (decisions.content ?? []).forEach(d => {
          (d.reasons ?? []).forEach(reason => {
            reasonsMap.set(reason, (reasonsMap.get(reason) || 0) + 1);
          });
        });
        
        const topReasons = Array.from(reasonsMap.entries())
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setTopRiskReasons(topReasons);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="loading" role="status" aria-live="polite">
          <span className="sr-only">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analytics}>
      <header className={styles.header}>
        <div>
          <h1>Analytics</h1>
          <p>Detailed insights and trends in fraud detection</p>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <section className={styles.chartsGrid}>
        <div className="card">
          <header className={styles.cardHeader}>
            <div>
              <h3>Decision Distribution</h3>
              <p>Breakdown by decision type</p>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={decisionBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <header className={styles.cardHeader}>
            <div>
              <h3>Risk Score Distribution</h3>
              <p>Distribution of risk scores (0-100)</p>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskScoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.chartsGrid}>
        {latencyData.length > 0 && (
          <div className="card">
            <header className={styles.cardHeader}>
              <div>
                <h3>Latency Trends</h3>
                <p>Processing latency over time</p>
              </div>
            </header>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={latencyData}>
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
              <h3>Top Risk Factors</h3>
              <p>Most frequently triggered fraud rules</p>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={topRiskReasons} 
              layout="vertical"
              margin={{ left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="reason" type="category" width={70} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;


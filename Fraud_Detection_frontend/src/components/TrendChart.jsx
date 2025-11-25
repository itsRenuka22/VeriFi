import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import styles from '../styles/TrendChart.module.css';

const formatLabel = (timestamp) =>
  new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(timestamp));

const TrendChart = ({ data }) => (
  <div className={`${styles.wrapper} card`}>
    <div className={styles.header}>
      <div>
        <h3>Latency trend</h3>
        <p>p95/p99 decision latency (ms)</p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorP99" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fb7185" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="timestamp" tickFormatter={formatLabel} />
        <YAxis />
        <Tooltip labelFormatter={formatLabel} />
        <Area type="monotone" dataKey="p95" stroke="#6366f1" fillOpacity={1} fill="url(#colorP95)" name="p95" />
        <Area type="monotone" dataKey="p99" stroke="#ef4444" fillOpacity={1} fill="url(#colorP99)" name="p99" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default TrendChart;


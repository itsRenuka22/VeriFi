import { api } from '../api/client.js';

const mapTransaction = (tx) => ({
  id: tx.id ?? tx.transactionId,
  transactionId: tx.transactionId,
  userId: tx.userId ?? 'unknown',
  merchant: tx.merchantId ?? 'unknown',
  amount: tx.amount ?? 0,
  currency: tx.currency ?? 'USD',
  decision: tx.decision ?? 'ALLOW',
  score: tx.score ?? 0,
  occurredAt: tx.occurredAt,
  reasons: tx.reasons ?? []
});

const mapAlert = (item) => ({
  id: item.transactionId,
  transactionId: item.transactionId,
  userId: item.userId,
  decision: item.decision,
  score: item.score,
  createdAt: item.evaluatedAt,
  channel: 'Fraud Service',
  reasons: item.reasons ?? []
});

export const fetchTransactions = async ({ limit, searchTerm } = {}) => {
  const data = await api.recentTransactions(limit ?? 50);
  let rows = data.map(mapTransaction);
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    rows = rows.filter(
      (tx) =>
        tx.transactionId.toLowerCase().includes(lower) ||
        tx.userId.toLowerCase().includes(lower) ||
        tx.merchant.toLowerCase().includes(lower)
    );
  }
  return rows;
};

export const fetchAlerts = async () => {
  const page = await api.highRisk(50);
  return (page.content ?? []).map(mapAlert);
};

export const fetchKpis = async () => {
  const overview = await api.overview();
  const blockRate = overview.blockRate ?? 0;
  const totalVolume = overview.totalVolume ?? 0;
  const velocity = overview.totalDecisions && overview.totalTransactions
    ? Math.round((overview.totalTransactions / 60) * 100) / 100
    : overview.totalTransactions ?? 0;
  const reviewLatency = overview.averageReviewLatencyMs ?? 0;
  return {
    totalVolume,
    velocityPerMin: velocity,
    blockRate,
    reviewSLA: reviewLatency / 1000 / 60 // minutes
  };
};

export const fetchDecisionBreakdown = async () => {
  const overview = await api.overview();
  return [
    { name: 'Allow', value: overview.allowCount ?? 0, fill: '#22c55e' },
    { name: 'Review', value: overview.reviewCount ?? 0, fill: '#f97316' },
    { name: 'Block', value: overview.blockCount ?? 0, fill: '#ef4444' }
  ];
};

export const fetchLatencySeries = async () => {
  const page = await api.recentDecisions(200, 0);
  const content = page.content ?? [];
  const buckets = new Map();
  content.forEach((item) => {
    if (!item.evaluatedAt) return;
    const bucketDate = new Date(item.evaluatedAt);
    bucketDate.setMinutes(bucketDate.getMinutes() - (bucketDate.getMinutes() % 5), 0, 0);
    const key = bucketDate.toISOString();
    const entry = buckets.get(key) ?? { timestamp: key, count: 0, totalLatency: 0 };
    entry.count += 1;
    entry.totalLatency += item.latencyMs ?? 0;
    buckets.set(key, entry);
  });
  return Array.from(buckets.values())
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((entry) => ({
      timestamp: entry.timestamp,
      p95: entry.count ? Math.round((entry.totalLatency / entry.count) * 0.95) : 0,
      p99: entry.count ? Math.round((entry.totalLatency / entry.count) * 0.99) : 0
    }));
};

export const fetchTrendMetrics = async () => {
  const overview = await api.overview();
  return [
    { label: 'Decisions', value: overview.totalDecisions ?? 0, delta: 0 },
    { label: 'Transactions', value: overview.totalTransactions ?? 0, delta: 0 },
    { label: 'Block Count', value: overview.blockCount ?? 0, delta: 0 }
  ];
};


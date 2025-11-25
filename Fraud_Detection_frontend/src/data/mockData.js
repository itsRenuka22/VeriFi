const now = new Date();

const addMinutes = (date, minutes) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() + minutes);
  return copy;
};

export const mockTransactions = [
  {
    id: 'txn_1011',
    userId: 'user-9921',
    merchant: 'Acme Electronics',
    amount: 1299.5,
    currency: 'USD',
    decision: 'BLOCK',
    score: 86,
    device: 'iPhone 15 Pro',
    location: 'San Francisco, US',
    occurredAt: addMinutes(now, -12).toISOString(),
    reasons: ['high_amount', 'new_device']
  },
  {
    id: 'txn_1010',
    userId: 'user-4208',
    merchant: 'JetStar Airlines',
    amount: 645.0,
    currency: 'USD',
    decision: 'REVIEW',
    score: 52,
    device: 'Windows Chrome',
    location: 'Tokyo, JP',
    occurredAt: addMinutes(now, -25).toISOString(),
    reasons: ['geo_impossible']
  },
  {
    id: 'txn_1009',
    userId: 'user-1884',
    merchant: 'QuickRide Mobility',
    amount: 36.75,
    currency: 'USD',
    decision: 'ALLOW',
    score: 6,
    device: 'Pixel 8a',
    location: 'New York, US',
    occurredAt: addMinutes(now, -36).toISOString(),
    reasons: []
  },
  {
    id: 'txn_1008',
    userId: 'user-1110',
    merchant: 'Global Gadgets',
    amount: 249.99,
    currency: 'USD',
    decision: 'ALLOW',
    score: 14,
    device: 'MacBook Safari',
    location: 'Austin, US',
    occurredAt: addMinutes(now, -52).toISOString(),
    reasons: ['night_time']
  },
  {
    id: 'txn_1007',
    userId: 'user-4208',
    merchant: 'JetStar Airlines',
    amount: 812.0,
    currency: 'USD',
    decision: 'BLOCK',
    score: 91,
    device: 'Windows Chrome',
    location: 'Los Angeles, US',
    occurredAt: addMinutes(now, -84).toISOString(),
    reasons: ['burst_60s', 'geo_impossible']
  },
  {
    id: 'txn_1006',
    userId: 'user-5540',
    merchant: 'FreshMart Groceries',
    amount: 112.43,
    currency: 'USD',
    decision: 'ALLOW',
    score: 9,
    device: 'iPadOS Safari',
    location: 'Seattle, US',
    occurredAt: addMinutes(now, -110).toISOString(),
    reasons: []
  },
  {
    id: 'txn_1005',
    userId: 'user-3001',
    merchant: 'CoinPay Exchange',
    amount: 5000.0,
    currency: 'USD',
    decision: 'BLOCK',
    score: 97,
    device: 'Ubuntu Firefox',
    location: 'Berlin, DE',
    occurredAt: addMinutes(now, -140).toISOString(),
    reasons: ['high_amount', 'new_ip']
  }
];

export const mockAlerts = [
  {
    id: 'alert-01',
    transactionId: 'txn_1011',
    userId: 'user-9921',
    decision: 'BLOCK',
    score: 86,
    createdAt: addMinutes(now, -10).toISOString(),
    channel: 'Slack',
    reasons: ['high_amount', 'new_device']
  },
  {
    id: 'alert-02',
    transactionId: 'txn_1010',
    userId: 'user-4208',
    decision: 'REVIEW',
    score: 52,
    createdAt: addMinutes(now, -22).toISOString(),
    channel: 'Email',
    reasons: ['geo_impossible']
  },
  {
    id: 'alert-03',
    transactionId: 'txn_1007',
    userId: 'user-4208',
    decision: 'BLOCK',
    score: 91,
    createdAt: addMinutes(now, -78).toISOString(),
    channel: 'PagerDuty',
    reasons: ['burst_60s', 'geo_impossible']
  }
];

export const latencySeries = Array.from({ length: 12 }, (_, idx) => ({
  timestamp: addMinutes(now, -idx * 15).toISOString(),
  p95: 48 + Math.random() * 30,
  p99: 90 + Math.random() * 45
})).reverse();

export const decisionBreakdown = [
  { name: 'Allow', value: mockTransactions.filter((t) => t.decision === 'ALLOW').length, fill: '#22c55e' },
  { name: 'Review', value: mockTransactions.filter((t) => t.decision === 'REVIEW').length, fill: '#f97316' },
  { name: 'Block', value: mockTransactions.filter((t) => t.decision === 'BLOCK').length, fill: '#ef4444' }
];

export const kpiOverview = {
  totalVolume: 6_854_220,
  velocityPerMin: 84,
  blockRate: 0.062,
  reviewSLA: 4.2
};

export const trendMetrics = [
  { label: 'Manual Reviews', value: 18, delta: -12 },
  { label: 'Net Loss (7d)', value: 1580, delta: -6 },
  { label: 'Chargebacks', value: 6, delta: 9 }
];


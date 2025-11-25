import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client.js';
import DecisionBadge from '../components/DecisionBadge.jsx';
import styles from '../styles/Decisions.module.css';

const decisionFilters = ['ALL', 'ALLOW', 'REVIEW', 'BLOCK'];

const DecisionsPage = () => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 25;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          size,
          ...(filter !== 'ALL' && { decision: filter })
        };
        const response = await api.recentDecisions(size, page, params);
        setDecisions(response.content ?? []);
        setTotalPages(response.totalPages ?? 0);
        setTotalElements(response.totalElements ?? 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1>Fraud Decisions</h1>
          <p>Complete history of all fraud detection decisions</p>
        </div>
        <div className={styles.filterBar}>
          <div className={styles.filterPills} role="tablist" aria-label="Decision filter">
            {decisionFilters.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleFilterChange(value)}
                className={`${styles.pill} ${filter === value ? styles.pillActive : ''}`}
                role="tab"
                aria-selected={filter === value}
              >
                {value === 'ALL' ? 'All' : <DecisionBadge decision={value} />}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Decisions</h2>
          <span aria-label={`${totalElements} total decisions`}>
            {totalElements} {totalElements === 1 ? 'decision' : 'decisions'}
          </span>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading" role="status" aria-live="polite">
              <span className="sr-only">Loading decisions...</span>
            </div>
          ) : decisions.length === 0 ? (
            <div className="empty-state" role="status" aria-live="polite">
              <div className="empty-state-icon" aria-hidden="true">⚖️</div>
              <p className="empty-state-text">No decisions found</p>
              <p className="empty-state-subtext">Decisions will appear here once transactions are processed</p>
            </div>
          ) : (
            <>
              <table role="table" aria-label="Fraud detection decisions">
                <thead>
                  <tr>
                    <th scope="col">Decision</th>
                    <th scope="col">Transaction</th>
                    <th scope="col">User</th>
                    <th scope="col">Score</th>
                    <th scope="col">Reasons</th>
                    <th scope="col">Latency (ms)</th>
                    <th scope="col">Evaluated</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((item) => (
                    <tr key={item.transactionId}>
                      <td>
                        <DecisionBadge decision={item.decision} />
                      </td>
                      <td>
                        <code aria-label={`Transaction ID: ${item.transactionId}`}>
                          {item.transactionId}
                        </code>
                      </td>
                      <td aria-label={`User ID: ${item.userId}`}>{item.userId}</td>
                      <td aria-label={`Risk score: ${Math.round(item.score)}`}>
                        <strong>{Math.round(item.score)}</strong>
                      </td>
                      <td>
                        {(item.reasons ?? []).length ? (
                          <span 
                            aria-label={`Risk reasons: ${item.reasons.join(', ')}`}
                            title={item.reasons.join(', ')}
                            className={styles.reasons}
                          >
                            {item.reasons.slice(0, 2).join(', ')}
                            {item.reasons.length > 2 && ` +${item.reasons.length - 2}`}
                          </span>
                        ) : (
                          <span aria-label="No specific reasons provided">—</span>
                        )}
                      </td>
                      <td aria-label={`Processing latency: ${item.latencyMs} milliseconds`}>
                        {item.latencyMs}ms
                      </td>
                      <td>
                        <time dateTime={item.evaluatedAt}>
                          {new Date(item.evaluatedAt).toLocaleString()}
                        </time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <span aria-label={`Page ${page + 1} of ${totalPages}`}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionsPage;


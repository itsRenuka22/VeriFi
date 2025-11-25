import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DecisionBadge from '../components/DecisionBadge.jsx';
import styles from '../styles/Users.module.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get recent decisions to extract unique users
        const decisions = await api.recentDecisions(500, 0);
        const userMap = new Map();
        
        (decisions.content ?? []).forEach(decision => {
          const userId = decision.userId;
          if (!userMap.has(userId)) {
            userMap.set(userId, {
              userId,
              totalDecisions: 0,
              allowCount: 0,
              reviewCount: 0,
              blockCount: 0,
              avgScore: 0,
              totalScore: 0
            });
          }
          
          const user = userMap.get(userId);
          user.totalDecisions++;
          if (decision.decision === 'ALLOW') user.allowCount++;
          else if (decision.decision === 'REVIEW') user.reviewCount++;
          else if (decision.decision === 'BLOCK') user.blockCount++;
          user.totalScore += decision.score || 0;
        });

        const userList = Array.from(userMap.values())
          .map(user => ({
            ...user,
            avgScore: user.totalDecisions > 0 ? user.totalScore / user.totalDecisions : 0,
            riskRate: user.totalDecisions > 0 ? ((user.reviewCount + user.blockCount) / user.totalDecisions) * 100 : 0
          }))
          .sort((a, b) => b.riskRate - a.riskRate)
          .slice(0, 50);

        setUsers(userList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const loadUserDetails = async (userId) => {
    setLoadingStats(true);
    setError(null);
    try {
      const stats = await api.getUserStats(userId);
      setUserStats(stats);
      setSelectedUser(userId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setUserStats(null);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1>User Risk Profiles</h1>
          <p>Users ranked by fraud risk and activity</p>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className={styles.content}>
        <div className="card">
          <div className="card-header">
            <h2>Top Users by Risk</h2>
            <span>{users.length} users</span>
          </div>
          <div className="table-wrapper">
            {loading ? (
              <div className="loading" role="status" aria-live="polite">
                <span className="sr-only">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state" role="status" aria-live="polite">
                <div className="empty-state-icon" aria-hidden="true">👥</div>
                <p className="empty-state-text">No users found</p>
              </div>
            ) : (
              <table role="table" aria-label="User risk profiles">
                <thead>
                  <tr>
                    <th scope="col">User ID</th>
                    <th scope="col">Total Decisions</th>
                    <th scope="col">Risk Rate</th>
                    <th scope="col">Avg Score</th>
                    <th scope="col">Allow</th>
                    <th scope="col">Review</th>
                    <th scope="col">Block</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <code>{user.userId}</code>
                      </td>
                      <td>{user.totalDecisions}</td>
                      <td>
                        <strong className={user.riskRate > 30 ? styles.highRisk : user.riskRate > 10 ? styles.mediumRisk : styles.lowRisk}>
                          {user.riskRate.toFixed(1)}%
                        </strong>
                      </td>
                      <td>{Math.round(user.avgScore)}</td>
                      <td>
                        <span className={styles.count}>{user.allowCount}</span>
                      </td>
                      <td>
                        <span className={styles.count}>{user.reviewCount}</span>
                      </td>
                      <td>
                        <span className={styles.count}>{user.blockCount}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => loadUserDetails(user.userId)}
                          className={styles.viewButton}
                          aria-label={`View details for user ${user.userId}`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Enhanced User Details Modal */}
        {selectedUser && (
          <div className={styles.modalOverlay} onClick={closeUserDetails}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>User Details: <code>{selectedUser}</code></h2>
                <button
                  type="button"
                  onClick={closeUserDetails}
                  className={styles.closeButton}
                  aria-label="Close user details"
                >
                  ×
                </button>
              </div>

              {loadingStats ? (
                <div className="loading">Loading user statistics...</div>
              ) : userStats ? (
                <div className={styles.userDetails}>
                  {/* Summary Cards */}
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Total Decisions</div>
                      <div className={styles.statValue}>{userStats.totalDecisions}</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Risk Rate</div>
                      <div className={`${styles.statValue} ${userStats.riskRate > 30 ? styles.highRisk : userStats.riskRate > 10 ? styles.mediumRisk : styles.lowRisk}`}>
                        {userStats.riskRate.toFixed(1)}%
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Average Score</div>
                      <div className={styles.statValue}>{Math.round(userStats.averageScore)}</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Total Volume</div>
                      <div className={styles.statValue}>
                        ${userStats.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Decision Breakdown */}
                  <div className={styles.decisionBreakdown}>
                    <h3>Decision Breakdown</h3>
                    <div className={styles.breakdownGrid}>
                      <div className={styles.breakdownItem}>
                        <span className={styles.breakdownLabel}>Allow:</span>
                        <span className={styles.breakdownValue}>{userStats.allowCount}</span>
                      </div>
                      <div className={styles.breakdownItem}>
                        <span className={styles.breakdownLabel}>Review:</span>
                        <span className={styles.breakdownValue}>{userStats.reviewCount}</span>
                      </div>
                      <div className={styles.breakdownItem}>
                        <span className={styles.breakdownLabel}>Block:</span>
                        <span className={styles.breakdownValue}>{userStats.blockCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  {(userStats.firstTransactionAt || userStats.lastTransactionAt) && (
                    <div className={styles.activityInfo}>
                      <h3>Activity Timeline</h3>
                      <div className={styles.timelineItem}>
                        <strong>First Transaction:</strong>{' '}
                        {userStats.firstTransactionAt 
                          ? new Date(userStats.firstTransactionAt).toLocaleString()
                          : 'N/A'}
                      </div>
                      <div className={styles.timelineItem}>
                        <strong>Last Transaction:</strong>{' '}
                        {userStats.lastTransactionAt 
                          ? new Date(userStats.lastTransactionAt).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                  )}

                  {/* Recent Decisions */}
                  {userStats.recentDecisions && userStats.recentDecisions.length > 0 && (
                    <div className={styles.recentDecisions}>
                      <h3>Recent Decisions</h3>
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Decision</th>
                              <th>Transaction ID</th>
                              <th>Score</th>
                              <th>Reasons</th>
                              <th>Evaluated At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userStats.recentDecisions.map((decision) => (
                              <tr key={decision.transactionId}>
                                <td><DecisionBadge decision={decision.decision} /></td>
                                <td><code>{decision.transactionId}</code></td>
                                <td>{Math.round(decision.score)}</td>
                                <td>{(decision.reasons || []).join(', ') || '—'}</td>
                                <td>{new Date(decision.evaluatedAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="error-banner">Failed to load user statistics</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;


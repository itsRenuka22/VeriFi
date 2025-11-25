import DecisionBadge from './DecisionBadge.jsx';
import styles from '../styles/AlertListItem.module.css';

const timeAgo = (iso) => {
  const minutes = Math.round((Date.now() - new Date(iso).valueOf()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
};

const AlertListItem = ({ alert }) => (
  <article className={styles.item}>
    <div>
      <div className={styles.header}>
        <DecisionBadge decision={alert.decision} />
        <span className={styles.score}>{Math.round(alert.score)} pts</span>
      </div>
      <p className={styles.meta}>
        Tx <strong>{alert.transactionId}</strong> · User <strong>{alert.userId}</strong> · via {alert.channel}
      </p>
      <div className={styles.reasons}>
        {alert.reasons.map((reason) => (
          <span key={reason} className={styles.reason}>
            {reason}
          </span>
        ))}
      </div>
    </div>
    <time dateTime={alert.createdAt}>{timeAgo(alert.createdAt)}</time>
  </article>
);

export default AlertListItem;


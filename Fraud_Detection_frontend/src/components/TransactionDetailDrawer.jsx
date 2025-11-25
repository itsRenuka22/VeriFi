import DecisionBadge from './DecisionBadge.jsx';
import styles from '../styles/TransactionDetailDrawer.module.css';

const TransactionDetailDrawer = ({ transaction, onClose }) => {
  if (!transaction) return null;
  return (
    <aside className={styles.drawer} role="dialog" aria-modal="true">
      <button type="button" onClick={onClose} className={styles.close}>
        ✕
      </button>
      <div className={styles.header}>
        <h2>{transaction.id}</h2>
        <DecisionBadge decision={transaction.decision} />
      </div>
      <p className={styles.subtitle}>
        User <strong>{transaction.userId}</strong> · {transaction.location}
      </p>
      <section className={styles.section}>
        <h3>Payment</h3>
        <ul>
          <li>
            Amount <span>${transaction.amount.toLocaleString()}</span>
          </li>
          <li>
            Merchant <span>{transaction.merchant}</span>
          </li>
          <li>
            Device <span>{transaction.device}</span>
          </li>
        </ul>
      </section>
      <section className={styles.section}>
        <h3>Detection signals</h3>
        <div className={styles.reasons}>
          {transaction.reasons.length === 0 && <span className={styles.reason}>no anomalies</span>}
          {transaction.reasons.map((reason) => (
            <span key={reason} className={styles.reason}>
              {reason}
            </span>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h3>Notes</h3>
        <p className={styles.note}>
          This transaction is generated from mock data. Replace with your API response to power the production UI.
        </p>
      </section>
    </aside>
  );
};

export default TransactionDetailDrawer;


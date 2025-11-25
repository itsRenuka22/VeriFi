import styles from '../styles/SummaryCard.module.css';

const formatNumber = (value, opts = {}) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, ...opts }).format(value);

const SummaryCard = ({ label, value, unit, delta, icon, color = 'accent' }) => {
  const trendClass = delta === undefined ? '' : delta >= 0 ? styles.positive : styles.negative;
  const formattedValue =
    typeof value === 'number'
      ? unit === 'currency'
        ? `$${formatNumber(value, { maximumFractionDigits: 0 })}`
        : unit === 'percent'
        ? `${formatNumber(value * 100, { maximumFractionDigits: 1 })}%`
        : formatNumber(value)
      : value;

  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.meta}>
        <p className={styles.label}>{label}</p>
        <h3 className={styles.value}>{formattedValue}</h3>
      </div>
      {delta !== undefined && (
        <span className={`${styles.delta} ${trendClass}`}>
          {delta >= 0 ? '+' : ''}
          {formatNumber(delta, { maximumFractionDigits: 1 })}%
        </span>
      )}
    </div>
  );
};

export default SummaryCard;


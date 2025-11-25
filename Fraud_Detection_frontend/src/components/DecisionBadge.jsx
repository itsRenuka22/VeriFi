import styles from '../styles/DecisionBadge.module.css';

const colorMap = {
  ALLOW: 'allow',
  REVIEW: 'review',
  BLOCK: 'block'
};

const DecisionBadge = ({ decision }) => {
  const tone = colorMap[decision] ?? 'allow';
  return <span className={`${styles.badge} ${styles[tone]}`}>{decision}</span>;
};

export default DecisionBadge;


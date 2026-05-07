import { useState } from 'react';
import withHydration from '../../common/hydrateFragment';
import styles from './DemoFragment.module.scss';

const TOTAL_STARS = 5;

const DemoFragment = () => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }
    alert('Rating submitted successfully');
  };

  return (
    <div className={styles.rating}>
      <h2 className={styles.title}>Rate your experience</h2>
      <div
        className={styles.stars}
        onMouseLeave={() => setHovered(0)}
        role="radiogroup"
        aria-label="Rating"
      >
        {Array.from({ length: TOTAL_STARS }, (_, i) => {
          const value = i + 1;
          const active = value <= (hovered || rating);
          return (
            <button
              key={value}
              type="button"
              className={`${styles.star} ${active ? styles.active : ''}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
              aria-checked={rating === value}
              role="radio"
            >
              ★
            </button>
          );
        })}
      </div>
      <button type="button" className={styles.submit} onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export const mountId = 'DemoFragment';
export { getServerData } from './DemoFragment.server.';
export default withHydration(DemoFragment, mountId);

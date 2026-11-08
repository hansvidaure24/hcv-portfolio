import styles from './Bio.module.scss';
import BioDashboard from './BioDashboard';
import ParallaxSection from '../../scene/ParallaxSection';
import type { TrainerStats } from '../../../lib/github';

export default function Bio({ trainer }: { trainer: TrainerStats | null }) {
  return (
    <ParallaxSection id="about" bgClassName={styles.bioBg} contentClassName={styles.bioContainer}>
      <BioDashboard trainer={trainer} />
    </ParallaxSection>
  );
}

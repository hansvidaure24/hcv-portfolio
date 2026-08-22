import styles from './Bio.module.scss';
import BioDashboard from './BioDashboard';
import ParallaxSection from '../../scene/ParallaxSection';

export default function Bio() {
  return (
    <ParallaxSection id="about" bgClassName={styles.bioBg} contentClassName={styles.bioContainer}>
      <BioDashboard />
    </ParallaxSection>
  );
}

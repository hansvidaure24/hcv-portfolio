import styles from '../app/scss/Hero.module.scss';

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.circle}>
        <video
          className={styles.heroVideo}
          src="/videos/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Hans Chandler Vidaure</h1>
          <p className={styles.heroSubtitle}>Crafting seamless digital experiences with code and creativity.</p>
        </div>
      </div>
    </section>
  );
}
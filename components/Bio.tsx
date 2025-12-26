
"use client";
import styles from '../app/scss/Bio.module.scss';

export default function Bio() {
  return (
    <section id="about" className={styles.bioSection}>
      <div className={styles.bioContainer}>
        <h1 id="about" className={styles.bioTitle}>
          Some things about me📋
        </h1>
        <div className={styles.bioRow}>
          <div className={styles.bioVideo}>
            <video
              src="/videos/video1.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="object-cover w-full h-full"
            />
          </div>
          <div className={styles.bioCard}>
            <p className={styles.bioText}>
              My name is Hans Chandler Vidaure.
            </p>
            <p className={styles.bioText}>
              I&apos;m a software developer with experience building and refining user-facing applications. I focus on writing clean, maintainable code and creating intuitive, well-structured user interfaces.
            </p>
          </div>
        </div>
        <div className={styles.bioRow}>
          <div className={styles.bioCard + ' ' + styles.alt}>
            <p className={styles.bioText}>
              I have hands-on experience with JavaScript and C#, and have built projects using .Net, React, SCSS, and Tailwind CSS. As I continue exploring my career path, my long-term goal is to become a game developer, where I can combine creativity with technical problem-solving. In that space, I have created self projects with Unity and Unreal Engine, developing gameplay systems and interactive experiences.
            </p>
            <p className={styles.bioText}>
              I&apos;m also actively growing as a software developer and enjoy building reliable, scalable solutions across different platforms. I&apos;m excited to connect with others in the tech community and explore new opportunities.
            </p>
          </div>
          <div className={styles.bioVideo}>
            <video
              src="/videos/video2.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
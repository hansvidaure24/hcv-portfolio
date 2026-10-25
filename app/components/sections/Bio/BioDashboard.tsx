import LazyVideo from "../../ui/LazyVideo";
import styles from "./BioDashboard.module.scss";

const SKILL_GROUPS = [
  { label: "AT WORK", skills: ["C#", "ASP.NET", "React", "SQL"] },
  { label: "ALSO", skills: ["TypeScript", "Next.js", "Java / Spring Boot", "Python", "Unity"] },
];

const ORIGIN_PARAGRAPHS = [
  "I'm a full-stack engineer at Fiserv, working on an enterprise online banking platform used by retail and business customers. Most days that means C#/ASP.NET APIs, React UI and SQL, plus the parts that keep a bank safe: security fixes, concurrency bugs and production incidents.",
  "I grew up in the Philippines and got into programming through video games. I still build games in Unity for fun, which is where Wakebound, my co-op action RPG, comes from.",
];

const LOOKING_FOR = "Looking for a team where I own features end to end, from API to UI, and grow toward a senior role.";

const QUEST_LOG = [
  "Shipped 10+ features and third-party integrations across C#, ASP.NET, React and SQL",
  "Fixed thread-safety and cache-isolation defects in a multi-account download feature running against five banking cores",
  "Replaced hand-maintained routing tables with a scheduled sync job covering 24,000+ ACH and wire records",
  "Remediated 1,150+ Fortify security findings during feature work",
  "Wrote standardized incident runbooks that improved cross-team incident response",
];

export default function BioDashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>TRAINER PROFILE</h2>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.panel} ${styles.trainerPanel}`}>
          <div className={styles.panelBody}>
            <div className={styles.idRow}>
              <span>NO. 001</span>
              <span>TRAINER</span>
            </div>
            <div className={styles.portrait}>
              <LazyVideo src="/videos/bio-photos.mp4" poster="/videos/bio-photos.jpg" />
            </div>
            <div className={styles.nameplate}>
              <div className={styles.name}>HANS VIDAURE</div>
            </div>
            <p className={styles.tagline}>{LOOKING_FOR}</p>
            <div className={styles.miniRow}>
              <div className={styles.miniCell}>
                <div className={styles.miniLabel}>INTERESTS</div>
                <div className={styles.interestTags}>
                  <span className={`${styles.interestTag} ${styles.tagCode}`}>Full-stack engineering</span>
                  <span className={`${styles.interestTag} ${styles.tagSecurity}`}>Application security</span>
                  <span className={`${styles.interestTag} ${styles.tagGame}`}>Game dev (hobby)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.panel} ${styles.storyPanel}`}>
          <h3 className={styles.panelHeader}>HOW I GOT HERE</h3>
          <div className={styles.panelBody}>
            {ORIGIN_PARAGRAPHS.map((p, i) => (
              <p key={i} className={styles.storyText}>{p}</p>
            ))}
          </div>
        </div>

        <div className={`${styles.panel} ${styles.questPanel}`}>
          <h3 className={styles.panelHeader}>WHAT I&apos;VE SHIPPED AT FISERV</h3>
          <div className={styles.panelBody}>
            <div className={styles.questLog}>
              {QUEST_LOG.map((item) => (
                <div key={item} className={styles.questItem}>
                  <span className={styles.questBullet}>{">"}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.panel} ${styles.statsPanel}`}>
          <h3 className={styles.panelHeader}>SKILLS</h3>
          <div className={styles.panelBody}>
            <div className={styles.questClip}>
              <LazyVideo src="/videos/bio-thoughts.mp4" poster="/videos/bio-thoughts.jpg" />
            </div>
            <dl className={styles.skillGroups}>
              {SKILL_GROUPS.map((group) => (
                <div key={group.label} className={styles.skillGroup}>
                  <dt className={styles.skillLabel}>{group.label}</dt>
                  <dd className={styles.skillList}>
                    {group.skills.map((skill) => (
                      <span key={skill} className={styles.skillItem}>
                        {skill}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

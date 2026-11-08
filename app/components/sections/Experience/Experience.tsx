import Link from "next/link";
import ParallaxSection from "../../scene/ParallaxSection";
import PixelPanel from "../../ui/PixelPanel";
import SectionHeading from "../../ui/SectionHeading";
import styles from "./Experience.module.scss";

// Same facts as the resume (app/data/resume.ts); keep the two in sync. General
// responsibilities only: specifics about Fiserv's systems, performance or
// security need its review before they can be public.
const HIGHLIGHTS = [
  "Build full-stack online banking features for retail and business customers, with REST APIs and React UI in C#, ASP.NET and SQL",
  "Take features through peer review, regression testing and release",
  "Support production issues from triage to resolution, and document runbooks for the team",
];

const ROLES = [
  { title: "Software Development Engineer", when: "Jan 2024 – now" },
  { title: "Technical Trainee", when: "Sep 2023 – Jan 2024" },
];

/** Professional work comes first: it's the evidence a recruiter came for. */
export default function Experience() {
  return (
    <ParallaxSection id="experience" bgClassName={styles.experienceBg} contentClassName={styles.experienceContent}>
      <div className={styles.inner}>
        <SectionHeading>Experience</SectionHeading>
        <PixelPanel title="Fiserv" titleAside="3 YRS" bodyClassName={styles.body}>
          <div className={styles.summary}>
            <ul className={styles.roles}>
              {ROLES.map((role) => (
                <li key={role.title}>
                  <span className={styles.roleTitle}>{role.title}</span>
                  <span className={styles.roleWhen}>{role.when}</span>
                </li>
              ))}
            </ul>
            <p className={styles.about}>
              Online banking features for retail and business customers, in C#, ASP.NET, React and SQL.
            </p>
            <Link href="/resume" className={styles.resumeLink}>
              Full resume <span aria-hidden="true">▶</span>
            </Link>
          </div>
          <ul className={styles.highlights}>
            {HIGHLIGHTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PixelPanel>
      </div>
    </ParallaxSection>
  );
}

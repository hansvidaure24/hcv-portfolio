import type { Metadata } from "next";
import Link from "next/link";
import TopBar from "../components/navigation/TopBar";
import PixelPanel from "../components/ui/PixelPanel";
import { RESUME, type ResumeEntry } from "../data/resume";
import { CONTACT_EMAIL, RESUME_URL } from "../lib/site";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Resume — Hans Vidaure",
  description: RESUME.summary,
  alternates: { canonical: "/resume" },
  openGraph: { title: "Resume — Hans Vidaure", description: RESUME.summary },
};

function Entry({ entry }: { entry: ResumeEntry }) {
  return (
    <div className={styles.entry}>
      <div className={styles.row}>
        <h3 className={styles.what}>
          {entry.name}
          {entry.detail && <span className={styles.detail}> — {entry.detail}</span>}
        </h3>
        {entry.when && <p className={styles.when}>{entry.when}</p>}
      </div>
      {(entry.stack || entry.links?.length || entry.caseStudy) && (
        <p className={styles.sub}>
          {entry.stack && <span className={styles.stack}>{entry.stack}</span>}
          {entry.caseStudy && (
            <Link href={`/projects/${entry.caseStudy}`} className={styles.inlineLink}>
              Case study
            </Link>
          )}
          {entry.links?.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
              {link.label}
            </a>
          ))}
        </p>
      )}
      {entry.points.length > 0 && (
        <ul className={styles.points}>
          {entry.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Quick view: the resume as one plain, fast page for a recruiter's first
 * pass, with the PDF one click away. Prints cleanly with Ctrl+P.
 */
export default function ResumePage() {
  return (
    <>
    <TopBar />
    <main className={styles.page}>
      <nav className={styles.topNav} aria-label="Breadcrumb">
        <Link href="/" className={styles.back}>
          <span aria-hidden="true">←</span> Home
        </Link>
      </nav>

      <PixelPanel as="article" className={styles.article} bodyClassName={styles.body}>
        <header className={styles.header}>
          <p className={styles.kind}>Quick view · Resume</p>
          <h1 className={styles.name}>{RESUME.name}</h1>
          <p className={styles.headline}>{RESUME.headline}</p>
          <p className={styles.contact}>
            <span>{RESUME.location}</span>
            {RESUME.contact.map((c) => (
              <a key={c.href} href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {c.label}
              </a>
            ))}
          </p>
          <div className={styles.actions}>
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className={styles.pdfButton}>
              Download PDF <span aria-hidden="true">▶</span>
            </a>
            <Link href="/#projects" className={styles.secondaryButton}>
              See the projects
            </Link>
          </div>
        </header>

        <section aria-labelledby="resume-summary">
          <h2 id="resume-summary" className={styles.heading}>Summary</h2>
          <p className={styles.summary}>{RESUME.summary}</p>
        </section>

        <section aria-labelledby="resume-experience">
          <h2 id="resume-experience" className={styles.heading}>Experience</h2>
          {RESUME.experience.map((entry) => (
            <Entry key={`${entry.name}-${entry.when}`} entry={entry} />
          ))}
        </section>

        <section aria-labelledby="resume-projects">
          <h2 id="resume-projects" className={styles.heading}>Projects</h2>
          {RESUME.projects.map((entry) => (
            <Entry key={entry.name} entry={entry} />
          ))}
        </section>

        <section aria-labelledby="resume-education">
          <h2 id="resume-education" className={styles.heading}>Education</h2>
          {RESUME.education.map((entry) => (
            <Entry key={entry.name} entry={entry} />
          ))}
        </section>

        <section aria-labelledby="resume-leadership">
          <h2 id="resume-leadership" className={styles.heading}>Leadership</h2>
          {RESUME.leadership.map((entry) => (
            <Entry key={entry.name} entry={entry} />
          ))}
        </section>

        <section aria-labelledby="resume-skills">
          <h2 id="resume-skills" className={styles.heading}>Skills</h2>
          <dl className={styles.skills}>
            {RESUME.skills.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.text}</dd>
              </div>
            ))}
          </dl>
        </section>
        <footer className={styles.cta}>
          <p className={styles.ctaTitle}>Want to work together?</p>
          <div className={styles.ctaLinks}>
            <Link href="/#contact" className={styles.ctaButton}>
              Contact
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className={styles.ctaButton}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </footer>
      </PixelPanel>
    </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import TopBar from "../components/navigation/TopBar";
import PixelPanel from "../components/ui/PixelPanel";
import { formatNoteDate, getNotes } from "../data/notes";
import { getProject } from "../data/projects";
import { CONTACT_EMAIL } from "../lib/site";
import styles from "./notes.module.scss";

const DESCRIPTION = "Short write-ups from building things: what broke, what I measured, and what I'd do differently.";

export const metadata: Metadata = {
  title: "Field notes — Hans Vidaure",
  description: DESCRIPTION,
  alternates: { canonical: "/notes" },
  openGraph: { title: "Field notes — Hans Vidaure", description: DESCRIPTION },
};

export default function NotesPage() {
  const notes = getNotes();

  return (
    <>
    <TopBar />
    <main className={styles.page}>
      <nav className={styles.topNav} aria-label="Breadcrumb">
        <Link href="/" className={styles.back}>
          <span aria-hidden="true">←</span> Home
        </Link>
      </nav>

      <div className={styles.list}>
        <header className={styles.listHeader}>
          <h1 className={styles.listTitle}>Field notes</h1>
          <p className={styles.listIntro}>{DESCRIPTION}</p>
        </header>

        <ol className={styles.entries}>
          {notes.map((note) => {
            const project = note.project ? getProject(note.project) : undefined;
            return (
              <li key={note.slug}>
                <PixelPanel as="article" bodyClassName={styles.entry}>
                  <p className={styles.kind}>
                    <time dateTime={note.date}>{formatNoteDate(note.date)}</time>
                    {project && <> · {project.title}</>}
                    {!note.published && <> · DRAFT</>}
                  </p>
                  <h2 className={styles.entryTitle}>
                    <Link href={`/notes/${note.slug}`}>{note.title}</Link>
                  </h2>
                  <p className={styles.summary}>{note.summary}</p>
                  <Link href={`/notes/${note.slug}`} className={styles.readButton} aria-hidden="true" tabIndex={-1}>
                    Read <span>▶</span>
                  </Link>
                </PixelPanel>
              </li>
            );
          })}
        </ol>

        <footer className={styles.cta}>
          <p className={styles.ctaTitle}>Hiring for a full-stack role?</p>
          <div className={styles.ctaLinks}>
            <Link href="/resume" className={styles.ctaButton}>
              Resume
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className={styles.ctaButton}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </footer>
      </div>
    </main>
    </>
  );
}

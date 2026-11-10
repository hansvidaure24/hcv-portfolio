import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TopBar from "../../components/navigation/TopBar";
import PixelPanel from "../../components/ui/PixelPanel";
import ProjectDescription from "../../components/sections/Projects/ProjectDescription";
import { formatNoteDate, getNote, getNoteBody, getNotes } from "../../data/notes";
import { getProject } from "../../data/projects";
import { CONTACT_EMAIL } from "../../lib/site";
import { pageMetadata } from "../../lib/pageMetadata";
import styles from "../notes.module.scss";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getNotes().map((n) => ({ slug: n.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return pageMetadata({
    title: `${note.title} — Hans Vidaure`,
    description: note.summary,
    path: `/notes/${note.slug}`,
    publishedTime: note.date,
  });
}

export default async function NotePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();
  const project = note.project ? getProject(note.project) : undefined;

  return (
    <>
    <TopBar />
    <main className={styles.page}>
      <nav className={styles.topNav} aria-label="Breadcrumb">
        <Link href="/notes" className={styles.back}>
          <span aria-hidden="true">←</span> All field notes
        </Link>
      </nav>

      <PixelPanel as="article" className={styles.article}>
        {!note.published && (
          <p className={styles.draftBanner} role="note">
            DRAFT: only visible in dev. Set <code>published: true</code> in app/data/notes.ts to make it public.
          </p>
        )}
        <header className={styles.header}>
          <p className={styles.kind}>
            Field note · <time dateTime={note.date}>{formatNoteDate(note.date)}</time>
          </p>
          <h1 className={styles.title}>{note.title}</h1>
          <p className={styles.summary}>{note.summary}</p>
          {(project || note.original) && (
            <p className={styles.related}>
              {project && (
                <Link href={`/projects/${project.slug}`}>
                  From the {project.title} case study <span aria-hidden="true">→</span>
                </Link>
              )}
              {note.original && (
                <a href={note.original.href} target="_blank" rel="noopener noreferrer">
                  {note.original.label} <span aria-hidden="true">↗</span>
                </a>
              )}
            </p>
          )}
        </header>

        <ProjectDescription text={getNoteBody(note.slug)} />

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
      </PixelPanel>
    </main>
    </>
  );
}

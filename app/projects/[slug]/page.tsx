import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjectBody, getPublishedProjects } from "../../data/projects";
import PixelPanel from "../../components/ui/PixelPanel";
import ProjectMedia from "../../components/sections/Projects/ProjectMedia";
import ProjectDescription from "../../components/sections/Projects/ProjectDescription";
import { ProjectLinks } from "../../components/sections/Projects/ProjectCard";
import { CONTACT_EMAIL, RESUME_URL } from "../../lib/site";
import styles from "./page.module.scss";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getPublishedProjects().map((p) => ({ slug: p.slug }));
}

// Drafts and unknown slugs 404 instead of rendering on demand.
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Hans Vidaure`,
    description: project.tagline,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title} — Hans Vidaure`, description: project.tagline },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const body = getProjectBody(project.slug);

  return (
    <main className={styles.page}>
      <nav className={styles.topNav} aria-label="Breadcrumb">
        <Link href="/#projects" className={styles.back}>
          <span aria-hidden="true">←</span> All projects
        </Link>
        <Link href="/" className={styles.brand}>
          HANS VIDAURE
        </Link>
      </nav>

      <PixelPanel as="article" className={styles.article}>
        <header className={styles.header}>
          <p className={styles.kind}>{project.kind}</p>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.tagline}>{project.tagline}</p>

          <dl className={styles.meta}>
            {project.role && (
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
            )}
            <div>
              <dt>Stack</dt>
              <dd>{project.stack.join(" · ")}</dd>
            </div>
          </dl>

          <ProjectLinks project={project} showCaseStudy={false} />
        </header>

        {project.cover && (
          <div className={styles.media}>
            <ProjectMedia
              title={project.title}
              cover={project.cover}
              video={project.video}
              sizes="(max-width: 840px) 92vw, 760px"
            />
          </div>
        )}

        <ProjectDescription text={body} />

        <footer className={styles.cta}>
          <p className={styles.ctaTitle}>Hiring for a full-stack role?</p>
          <div className={styles.ctaLinks}>
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
              Resume (PDF)
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className={styles.ctaButton}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </footer>
      </PixelPanel>
    </main>
  );
}

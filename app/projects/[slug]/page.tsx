import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDraftProjects, getProject, getProjectBody, getPublishedProjects } from "../../data/projects";
import PixelPanel from "../../components/ui/PixelPanel";
import TopBar from "../../components/navigation/TopBar";
import ProjectMedia from "../../components/sections/Projects/ProjectMedia";
import ProjectDescription from "../../components/sections/Projects/ProjectDescription";
import CaseStudyTabs, { type CaseStudyTab } from "../../components/sections/Projects/CaseStudyTabs";
import StatBars from "../../components/sections/Projects/StatBars";
import { morphNames } from "../../lib/morphNavigation";
import { ProjectLinks } from "../../components/sections/Projects/ProjectCard";
import { CONTACT_EMAIL, RESUME_URL } from "../../lib/site";
import styles from "./page.module.scss";

type Params = { slug: string };

type TabId = "overview" | "decisions" | "results";

const TAB_LABELS: Record<TabId, string> = { overview: "Overview", decisions: "Decisions", results: "Results" };

// Which tab each write-up heading belongs to. Unknown headings (and the intro
// above the first heading) go to Overview.
const TAB_FOR_HEADING: Record<string, TabId> = {
  "Problem": "overview",
  "Constraints": "overview",
  "What I built": "overview",
  "Why it wasn't a simple version bump": "overview",
  "Key decisions": "decisions",
  "What I did": "decisions",
  "Trade-off": "decisions",
  "What was hard": "decisions",
  "The bug I found on the way": "decisions",
  "By the numbers": "results",
  "Results": "results",
  "What I learned": "results",
  "Built with": "results",
};

/** Splits a write-up into the three tabs, keeping each section's Markdown as-is. */
function splitIntoTabs(body: string): Record<TabId, string> {
  const parts: Record<TabId, string[]> = { overview: [], decisions: [], results: [] };
  let current: TabId = "overview";
  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    const heading = line.match(/^## (.+)$/);
    if (heading) current = TAB_FOR_HEADING[heading[1]!.trim()] ?? "overview";
    parts[current].push(line);
  }
  return {
    overview: parts.overview.join("\n").trim(),
    decisions: parts.decisions.join("\n").trim(),
    results: parts.results.join("\n").trim(),
  };
}

export function generateStaticParams(): Params[] {
  // Drafts are only added under `next dev`; production builds get published projects alone.
  return [...getPublishedProjects(), ...getDraftProjects()].map((p) => ({ slug: p.slug }));
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
  const sections = splitIntoTabs(body);
  const tabs: CaseStudyTab[] = (Object.keys(TAB_LABELS) as TabId[])
    .filter((id) => sections[id] || (id === "results" && project.stats?.length))
    .map((id) => ({
      id,
      label: TAB_LABELS[id],
      content: (
        <>
          {id === "results" && project.stats?.length ? <StatBars stats={project.stats} /> : null}
          {sections[id] && <ProjectDescription text={sections[id]} />}
        </>
      ),
    }));

  return (
    <main className={styles.page}>
      <TopBar />
      <nav className={styles.topNav} aria-label="Breadcrumb">
        <Link href="/#projects" className={styles.back}>
          <span aria-hidden="true">←</span> All projects
        </Link>
      </nav>

      <PixelPanel as="article" className={styles.article}>
        {!project.published && (
          <p className={styles.draftBanner} role="note">
            DRAFT: only visible in dev. Set <code>published: true</code> in app/data/projects.ts to make it public.
          </p>
        )}
        <header className={styles.header}>
          <p className={styles.kind}>{project.kind}</p>
          <h1 className={styles.title} style={{ viewTransitionName: morphNames.title(project.slug) }}>
            {project.title}
          </h1>
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
              transitionName={morphNames.media(project.slug)}
              priority
            />
          </div>
        )}

        {tabs.length > 0 && <CaseStudyTabs tabs={tabs} />}

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

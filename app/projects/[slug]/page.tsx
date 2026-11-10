import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDraftProjects, getProject, getProjectBody, getPublishedProjects } from "../../data/projects";
import PixelPanel from "../../components/ui/PixelPanel";
import TopBar from "../../components/navigation/TopBar";
import ProjectMedia from "../../components/sections/Projects/ProjectMedia";
import ProjectDescription from "../../components/sections/Projects/ProjectDescription";
import StatBars from "../../components/sections/Projects/StatBars";
import SystemDiagram from "../../components/sections/Projects/SystemDiagram";
import { DIAGRAMS } from "../../data/diagrams";
import { morphNames } from "../../lib/morphNavigation";
import { ProjectLinks } from "../../components/sections/Projects/ProjectCard";
import { CONTACT_EMAIL, RESUME_URL } from "../../lib/site";
import { pageMetadata } from "../../lib/pageMetadata";
import { dexEntryFor, dexHash } from "../../data/dex";
import styles from "./page.module.scss";

type Params = { slug: string };

type SectionId = "overview" | "decisions" | "results";

// One page in three parts, with links to jump between them. (They were tabs,
// but then the decisions, what a hiring manager most wants to read, were a
// click away and easy to miss.)
const SECTION_TITLES: Record<SectionId, string> = { overview: "Overview", decisions: "Decisions", results: "Results" };

// Which part each write-up heading belongs to. Unknown headings (and the
// intro above the first heading) go to Overview.
const SECTION_FOR_HEADING: Record<string, SectionId> = {
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

/** Splits a write-up into its three parts, keeping each part's Markdown as-is. */
function splitIntoSections(body: string): Record<SectionId, string> {
  const parts: Record<SectionId, string[]> = { overview: [], decisions: [], results: [] };
  let current: SectionId = "overview";
  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    const heading = line.match(/^## (.+)$/);
    if (heading) current = SECTION_FOR_HEADING[heading[1]!.trim()] ?? "overview";
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
  // The preview image is this route's own (opengraph-image.tsx, twitter-image.tsx).
  return pageMetadata({
    title: `${project.title} — Hans Vidaure`,
    description: project.tagline,
    path: `/projects/${project.slug}`,
    ownImage: true,
  });
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const body = getProjectBody(project.slug);
  // The next case study, in the home page's order, back round to the first.
  const published = getPublishedProjects();
  const next = published[(published.findIndex((p) => p.slug === project.slug) + 1) % published.length];
  const text = splitIntoSections(body);
  const diagram = DIAGRAMS[project.slug];
  const sections = (Object.keys(SECTION_TITLES) as SectionId[]).filter(
    (id) => text[id] || (id === "results" && project.stats?.length),
  );

  return (
    <>
    <TopBar />
    <main className={styles.page}>
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
              <dd>
                {/* Each skill links to its proof in the home page's SKILL DEX. */}
                {project.stack.map((tech, i) => {
                  const entry = dexEntryFor(tech);
                  return (
                    <span key={tech}>
                      {i > 0 && " · "}
                      {entry ? (
                        <Link href={`/${dexHash(entry)}`} className={styles.stackLink}>
                          {tech}
                        </Link>
                      ) : (
                        tech
                      )}
                    </span>
                  );
                })}
              </dd>
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

        {sections.length > 1 && (
          <nav className={styles.jump} aria-label="On this page">
            {sections.map((id) => (
              <a key={id} href={`#${id}`} className={styles.jumpLink}>
                {SECTION_TITLES[id]}
              </a>
            ))}
          </nav>
        )}

        {sections.map((id) => (
          <section key={id} id={id} aria-labelledby={`${id}-title`} className={styles.section}>
            <h2 id={`${id}-title`} className={styles.sectionTitle}>
              {SECTION_TITLES[id]}
            </h2>
            {id === "results" && project.stats?.length ? <StatBars stats={project.stats} /> : null}
            {text[id] && <ProjectDescription text={text[id]} headingLevel={3} />}
            {/* How the parts fit together, before the decisions that shaped them. */}
            {id === "overview" && diagram && <SystemDiagram diagram={diagram} />}
          </section>
        ))}

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

      {/* Keep reading instead of ending at a dead end. */}
      <nav className={styles.moreNav} aria-label="More case studies">
        <Link href="/#projects" className={styles.back}>
          <span aria-hidden="true">←</span> All projects
        </Link>
        {next && next.slug !== project.slug && (
          <Link href={`/projects/${next.slug}`} className={styles.next}>
            Next: {next.title} <span aria-hidden="true">▶</span>
          </Link>
        )}
      </nav>
    </main>
    </>
  );
}

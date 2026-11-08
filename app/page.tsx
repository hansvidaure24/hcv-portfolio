import Navigation from '@/app/components/navigation/Navigation'
import TopBar from '@/app/components/navigation/TopBar'
import SceneProvider from '@/app/components/scene/SceneProvider'
import SceneStage from '@/app/components/scene/SceneStage'
import Hero from '@/app/components/sections/Hero/Hero'
import Projects from '@/app/components/sections/Projects/Projects'
import Bio from '@/app/components/sections/Bio/Bio'
import Contact from '@/app/components/sections/Contact/Contact'
import { getPublishedProjects } from '@/app/data/projects'
import { getCiBySlug, getTrainerStats } from '@/app/lib/github'

const SECTION_IDS = ['hero', 'projects', 'about', 'contact']

// Every section renders straight into the HTML, so visitors and crawlers
// without JavaScript get the whole page, not just the hero.
//
// Work, About and Contact used to sit in their own Suspense boundaries to
// split hydration into short tasks (startup blocking ~420 ms → ~30 ms in
// Phase 7). That made Next ship them as hidden HTML that an inline script
// moved into place. By Nov 8 the dialogs, sound and Type Matchup load when
// idle, and removing the boundaries measured the same: mobile Lighthouse 100
// three times, blocking time 11 ms (6 ms with them).
//
// The live GitHub data is fetched once here and passed down as props, so no
// section waits on the network and a GitHub failure can't break one.
export default async function Home() {
  const [ci, trainer] = await Promise.all([getCiBySlug(getPublishedProjects()), getTrainerStats()])

  return (
    <div id="main-content-wrapper">
      <main role="main" className="min-h-screen">
        <SceneProvider sectionIds={SECTION_IDS}>
          <TopBar />
          <Navigation />
          <SceneStage
            sections={[
              { id: 'hero', node: <Hero /> },
              { id: 'projects', node: <Projects ci={ci} /> },
              { id: 'about', node: <Bio trainer={trainer} /> },
              { id: 'contact', node: <Contact /> },
            ]}
          />
        </SceneProvider>
      </main>
    </div>
  );
}

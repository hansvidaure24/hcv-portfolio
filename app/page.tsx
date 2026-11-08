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
import { Suspense } from 'react'

const SECTION_IDS = ['hero', 'projects', 'about', 'contact']

// Each Suspense boundary is hydrated in its own task after the hero, so the
// page stays responsive instead of hydrating everything in one long block
// (startup blocking time ~420 ms → ~30 ms).
//
// Trade-off: Next streams each boundary's server data separately, so React
// ships those sections as hidden HTML that an inline script moves into place.
// Browsers with JavaScript (and Google, which runs it) see everything; with
// JavaScript off, Work, About and Contact stay hidden.
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
              { id: 'projects', node: <Suspense><Projects ci={ci} /></Suspense> },
              { id: 'about', node: <Suspense><Bio trainer={trainer} /></Suspense> },
              { id: 'contact', node: <Suspense><Contact /></Suspense> },
            ]}
          />
        </SceneProvider>
      </main>
    </div>
  );
}

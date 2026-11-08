import Navigation from '@/app/components/navigation/Navigation'
import TopBar from '@/app/components/navigation/TopBar'
import SceneProvider from '@/app/components/scene/SceneProvider'
import SceneStage from '@/app/components/scene/SceneStage'
import Hero from '@/app/components/sections/Hero/Hero'
import Projects from '@/app/components/sections/Projects/Projects'
import Bio from '@/app/components/sections/Bio/Bio'
import Contact from '@/app/components/sections/Contact/Contact'
import { Suspense } from 'react'

const SECTION_IDS = ['hero', 'projects', 'about', 'contact']

// Each Suspense boundary is hydrated in its own task after the hero, so the
// page stays responsive instead of hydrating everything in one long block.
// The HTML is complete either way; nothing below the hero waits on data.

export default function Home() {
  return (
    <div id="main-content-wrapper">
      <main role="main" className="min-h-screen">
        <SceneProvider sectionIds={SECTION_IDS}>
          <TopBar />
          <Navigation />
          <SceneStage
            sections={[
              { id: 'hero', node: <Hero /> },
              { id: 'projects', node: <Suspense><Projects /></Suspense> },
              { id: 'about', node: <Suspense><Bio /></Suspense> },
              { id: 'contact', node: <Suspense><Contact /></Suspense> },
            ]}
          />
        </SceneProvider>
      </main>
    </div>
  );
}

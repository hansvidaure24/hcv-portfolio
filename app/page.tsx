import Navigation from '@/app/components/navigation/Navigation'
import SceneProvider from '@/app/components/scene/SceneProvider'
import SceneStage from '@/app/components/scene/SceneStage'
import BootScreen from '@/app/components/ui/BootScreen'
import Hero from '@/app/components/sections/Hero/Hero'
import Projects from '@/app/components/sections/Projects/Projects'
import Bio from '@/app/components/sections/Bio/Bio'
import Contact from '@/app/components/sections/Contact/Contact'

const SECTION_IDS = ['hero', 'projects', 'about', 'contact']

export default function Home() {
  return (
    <div id="main-content-wrapper">
      <BootScreen />
      <main role="main" className="min-h-screen">
        <SceneProvider sectionIds={SECTION_IDS}>
          <Navigation />
          <SceneStage
            sections={[
              { id: 'hero', node: <Hero /> },
              { id: 'projects', node: <Projects /> },
              { id: 'about', node: <Bio /> },
              { id: 'contact', node: <Contact /> },
            ]}
          />
        </SceneProvider>
      </main>
    </div>
  );
}

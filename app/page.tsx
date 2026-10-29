import Navigation from '@/app/components/navigation/Navigation'
import TopBar from '@/app/components/navigation/TopBar'
import SceneProvider from '@/app/components/scene/SceneProvider'
import SceneStage from '@/app/components/scene/SceneStage'
import Hero from '@/app/components/sections/Hero/Hero'
import Projects from '@/app/components/sections/Projects/Projects'
import Bio from '@/app/components/sections/Bio/Bio'
import Party from '@/app/components/sections/Party/Party'
import Contact from '@/app/components/sections/Contact/Contact'

const SECTION_IDS = ['hero', 'projects', 'about', 'party', 'contact']

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
              { id: 'projects', node: <Projects /> },
              { id: 'about', node: <Bio /> },
              { id: 'party', node: <Party /> },
              { id: 'contact', node: <Contact /> },
            ]}
          />
        </SceneProvider>
      </main>
    </div>
  );
}

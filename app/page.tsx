import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Projects from '@/components/Projects'
import Bio from '@/components/Bio'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <div id="main-content-wrapper">
      <main role="main" className="min-h-screen">
        <Navigation />
        <Hero />
        <Projects />
        <Bio />
        <Contact />
      </main>
    </div>
  );
}
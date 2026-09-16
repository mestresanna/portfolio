import Menu from '@/components/Menu';
import CubeViewTransition from '@/components/transitionEffects/CubeViewTransition';
import ProjectsSection from '@/components/projects/ProjectsSection';

export default function WorkPage() {
  return (
    <CubeViewTransition>
    <main className="relative min-h-screen">
    <Menu />
    <ProjectsSection />
    </main>
    </CubeViewTransition>

  );
}

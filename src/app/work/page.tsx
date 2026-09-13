import Menu from '@/components/Menu';
import CubeViewTransition from '@/components/transitionEffects/CubeViewTransition';

export default function WorkPage() {
  return (
    <CubeViewTransition>
    <main className="relative min-h-screen overflow-hidden">
    <Menu />
    <div className="absolute inset-0 flex items-center justify-center">
    <h1>Projects</h1>

      	</div>
    </main>
    </CubeViewTransition>

  );
}

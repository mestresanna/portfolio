import Menu from '@/components/Menu';
import CubeViewTransition from '@/components/transitionEffects/CubeViewTransition';

export default function ContactPage() {
  return (
    <CubeViewTransition>
    <main className="relative min-h-screen overflow-hidden">
    <Menu />
    <div className="absolute inset-0 flex items-center justify-center">
    <h1>Contact</h1>

      	</div>
    </main>
    </CubeViewTransition>

  );
}

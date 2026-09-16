import Menu from '@/components/Menu';
import RotatingCylinder from '@/components/textEffects/RotatingCylinder';
import CubeViewTransition from '@/components/transitionEffects/CubeViewTransition';

export default function AboutPage() {
  return (
    <CubeViewTransition>
    <main className="relative min-h-screen overflow-hidden">
    <Menu />
    <div className="absolute inset-0 flex items-center justify-center">
    <h1 className="text-foreground">About Me</h1>

    <div className="absolute inset-0 flex items-center justify-center">
      	<RotatingCylinder text="Design is an art, understanding is a science, and technology is the tool that brings them together. I'm Anna, a designer and developer working at the intersection of the three, using AI and whatever tools I can get my hands on to build things. This space is where I bring together a mix of professional skill and personal exploration. Right now my focus is on understanding how humans, technology, and nature can coexist rather than compete: less extraction, more synergy. I don't believe in 'normal', chasing it tends to cost us our own nature. So welcome to the nonsense of the world, and the beauty of its chaos."
	imageSrc='/images/aboutme.jpeg'	/>
    </div>

      </div>
    </main>
    </CubeViewTransition>

  );
}

import Link from 'next/link';
import Menu from '@/components/Menu';
import RotatingCylinder from '@/components/textEffects/RotatingCylinder';
import CubeViewTransition from '@/components/transitionEffects/CubeViewTransition';

export default function AboutPage() {
  return (
    <CubeViewTransition>
    <main className="relative min-h-screen overflow-hidden">
    <Menu />
    <div className="absolute inset-0 flex items-center justify-center">
    <h1>About Me</h1>

    <div className="absolute inset-0 flex items-center justify-center">
      	<RotatingCylinder text="Design is an art, understanding is a science, and technology is the tool that brings them together. I am a designer and developer passionate about creating experiences that are both visually captivating and functionally seamless. My work focuses on not understanding the world that surrond us, I cannot understand everything. But what I tried to do is reverse-engineer on the world itself. The normality is not healthy, it destroys our own nature. And also nobody is special. So welcome to explore the nonsense of the world, and the beauty of the chaos."
	imageSrc='/images/aboutme.jpeg'	/>
    </div>
        <h2>
        <Link href="/">Back to home</Link>
      </h2>
      </div>
    </main>
    </CubeViewTransition>

  );
}

import { Webcam } from "@/components/ascii-camera/Webcam"
import Link from 'next/link';
import SpiralText from "@/components/textEffects/SpiralText";
import SquareText from "@/components/textEffects/SquareText";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Webcam />

      <div className="relative z-10 flex min-h-screen flex-col justify-between p-8 text-white">
        <nav className="flex justify-between font-bold uppercase tracking-widest">
          <span>ANNA MESTRES</span>

          <div className="flex gap-8">
            <Link href="/work"><span>WORK</span></Link>
            <Link href="/about"><span>ABOUT</span></Link>
            <Link href="/contact"><span>CONTACT</span></Link>
          </div>
        </nav>

        
	<SpiralText text="Distortion of reality Self reflection Chaos in the desperation Pixelated constantly And you will, Will you see? You will not." />

	<SquareText text="You will not." size={400} duration={10} />

        <footer>
          <span>© Anna Mestres 2026</span>
        </footer>
      </div>
    </main>
  )
}

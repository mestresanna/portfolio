import { Webcam } from "@/components/ascii-camera/Webcam"
import Menu from "@/components/Menu";
import MarqueeText from "@/components/textEffects/MarqueeText";
import CubeViewTransition from "@/components/transitionEffects/CubeViewTransition";

export default function Home() {
  return (
    <CubeViewTransition>
      <main className="relative min-h-screen overflow-hidden">
        <Webcam />
        <MarqueeText text="  Distortion of reality, self reflection, chaos in the desperation, pixelated constantly, and you will, will you see? You will not" />
        <Menu logoClassName="top-[calc(3%+2rem)]" />
      </main>
    </CubeViewTransition>
  )
}

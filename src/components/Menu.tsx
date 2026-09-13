import ThemeToggle from "@/components/ThemeToggle";
import DirectionalLink from "@/components/transitionEffects/Directionallink";


interface MenuProps {
  logoClassName?: string;
}

export default function Menu({ logoClassName = "top-8" }: MenuProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col justify-between p-8 pointer-events-none">
      <nav className="absolute inset-0 font-bold uppercase tracking-widest">
        <div
          className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-3 pointer-events-auto ${logoClassName}`}
        >
          <DirectionalLink href="/" direction="top">
            ANNA MESTRES
          </DirectionalLink>
          <ThemeToggle />
        </div>

        <DirectionalLink
          href="/about"
          direction="bottom"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          ABOUT
          <span className="hidden md:inline">&#8595;</span>
        </DirectionalLink>

        <DirectionalLink
          href="/work"
          direction="right"
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto"
        >
          <span className="md:[writing-mode:horizontal-tb] [writing-mode:vertical-rl]">
            WORK
          </span>
          <span className="hidden md:inline"> →</span>
        </DirectionalLink>

        <DirectionalLink
          href="/contact"
          direction="left"
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto"
        >
          <span className="hidden md:inline">← </span>
          <span className="md:[writing-mode:horizontal-tb] [writing-mode:vertical-lr]">
            CONTACT
          </span>
        </DirectionalLink>
      </nav>

      <footer className="absolute bottom-4 text-sm text-white/50 pointer-events-none">
        <span>© Anna Mestres 2026</span>
      </footer>
    </div>
  );
}

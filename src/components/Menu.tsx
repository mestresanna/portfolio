import ThemeToggle from "@/components/ThemeToggle";
import DirectionalLink from "@/components/transitionEffects/Directionallink";


interface MenuProps {
  logoClassName?: string;
}

export default function Menu({ logoClassName = "top-8" }: MenuProps) {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      <nav className="absolute inset-0 font-bold uppercase tracking-widest">

        <div
          className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-3 pointer-events-auto ${logoClassName}`}
        >
          <DirectionalLink href="/" direction="top" className="text-center">
            ANNA MESTRES
          </DirectionalLink>
          <ThemeToggle />
        </div>

        <DirectionalLink
          href="/about"
          direction="bottom"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto sm:bottom-8"
        >
          ABOUT
          <span className="hidden md:inline">&#8595;</span>
        </DirectionalLink>

        <DirectionalLink
          href="/work"
          direction="right"
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto sm:right-6 md:right-8"
        >
          <span className="[writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">
            WORK
          </span>
          <span className="hidden md:inline"> →</span>
        </DirectionalLink>

        <DirectionalLink
          href="/contact"
          direction="left"
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-auto sm:left-6 md:left-8"
        >
          <span className="hidden md:inline">← </span>
          <span className="[writing-mode:vertical-lr] md:[writing-mode:horizontal-tb]">
            CONTACT
          </span>
        </DirectionalLink>

      </nav>

      <footer className="fixed bottom-3 left-3 text-xs pointer-events-none sm:bottom-4 sm:left-8 sm:text-sm">
        <span>© Anna Mestres 2026</span>
      </footer>
    </div>
  );
}


import Menu from "@/components/Menu";
import CubeViewTransition from "@/components/transitionEffects/CubeViewTransition";

export default function ContactPage() {
  return (
    <CubeViewTransition>
      <main className="relative min-h-screen">
        <Menu />

        <section className="flex min-h-screen items-center justify-center px-15 sm:px-20 md:px-32 lg:px-24">
          <div className="w-full max-w-2xl">
            <h1 className="mb-16 text-5xl font-bold tracking-tight md:text-7xl">
              LET&apos;S TALK.
            </h1>

            <div className="grid gap-10 text-lg md:grid-cols-3">
              <a
                href="mailto:annamestres@gmx.com"
                className="group"
              >
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Email
                </span>

                <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
                  annamestres@gmx.com
                </span>
              </a>

              <a
                href="https://www.linkedin.com/in/anna-mestres/"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  LinkedIn
                </span>

                <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
                  LinkedIn ↗
                </span>
              </a>

              <a
                href="https://github.com/mestresanna"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  GitHub
                </span>

                <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-foreground">
                  GitHub ↗
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </CubeViewTransition>
  );
}


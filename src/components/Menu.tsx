"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import DirectionalLink from "@/components/transitionEffects/Directionallink";


interface MenuProps {
  logoClassName?: string;
}

export default function Menu({ logoClassName = "top-8" }: MenuProps) {
  const pathname = usePathname();

  // Tolerant of the trailing slash this project's static export adds
  // (trailingSlash: true in next.config.ts).
  const isActive = (href: string) =>
    pathname === href || pathname === `${href}/`;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      <nav
        data-info-bubble-ignore
        className="absolute inset-0 font-bold uppercase tracking-widest"
      >

        <div
          className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-3 pointer-events-auto ${logoClassName}`}
        >
          <DirectionalLink href="/" direction="top" className="text-center">
            ANNA MESTRES
          </DirectionalLink>
          <ThemeToggle />
        </div>

        {!isActive("/about") && (
          <DirectionalLink
            href="/about"
            direction="bottom"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto sm:bottom-8"
          >
            ABOUT
            <span className="hidden md:inline">&#8595;</span>
          </DirectionalLink>
        )}

        {!isActive("/work") && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none sm:right-6 md:right-8">
            <DirectionalLink href="/work" direction="right" className="pointer-events-auto">
              <span className="[writing-mode:vertical-rl] md:[writing-mode:horizontal-tb]">
                WORK
              </span>
              <span className="hidden md:inline"> →</span>
            </DirectionalLink>
          </div>
        )}

        {!isActive("/contact") && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none sm:left-6 md:left-8">
            <DirectionalLink href="/contact" direction="left" className="pointer-events-auto">
              <span className="hidden md:inline">← </span>
              <span className="[writing-mode:vertical-lr] md:[writing-mode:horizontal-tb]">
                CONTACT
              </span>
            </DirectionalLink>
          </div>
        )}

      </nav>

      <footer className="fixed bottom-3 left-3 text-xs pointer-events-none sm:bottom-4 sm:left-8 sm:text-sm">
        <span>© Anna Mestres 2026</span>
      </footer>
    </div>
  );
}

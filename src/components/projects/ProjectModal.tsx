"use client";

import { ViewTransition } from "react";
import { useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Project } from "@/data/projects";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

// Guards against a javascript:-scheme (or other non-http) URL ever becoming
// a clickable href — githubUrl is author-controlled static data today, but
// this keeps the link safe regardless of where that data comes from later.
function isSafeHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <ViewTransition name={`project-card-${project.slug}`} share="project-flip" default="none">
        <div className="relative flex max-h-[80vh] w-[min(70rem,80vw)] flex-col overflow-hidden border-2 border-foreground bg-background">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background"
          >
            ✕
          </button>

          <div className="overflow-y-auto p-8">
            <h2 className="pr-10 text-2xl font-bold uppercase tracking-tight text-foreground">
              {project.title}
            </h2>

            <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-xs uppercase tracking-wide text-foreground/70">
              {project.techStack.map((tech, i) => (
                <span key={tech}>
                  {tech}
                  {i < project.techStack.length - 1 && <span className="text-foreground/30"> /</span>}
                </span>
              ))}
            </div>

            <div
              className="mt-6 text-sm leading-relaxed text-foreground/90
                [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:first:mt-0
                [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground
                [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5
                [&_li]:mt-1 [&_a]:text-foreground [&_a]:underline [&_strong]:font-semibold [&_strong]:text-foreground
                [&_code]:bg-foreground/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs
                [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-foreground/30 [&_table]:text-left [&_table]:text-xs
                [&_th]:border [&_th]:border-foreground/30 [&_th]:bg-foreground/10 [&_th]:px-2 [&_th]:py-1.5 [&_th]:font-mono [&_th]:uppercase [&_th]:tracking-wide
                [&_td]:border [&_td]:border-foreground/30 [&_td]:px-2 [&_td]:py-1.5"
            >
              {/* No rehype-raw plugin — react-markdown renders no raw
                  HTML/script tags by default. Keep it that way: readme
                  content is author-controlled today, but this is the
                  guardrail if it's ever sourced from a CMS or contributors. */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.readme}</ReactMarkdown>
            </div>

            {project.gallery && project.gallery.length > 0 && (
              <div className="mt-6 flex flex-col gap-4">
                {project.gallery.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-video w-full overflow-hidden  bg-foreground/5"
                  >
                    <Image src={src} alt="" fill className="object-contain" sizes="(min-width: 1024px) 64rem, 90vw" />
                  </div>
                ))}
              </div>
            )}

            {project.githubUrl && isSafeHttpUrl(project.githubUrl) && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block border border-foreground px-4 py-1.5 text-sm font-medium uppercase tracking-wide text-foreground hover:bg-foreground hover:text-background"
              >
                View on GitHub →
              </a>
            )}
          </div>
        </div>
      </ViewTransition>
    </div>
  );
}

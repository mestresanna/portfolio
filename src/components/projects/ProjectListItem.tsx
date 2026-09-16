import { ViewTransition } from "react";
import type { Project } from "@/data/projects";

interface ProjectListItemProps {
  project: Project;
  index: number;
  visible: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ProjectListItem({
  project,
  index,
  visible,
  isSelected,
  onSelect,
}: ProjectListItemProps) {
  return (
    <div
      className={`border-b border-foreground transition-opacity duration-300 ${
        visible ? "opacity-100" : "hidden"
      }`}
    >
      {/* Dropping the name while selected hands the shared identity to
          ProjectModal, which is what makes the browser morph between the
          row and the expanded panel instead of just swapping them. */}
      <ViewTransition
        key={isSelected ? "expanded" : "collapsed"}
        name={isSelected ? undefined : `project-card-${project.slug}`}
        share="project-flip"
        default="none"
      >
        
	<button
	  type="button"
	  onClick={onSelect} 
		className={`group grid w-full grid-cols-1 gap-1 py-6 text-left transition-colors hover:bg-foreground hover:text-background md:grid-cols-[3rem_16rem_minmax(0,2fr)_1fr] md:items-baseline md:gap-6 ${
		  isSelected ? "invisible" : ""
		}`}
	>

          <span className="font-mono text-sm text-foreground/50 group-hover:text-background/70">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-lg font-bold uppercase tracking-tight">{project.title}</span>
          <span className="text-sm text-foreground/70 group-hover:text-background/80">
            {project.shortDescription}
          </span>
          <span className="font-mono text-xs uppercase tracking-wide text-foreground/50 group-hover:text-background/70">
            {project.techStack.join(" / ")}
          </span>
        </button>
      </ViewTransition>
    </div>
  );
}

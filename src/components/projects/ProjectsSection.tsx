"use client";

import { useState, useTransition } from "react";
import { projects } from "@/data/projects";
import CategoryFilter, { type CategoryFilterValue } from "./CategoryFilter";
import ProjectListItem from "./ProjectListItem";
import ProjectModal from "./ProjectModal";

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilterValue>("All");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const selectedProject = projects.find((p) => p.slug === selectedSlug) ?? null;

  function selectProject(slug: string | null) {
    // <ViewTransition> only animates inside a Transition — a plain setState
    // would just snap between states with no flip/morph.
    startTransition(() => setSelectedSlug(slug));
  }

  return (
    <section className="relative w-full     px-15
    sm:px-26 md:px-36 lg:px-24 pb-24 pt-8 top-15 min-h-screen items-center justify-center ">
    <div className="w-full max-w-5xl mx-auto mt-12 ">
      <h1 className="mb-16 text-5xl font-bold uppercase tracking-tight text-foreground md:text-7xl">
        Projects.
      </h1>

      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
    </div>
    
    <div className="mx-auto mt-12 max-w-5xl border-t border-foreground">
        {projects.map((project, index) => (
          <ProjectListItem
            key={project.slug}
            project={project}
            index={index}
            visible={activeCategory === "All" || project.categories.includes(activeCategory)}
            isSelected={selectedSlug === project.slug}
            onSelect={() => selectProject(project.slug)}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => selectProject(null)} />
      )}
    </section>
  );
}

import type { ProjectCategory } from "@/data/projects";

export type CategoryFilterValue = ProjectCategory | "All";

const CATEGORIES: CategoryFilterValue[] = ["All", "AI / Data", "Backend", "Frontend", "Design"];

interface CategoryFilterProps {
  active: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {CATEGORIES.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            aria-pressed={isActive}
            className={`border border-foreground px-4 py-1.5 text-sm font-medium uppercase tracking-wide transition-colors ${
              isActive
                ? "bg-foreground text-background"
                : "text-foreground hover:bg-foreground hover:text-background"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

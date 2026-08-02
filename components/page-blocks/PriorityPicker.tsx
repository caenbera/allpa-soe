import type { SectionPriority } from "@/lib/types";

const PRIORITIES: SectionPriority[] = ["baja", "media", "alta"];

export function PriorityPicker({ value, onChange }: { value: SectionPriority; onChange: (priority: SectionPriority) => void }) {
  return (
    <div className="flex gap-1.5">
      {PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
            value === p
              ? "border-[var(--allpa-gold-400)] bg-[var(--allpa-gold-400)]/10 text-[var(--allpa-gold-300)]"
              : "border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

import { ICON_CHOICES } from "@/lib/icon-choices";
import { resolveLucideIcon } from "@/lib/lucide-icon";

export function IconPickerGrid({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1.5 rounded-lg border border-border p-2">
      {ICON_CHOICES.map((iconName) => {
        const Icon = resolveLucideIcon(iconName);
        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onChange(iconName)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              value === iconName ? "bg-[var(--allpa-gold-400)]/20 text-[var(--allpa-gold-300)]" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

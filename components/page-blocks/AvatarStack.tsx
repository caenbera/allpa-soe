import { Plus } from "lucide-react";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AvatarStack({ names, onAdd }: { names: string[]; onAdd?: () => void }) {
  return (
    <div className="flex items-center">
      {names.slice(0, 3).map((name, i) => (
        <div
          key={name}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--card)] bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[10px] font-bold text-[#241a05]"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
          title={name}
        >
          {initialsOf(name)}
        </div>
      ))}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-white/20 text-white/40 hover:border-[#eec469] hover:text-[#eec469]"
          style={{ marginLeft: names.length ? -8 : 0 }}
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

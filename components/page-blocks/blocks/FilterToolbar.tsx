"use client";

import { Download, LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FilterDef {
  id: string;
  label: string;
  options: string[];
}

export type ViewMode = "grid" | "list";

/**
 * Buscador + filtros + exportación + alternar vista. Controlado por la
 * página para que los filtros afecten de verdad a la tabla o rejilla.
 */
export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  values = {},
  onFilterChange,
  view,
  onViewChange,
  onExport,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  values?: Record<string, string>;
  onFilterChange?: (id: string, value: string) => void;
  view?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  onExport?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 bg-muted/40 pl-9"
        />
      </div>

      {filters.map((filter) => {
        const current = values[filter.id] ?? "Todos";
        return (
          <DropdownMenu key={filter.id}>
            <DropdownMenuTrigger className="flex h-9 items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 text-sm text-white/70 transition-colors hover:bg-white/[0.06]">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {filter.label}: {current}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {["Todos", ...filter.options].map((opt) => (
                <DropdownMenuItem key={opt} onClick={() => onFilterChange?.(filter.id, opt)}>
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} className="h-9 border-white/12 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Exportar
        </Button>
      )}

      {view && onViewChange && (
        <div className="flex h-9 items-center gap-0.5 rounded-lg border border-white/12 bg-white/[0.03] p-0.5">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            aria-label="Vista de tarjetas"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              view === "grid" ? "bg-[var(--allpa-gold-400)]/20 text-[var(--allpa-gold-300)]" : "text-white/45 hover:text-white/75"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-label="Vista de lista"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              view === "list" ? "bg-[var(--allpa-gold-400)]/20 text-[var(--allpa-gold-300)]" : "text-white/45 hover:text-white/75"
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

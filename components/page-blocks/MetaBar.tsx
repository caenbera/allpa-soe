"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil } from "lucide-react";
import { META_FIELD_CATALOG, META_FIELD_MAX, getMetaFieldDef, type MetaFieldType } from "@/lib/meta-fields";
import { STATUS_CONFIG } from "@/components/page-blocks/StatusBadge";
import { BRAND_ICONS, BRAND_LABELS, type BrandKey } from "@/components/shared/BrandIcon";
import type { SectionPriority, SectionStatus } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MetaFieldState {
  id: string;
  value: string | number;
}

const DEFAULT_VALUE: Record<MetaFieldType, string | number> = {
  progress: 0,
  person: "Sin asignar",
  date: new Date().toISOString().slice(0, 10),
  priority: "media",
  status: "pendiente",
  text: "",
  platform: "instagram",
  select: "",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

function FieldEditor({
  def,
  value,
  onChange,
}: {
  def: ReturnType<typeof getMetaFieldDef>;
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  if (!def) return null;

  switch (def.type) {
    case "progress":
      return (
        <div className="space-y-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={Number(value)}
            onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            className="h-9"
          />
          <Progress value={Number(value)} />
        </div>
      );
    case "person":
    case "text":
      return <Input value={String(value)} onChange={(e) => onChange(e.target.value)} placeholder={def.label} className="h-9" />;
    case "date":
      return <Input type="date" value={String(value)} onChange={(e) => onChange(e.target.value)} className="h-9" />;
    case "priority":
      return (
        <div className="flex gap-1.5">
          {(["baja", "media", "alta"] as SectionPriority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                value === p ? "border-[var(--allpa-gold-400)] bg-[var(--allpa-gold-400)]/10 text-[var(--allpa-gold-300)]" : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      );
    case "status":
      return (
        <div className="space-y-1">
          {(Object.keys(STATUS_CONFIG) as SectionStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                value === s ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      );
    case "select":
      return (
        <div className="space-y-1">
          {(def.options ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`flex w-full items-center rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                value === opt ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case "platform":
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(BRAND_ICONS) as BrandKey[]).map((key) => {
            const Icon = BRAND_ICONS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] transition-colors ${
                  value === key ? "border-[var(--allpa-gold-400)] bg-[var(--allpa-gold-400)]/10 text-[var(--allpa-gold-300)]" : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {BRAND_LABELS[key]}
              </button>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}

function FieldCell({ field, onChange }: { field: MetaFieldState; onChange: (v: string | number) => void }) {
  const def = getMetaFieldDef(field.id);
  if (!def) return null;
  const Icon = def.icon;

  const display = () => {
    switch (def.type) {
      case "progress":
        return (
          <div className="mt-1 flex items-center gap-2">
            <Progress value={Number(field.value)} className="w-16" />
            <span className="text-sm font-semibold text-[#f3ecd9]">{field.value}%</span>
          </div>
        );
      case "person":
        return (
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-[9px] font-bold text-[#241a05]">
              {initials(String(field.value))}
            </div>
            <span className="truncate text-sm font-medium text-[#f3ecd9]">{field.value}</span>
          </div>
        );
      case "date":
        return <p className="mt-1 text-sm font-medium text-[#f3ecd9]">{formatDate(String(field.value))}</p>;
      case "priority":
        return <p className="mt-1 text-sm font-medium capitalize text-[#f3ecd9]">{field.value}</p>;
      case "status":
        return (
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[field.value as SectionStatus]?.dot ?? "bg-white/40"}`} />
            <span className="truncate text-sm font-medium text-[#f3ecd9]">{STATUS_CONFIG[field.value as SectionStatus]?.label ?? field.value}</span>
          </div>
        );
      case "platform":
        return (
          <div className="mt-1 flex items-center gap-1.5 text-[#f3ecd9]">
            <BrandIconInline brand={field.value as BrandKey} />
            <span className="truncate text-sm font-medium">{BRAND_LABELS[field.value as BrandKey] ?? field.value}</span>
          </div>
        );
      default:
        return <p className="mt-1 truncate text-sm font-medium text-[#f3ecd9]">{String(field.value) || "—"}</p>;
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="group min-w-0 flex-1 px-4 py-3 text-left">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/35">
          <Icon className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{def.label}</span>
          <Pencil className="ml-auto h-3 w-3 flex-shrink-0 text-white/0 transition-colors group-hover:text-white/30" />
        </p>
        {display()}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="mb-2 text-xs font-semibold text-foreground">{def.label}</p>
        <FieldEditor def={def} value={field.value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}

function BrandIconInline({ brand }: { brand: BrandKey }) {
  const Icon = BRAND_ICONS[brand] ?? BRAND_ICONS.instagram;
  return <Icon className="h-4 w-4 flex-shrink-0" />;
}

export function MetaBar({ initialFields }: { initialFields: MetaFieldState[] }) {
  const [fields, setFields] = useState<MetaFieldState[]>(initialFields);

  const activeIds = new Set(fields.map((f) => f.id));

  const updateValue = (id: string, value: string | number) => {
    setFields((list) => list.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const toggleField = (id: string, checked: boolean) => {
    if (checked) {
      const def = getMetaFieldDef(id);
      if (!def) return;
      setFields((list) => {
        if (list.length >= META_FIELD_MAX) {
          toast.error(`Máximo ${META_FIELD_MAX} características visibles a la vez.`);
          return list;
        }
        return [...list, { id, value: DEFAULT_VALUE[def.type] }];
      });
    } else {
      setFields((list) => list.filter((f) => f.id !== id));
    }
  };

  return (
    <div className="surface-card mb-5 flex items-stretch divide-x divide-white/[0.06] overflow-x-auto">
      {fields.map((field) => (
        <FieldCell key={field.id} field={field} onChange={(v) => updateValue(field.id, v)} />
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger className="flex flex-shrink-0 items-center justify-center px-3 text-white/35 transition-colors hover:text-white/70" aria-label="Editar características">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
            Características visibles ({fields.length}/{META_FIELD_MAX})
          </p>
          <DropdownMenuSeparator />
          {META_FIELD_CATALOG.map((def) => (
            <DropdownMenuCheckboxItem
              key={def.id}
              checked={activeIds.has(def.id)}
              onCheckedChange={(checked) => toggleField(def.id, Boolean(checked))}
            >
              <def.icon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {def.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

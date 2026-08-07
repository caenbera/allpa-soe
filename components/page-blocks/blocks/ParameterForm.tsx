"use client";

import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Un campo del formulario de simulación.
 *
 * `segmented` sustituye al deslizador de la maqueta: los valores son tres
 * tramos con nombre, no un continuo, y un grupo de botones dice eso mismo
 * sin obligar a acertar con el ratón ni dejar fuera a quien navega con
 * teclado.
 */
export type ParameterField =
  | { kind: "select"; id: string; label: string; value: string; options: { value: string; label: string }[] }
  | { kind: "number"; id: string; label: string; value: number; min?: number; max?: number; suffix?: string }
  | { kind: "stepper"; id: string; label: string; value: number; min?: number; max?: number }
  | { kind: "currency"; id: string; label: string; value: number; hint?: string }
  | { kind: "segmented"; id: string; label: string; value: string; options: string[]; hint?: string };

/**
 * Formulario de parámetros de una simulación: desplegables, edad, número de
 * dependientes, ingreso y nivel de cobertura.
 *
 * Controlado por la página: el bloque no guarda estado propio, para que la
 * cifra que se muestra al lado venga siempre de los mismos valores que se ven
 * aquí.
 */
export function ParameterForm({
  fields,
  onChange,
  columns = 2,
}: {
  fields: ParameterField[];
  onChange: (id: string, value: string | number) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-3 ${columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
      {fields.map((field) => {
        // Los campos anchos ocupan la fila entera; los cortos van a dos.
        const ancho = field.kind === "select" || field.kind === "currency" || field.kind === "segmented";
        return (
          <div key={field.id} className={ancho && columns === 2 ? "sm:col-span-2" : undefined}>
            <label htmlFor={`campo-${field.id}`} className="mb-1.5 block text-xs text-white/45">
              {field.label}
            </label>
            <FieldControl field={field} onChange={onChange} />
          </div>
        );
      })}
    </div>
  );
}

function FieldControl({
  field,
  onChange,
}: {
  field: ParameterField;
  onChange: (id: string, value: string | number) => void;
}) {
  const id = `campo-${field.id}`;

  switch (field.kind) {
    case "select":
      return (
        // Base UI permite deseleccionar y devuelve `null`; el formulario
        // siempre tiene un valor, así que se ignora esa transición.
        <Select value={field.value} onValueChange={(v) => v != null && onChange(field.id, String(v))}>
          <SelectTrigger id={id} className="h-10 w-full border-white/12 bg-white/[0.03]">
            {/* Base UI pinta el valor tal cual, y aquí los valores son
                identificadores ("familia-joven"). Se resuelve a su etiqueta. */}
            <SelectValue>{field.options.find((o) => o.value === field.value)?.label ?? field.value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "number":
      return (
        <div className="relative">
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={field.min}
            max={field.max}
            value={field.value}
            onChange={(e) => onChange(field.id, clamp(Number(e.target.value), field.min, field.max))}
            className="h-10 border-white/12 bg-white/[0.03] pr-16"
          />
          {field.suffix && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/35">
              {field.suffix}
            </span>
          )}
        </div>
      );

    case "stepper":
      return (
        <div className="flex h-10 items-center overflow-hidden rounded-lg border border-white/12 bg-white/[0.03]">
          <button
            type="button"
            aria-label={`Restar a ${field.label}`}
            onClick={() => onChange(field.id, clamp(field.value - 1, field.min, field.max))}
            className="flex h-full w-10 flex-shrink-0 items-center justify-center text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span id={id} className="flex-1 text-center text-sm tabular-nums text-[#f3ecd9]">
            {field.value}
          </span>
          <button
            type="button"
            aria-label={`Sumar a ${field.label}`}
            onClick={() => onChange(field.id, clamp(field.value + 1, field.min, field.max))}
            className="flex h-full w-10 flex-shrink-0 items-center justify-center text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      );

    case "currency":
      return (
        <div className="flex h-10 items-center overflow-hidden rounded-lg border border-white/12 bg-white/[0.03]">
          <span className="flex h-full w-10 flex-shrink-0 items-center justify-center border-r border-white/8 text-sm text-white/45">
            $
          </span>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            value={field.value}
            onChange={(e) => onChange(field.id, Math.max(0, Number(e.target.value)))}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums text-[#f3ecd9] outline-none"
          />
        </div>
      );

    case "segmented":
      return (
        <div>
          <div
            role="radiogroup"
            aria-label={field.label}
            className="flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.03] p-1"
          >
            {field.options.map((o) => {
              const activo = o === field.value;
              return (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => onChange(field.id, o)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    activo
                      ? "bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05]"
                      : "text-white/55 hover:bg-white/[0.06] hover:text-white/80"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {field.hint && <p className="mt-1.5 text-xs text-white/35">{field.hint}</p>}
        </div>
      );
  }
}

function clamp(valor: number, min?: number, max?: number): number {
  if (Number.isNaN(valor)) return min ?? 0;
  if (min != null && valor < min) return min;
  if (max != null && valor > max) return max;
  return valor;
}

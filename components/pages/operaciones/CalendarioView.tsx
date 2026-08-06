"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageShell, PageTabs } from "@/components/page-blocks/PageShell";
import { AddBlockDialog } from "@/components/page-blocks/AddBlockDialog";
import { useBlockComposer } from "@/components/page-blocks/use-block-composer";
import { BlockFrame } from "@/components/page-blocks/BlockFrame";
import { EmptyState, LoadingState } from "@/components/page-blocks/EmptyState";
import { MonthCalendar, type CalendarEvent } from "@/components/page-blocks/blocks/MonthCalendar";
import { TimeGridCalendar } from "@/components/page-blocks/blocks/TimeGridCalendar";
import { MiniMonth } from "@/components/page-blocks/blocks/MiniMonth";
import { AgendaList } from "@/components/page-blocks/blocks/AgendaList";
import { InfoCard } from "@/components/page-blocks/blocks/InfoCard";
import { FilterToolbar } from "@/components/page-blocks/blocks/FilterToolbar";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { usePageConfig } from "@/lib/use-page-config";
import { dayLabel, localIso, monthLabel, weekDays } from "@/lib/calendar-utils";
import { EVENT_KIND_COLOR, OPS_COLLECTIONS, type OpsEvent } from "@/lib/ops-types";

const TABS = [
  { value: "mes", label: "Mes" },
  { value: "semana", label: "Semana" },
  { value: "dia", label: "Día" },
  { value: "agenda", label: "Agenda" },
];

export function CalendarioView() {
  const [tab, setTab] = useState("mes");
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => localIso(new Date()));
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const events = useContent<OpsEvent>(OPS_COLLECTIONS.events);
  const { blocks, addBlock, updateBlock, removeBlock } = usePageConfig("/operaciones/calendario");
  const composer = useBlockComposer(addBlock);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.items.filter((e) => {
      if (filters.kind && filters.kind !== "Todos" && e.kind !== filters.kind) return false;
      if (filters.owner && filters.owner !== "Todos" && e.owner !== filters.owner) return false;
      if (!q) return true;
      return `${e.title} ${e.client} ${e.owner}`.toLowerCase().includes(q);
    });
  }, [events.items, search, filters]);

  /** Los eventos en la forma que entienden los tres bloques de calendario. */
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      filtered.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        color: EVENT_KIND_COLOR[e.kind] ?? "#94a3b8",
        kind: e.kind,
        client: e.client,
        durationMin: e.durationMin,
      })),
    [filtered]
  );

  /** Puntos del mes compacto: los colores de lo que hay cada día. */
  const coloresPorDia = useMemo(() => {
    const map = new Map<string, string[]>();
    calendarEvents.forEach((e) => {
      const list = map.get(e.date) ?? [];
      if (!list.includes(e.color)) list.push(e.color);
      map.set(e.date, list);
    });
    return map;
  }, [calendarEvents]);

  const moverPeriodo = (delta: number) => {
    setCursor((prev) => {
      const next = new Date(prev);
      if (tab === "mes") next.setMonth(next.getMonth() + delta);
      else if (tab === "semana") next.setDate(next.getDate() + delta * 7);
      else next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const irAHoy = () => {
    const hoy = new Date();
    setCursor(hoy);
    setSelectedDate(localIso(hoy));
  };

  const tituloPeriodo =
    tab === "mes"
      ? monthLabel(cursor.getFullYear(), cursor.getMonth())
      : tab === "semana"
        ? `Semana del ${dayLabel(weekDays(cursor)[0])}`
        : tab === "dia"
          ? dayLabel(cursor)
          : "Próximos eventos";

  /** La agenda mira hacia delante desde hoy; el resto, al periodo elegido. */
  const agenda = useMemo(() => {
    const hoy = localIso(new Date());
    return [...calendarEvents]
      .filter((e) => e.date >= hoy)
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))
      .slice(0, 25);
  }, [calendarEvents]);

  const proximos = agenda.slice(0, 5);
  const delDiaSeleccionado = calendarEvents
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const isEmpty = !events.loading && events.items.length === 0;

  const sidePanel = isEmpty ? null : (
    <>
      <BlockFrame title="Ir a una fecha" icon="CalendarDays">
        <MiniMonth
          year={cursor.getFullYear()}
          month={cursor.getMonth()}
          selectedDate={selectedDate}
          eventColorsByDate={coloresPorDia}
          onSelectDate={(iso) => {
            setSelectedDate(iso);
            setCursor(new Date(`${iso}T12:00:00`));
          }}
          onChangeMonth={(d) =>
            setCursor((prev) => {
              const next = new Date(prev);
              next.setMonth(next.getMonth() + d);
              return next;
            })
          }
        />
      </BlockFrame>

      <BlockFrame title="Leyenda" icon="Palette">
        <ul className="space-y-1.5">
          {Object.entries(EVENT_KIND_COLOR).map(([kind, color]) => (
            <li key={kind} className="flex items-center gap-2 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {kind}
            </li>
          ))}
        </ul>
      </BlockFrame>

      {delDiaSeleccionado.length > 0 && (
        <BlockFrame title={`Día ${selectedDate.slice(8)} — ${delDiaSeleccionado.length} eventos`} icon="ListChecks">
          <AgendaList
            entries={delDiaSeleccionado.map((e) => ({
              id: `sel-${e.id}`,
              time: e.time,
              title: e.title,
              done: false,
              tag: e.kind,
              tagTone: "neutral",
              person: e.client || undefined,
            }))}
          />
        </BlockFrame>
      )}

      <BlockFrame title="Próximos eventos" icon="CalendarClock">
        <InfoCard
          rows={proximos.map((e) => ({
            label: `${e.date.slice(8)}/${e.date.slice(5, 7)} · ${e.time}`,
            value: e.title,
          }))}
        />
      </BlockFrame>
    </>
  );

  return (
    <PageShell
      title="Calendario"
      description="Visualiza y gestiona las actividades y fechas clave de todos los procesos."
      icon="CalendarDays"
      starrable={false}
      sidePanel={sidePanel}
      blocks={{ items: blocks, onUpdate: updateBlock, onDelete: removeBlock, onAdd: composer.openFor }}
      headerActions={
        <Button className="border-0 bg-gradient-to-b from-[#f5da93] to-[#c98f1f] font-semibold text-[#241a05] hover:brightness-105">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo evento
        </Button>
      }
    >
      {events.loading ? (
        <div className="surface-card">
          <LoadingState />
        </div>
      ) : isEmpty ? (
        <div className="surface-card">
          <EmptyState
            icon="CalendarDays"
            title="El calendario está vacío"
            description="Aquí se junta todo lo que tiene fecha: reuniones, renovaciones, envíos de documentos y revisiones. Se va llenando conforme uses el resto del módulo."
            actionLabel="Nuevo evento"
            onAction={() => undefined}
          />
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="px-4 pt-3">
            <PageTabs tabs={TABS} active={tab} onChange={setTab} />
          </div>

          <div className="px-4 pb-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {tab !== "agenda" && (
                <>
                  <button
                    type="button"
                    onClick={() => moverPeriodo(-1)}
                    aria-label="Periodo anterior"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moverPeriodo(1)}
                    aria-label="Periodo siguiente"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={irAHoy}
                    className="h-8 rounded-lg border border-white/12 px-3 text-xs text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
                  >
                    Hoy
                  </button>
                </>
              )}
              <span className="text-sm font-medium text-[#f3ecd9]">{tituloPeriodo}</span>
              <span className="ml-auto text-xs text-white/35">{filtered.length} eventos</span>
            </div>

            <div className="mb-4">
              <FilterToolbar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar cliente, evento o responsable…"
                filters={[
                  { id: "kind", label: "Tipo", options: [...new Set(events.items.map((e) => e.kind))] },
                  { id: "owner", label: "Responsable", options: [...new Set(events.items.map((e) => e.owner))].filter(Boolean) },
                ]}
                values={filters}
                onFilterChange={(id, value) => setFilters((f) => ({ ...f, [id]: value }))}
              />
            </div>

            {tab === "mes" && (
              <MonthCalendar
                year={cursor.getFullYear()}
                month={cursor.getMonth()}
                events={calendarEvents}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}

            {tab === "semana" && <TimeGridCalendar days={weekDays(cursor)} events={calendarEvents} />}

            {tab === "dia" && <TimeGridCalendar days={[cursor]} events={calendarEvents} />}

            {tab === "agenda" && (
              <AgendaList
                entries={agenda.map((e) => ({
                  id: e.id,
                  time: `${e.date.slice(8)}/${e.date.slice(5, 7)} ${e.time}`,
                  title: e.title,
                  done: false,
                  tag: e.kind,
                  tagTone: "neutral",
                  person: e.client || undefined,
                }))}
              />
            )}
          </div>
        </div>
      )}

      <AddBlockDialog {...composer.dialogProps} />
    </PageShell>
  );
}

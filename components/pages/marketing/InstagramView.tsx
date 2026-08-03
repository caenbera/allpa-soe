"use client";

import { useState } from "react";
import { Camera, FileText, FileSpreadsheet, FileImage, Plus } from "lucide-react";
import { PageShell, StatCard } from "@/components/page-blocks/PageShell";
import { MetaBar } from "@/components/page-blocks/MetaBar";
import { AccordionSection, AddSectionButton, type AccordionSectionData } from "@/components/page-blocks/AccordionSection";
import { CreateSectionDialog } from "@/components/page-blocks/CreateSectionDialog";
import { useSectionsState } from "@/lib/use-sections";
import { usePageConfig } from "@/lib/use-page-config";

const initialSections: AccordionSectionData[] = [
  {
    id: "estrategia",
    title: "1. Estrategia y Planificación",
    icon: "Target",
    status: "en_progreso",
    priority: "alta",
    assignees: ["Ana Torres", "Luis Peña"],
    richContent:
      "<h3>Objetivo de Instagram</h3><p>Posicionar la marca como una referencia confiable en su sector.</p><h3>Pilares de contenido</h3><ul><li>Educación</li><li>Historias y testimonios</li><li>Detrás de cámaras</li><li>Consejos prácticos</li><li>Promociones y anuncios</li></ul>",
    checklist: [
      { id: "1", text: "Definir objetivo de la cuenta", status: "completado", assignee: "Ana Torres", dueDate: "1 may", notes: [] },
      { id: "2", text: "Definir audiencia objetivo", status: "completado", assignee: "Ana Torres", dueDate: "1 may", notes: [] },
      { id: "3", text: "Análisis de la competencia", status: "completado", assignee: "Luis Peña", dueDate: "3 may", notes: [] },
      { id: "4", text: "Definir pilares de contenido", status: "completado", assignee: "Ana Torres", dueDate: "3 may", notes: [] },
      { id: "5", text: "Calendario de publicaciones", status: "pendiente", assignee: "Luis Peña", dueDate: "5 may", notes: [] },
      { id: "6", text: "Hashtags estrategia", status: "pendiente", assignee: "Luis Peña", dueDate: "5 may", notes: [] },
      { id: "7", text: "Guía de estilo visual", status: "pendiente", assignee: "Ana Torres", dueDate: "6 may", notes: [] },
    ],
  },
  { id: "calendario", title: "2. Calendario de Contenidos", icon: "CalendarDays", status: "en_progreso", priority: "alta", assignees: ["Ana Torres", "Luis Peña"], richContent: "", checklist: [
    { id: "1", text: "Planificar publicaciones del mes", status: "en_progreso", assignee: "Ana Torres", dueDate: "8 may", notes: [] },
  ] },
  { id: "creacion", title: "3. Creación de Contenido", icon: "PenTool", status: "en_revision", priority: "media", assignees: ["Luis Peña"], richContent: "", checklist: [
    { id: "1", text: "Diseñar piezas gráficas", status: "en_revision", assignee: "Luis Peña", dueDate: "10 may", notes: [] },
  ] },
  { id: "aprobacion", title: "4. Aprobación y Feedback", icon: "CheckCircle2", status: "pendiente", priority: "media", assignees: ["Ana Torres"], richContent: "", checklist: [] },
  { id: "programacion", title: "5. Programación", icon: "Clock", status: "pendiente", priority: "media", assignees: ["Luis Peña"], richContent: "", checklist: [] },
  { id: "publicacion", title: "6. Publicación y Monitoreo", icon: "Send", status: "pendiente", priority: "alta", assignees: ["Luis Peña"], richContent: "", checklist: [] },
  { id: "analisis", title: "7. Análisis y Reportes", icon: "BarChart3", status: "pendiente", priority: "baja", assignees: ["Ana Torres"], richContent: "", checklist: [] },
];

function SidePanel() {
  return (
    <>
      <div className="surface-card p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#f3ecd9]">
          <Camera className="h-4 w-4 text-[#eec469]" />
          Resumen de la plataforma
        </p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Seguidores" value="12,450" trend="+8.2%" />
          <StatCard label="Engagement (30d)" value="5.6%" trend="+0.7%" />
        </div>
      </div>

      <div className="surface-card p-4">
        <p className="mb-2 text-sm font-semibold text-[#f3ecd9]">Notas generales</p>
        <p className="text-sm text-white/55">
          Enfocarnos en contenido educativo que genere valor. Mantener un tono cercano, profesional y empático.
        </p>
      </div>

      <div className="surface-card p-4">
        <p className="mb-3 text-sm font-semibold text-[#f3ecd9]">Archivos y recursos</p>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-white/65">
            <FileText className="h-4 w-4 flex-shrink-0 text-white/35" /> Guía de Estilo Instagram.pdf
          </div>
          <div className="flex items-center gap-2 text-white/65">
            <FileImage className="h-4 w-4 flex-shrink-0 text-white/35" /> Plantillas Instagram.fig
          </div>
          <div className="flex items-center gap-2 text-white/65">
            <FileSpreadsheet className="h-4 w-4 flex-shrink-0 text-white/35" /> Banco de Contenido.zip
          </div>
        </div>
        <button type="button" className="mt-3 flex items-center gap-1.5 text-xs text-[#eec469] hover:underline">
          <Plus className="h-3.5 w-3.5" /> Agregar archivo
        </button>
      </div>
    </>
  );
}

const DEFAULT_META_FIELDS = [
  { id: "progreso_total", value: 72 },
  { id: "responsable", value: "Ana Torres" },
  { id: "plataforma", value: "instagram" },
  { id: "frecuencia", value: "4 publicaciones/semana" },
  { id: "fecha_objetivo", value: "2026-05-31" },
];

export function InstagramView() {
  const { sections, addSection, removeSection } = useSectionsState(initialSections);
  const { metaFields, updateMetaFields } = usePageConfig("/marketing/redes-sociales/instagram", DEFAULT_META_FIELDS);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageShell
      title="Instagram — Plan de Contenido"
      description="Planificación, creación y publicación de contenido para Instagram."
      status="en_progreso"
      sidePanel={<SidePanel />}
      onNewBlock={() => setCreateOpen(true)}
    >
      <MetaBar fields={metaFields} onFieldsChange={updateMetaFields} />
      {sections.map((s) => (
        <AccordionSection key={s.id} data={s} onDelete={() => removeSection(s.id)} />
      ))}
      <AddSectionButton onClick={() => setCreateOpen(true)} />
      <CreateSectionDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addSection} />
    </PageShell>
  );
}

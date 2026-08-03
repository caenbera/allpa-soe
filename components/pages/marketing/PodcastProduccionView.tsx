"use client";

import { useState } from "react";
import { Mic, Scissors, Clapperboard, Rows3, Mail, Video, FileText, FileSpreadsheet } from "lucide-react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { MetaBar } from "@/components/page-blocks/MetaBar";
import { AccordionSection, AddSectionButton, type AccordionSectionData } from "@/components/page-blocks/AccordionSection";
import { CreateSectionDialog } from "@/components/page-blocks/CreateSectionDialog";
import { useSectionsState } from "@/lib/use-sections";
import { usePageConfig } from "@/lib/use-page-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialSections: AccordionSectionData[] = [
  {
    id: "guion",
    title: "1. Guion y Contenido",
    icon: "FileText",
    status: "en_progreso",
    priority: "alta",
    assignees: ["Ana Torres", "Luis Peña"],
    richContent:
      "<h3>Objetivo del episodio</h3><p>Educar a la audiencia sobre un tema relevante del sector y dejar 2-3 aprendizajes accionables.</p><h3>Estructura del episodio</h3><ul><li>Introducción (0:00 – 2:00)</li><li>Contexto del problema (2:00 – 15:00)</li><li>Soluciones y estrategias (15:00 – 35:00)</li><li>Preguntas del invitado (35:00 – 50:00)</li><li>Cierre y CTA (50:00 – 55:00)</li></ul>",
    checklist: [
      { id: "1", text: "Definir tema y ángulo del episodio", status: "completado", assignee: "Ana Torres", dueDate: "18 may", notes: [] },
      { id: "2", text: "Investigación y recopilación de datos", status: "completado", assignee: "Luis Peña", dueDate: "19 may", notes: [] },
      { id: "3", text: "Crear esquema del episodio", status: "completado", assignee: "Ana Torres", dueDate: "20 may", notes: [] },
      { id: "4", text: "Lista de preguntas para el invitado", status: "completado", assignee: "Luis Peña", dueDate: "21 may", notes: [] },
      { id: "5", text: "Revisar y aprobar guion", status: "pendiente", assignee: "Ana Torres", dueDate: "23 may", notes: [] },
      { id: "6", text: "Enviar guion al invitado", status: "pendiente", assignee: "Luis Peña", dueDate: "24 may", notes: [] },
    ],
  },
  { id: "produccion", title: "2. Producción y Grabación", icon: "Video", status: "pendiente", priority: "media", assignees: ["Ana Torres"], richContent: "", checklist: [] },
  { id: "edicion", title: "3. Edición y Postproducción", icon: "Scissors", status: "pendiente", priority: "media", assignees: ["Luis Peña"], richContent: "", checklist: [] },
  { id: "promocion", title: "4. Promoción y Marketing", icon: "Megaphone", status: "en_progreso", priority: "alta", assignees: ["Ana Torres"], richContent: "", checklist: [] },
  { id: "publicacion", title: "5. Publicación y Distribución", icon: "Send", status: "pendiente", priority: "alta", assignees: ["Luis Peña"], richContent: "", checklist: [] },
  { id: "monitoreo", title: "6. Monitoreo y Analítica", icon: "LineChart", status: "pendiente", priority: "baja", assignees: ["Ana Torres"], richContent: "", checklist: [] },
];

const REPURPOSE_STEPS = [
  { icon: Mic, label: "Podcast", sub: "Episodio completo", state: "en_progreso" },
  { icon: Scissors, label: "Clips", sub: "Extractos cortos", state: "en_progreso" },
  { icon: Clapperboard, label: "Reels", sub: "Video vertical", state: "pendiente" },
  { icon: Rows3, label: "Carruseles", sub: "Contenido educativo", state: "pendiente" },
  { icon: FileText, label: "Artículo", sub: "Blog post", state: "pendiente" },
  { icon: Mail, label: "Email", sub: "Newsletter", state: "pendiente" },
  { icon: Video, label: "YouTube", sub: "Video completo", state: "pendiente" },
] as const;

function RepurposeFlow() {
  return (
    <div className="surface-card mb-5 p-4">
      <p className="mb-3 text-sm font-semibold text-[#f3ecd9]">Flujo de Repurposing de Contenido</p>
      <div className="flex flex-wrap items-center gap-2">
        {REPURPOSE_STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
              <step.icon className="h-4 w-4 text-[#eec469]" />
              <span className="text-xs font-medium text-white/85">{step.label}</span>
              <span className="text-[10px] text-white/35">{step.sub}</span>
            </div>
            {i < REPURPOSE_STEPS.length - 1 && <span className="text-white/20">→</span>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/40">Una sola conversación. Múltiples formatos. Más alcance, más impacto.</p>
    </div>
  );
}

function SidePanel() {
  return (
    <>
      <div className="surface-card p-4">
        <p className="mb-3 text-sm font-semibold text-[#f3ecd9]">Información del episodio</p>
        <dl className="grid grid-cols-2 gap-y-2.5 text-sm">
          <dt className="text-white/40">Temporada</dt>
          <dd className="text-right text-white/80">2</dd>
          <dt className="text-white/40">Episodio</dt>
          <dd className="text-right text-white/80">24</dd>
          <dt className="text-white/40">Duración est.</dt>
          <dd className="text-right text-white/80">55 min</dd>
          <dt className="text-white/40">Idioma</dt>
          <dd className="text-right text-white/80">Español</dd>
        </dl>
      </div>

      <div className="surface-card p-4">
        <p className="mb-2 text-sm font-semibold text-[#f3ecd9]">Invitado</p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f5da93] to-[#a9760f] text-xs font-bold text-[#241a05]">
            CG
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#f3ecd9]">Carla Gómez</p>
            <p className="truncate text-xs text-white/45">Especialista en operaciones</p>
          </div>
        </div>
      </div>

      <div className="surface-card p-4">
        <p className="mb-2 text-sm font-semibold text-[#f3ecd9]">Notas rápidas</p>
        <p className="rounded-lg bg-[var(--allpa-gold-400)]/10 p-2.5 text-sm text-white/70">
          La invitada quiere compartir un caso de estudio real al cierre del episodio.
        </p>
      </div>

      <div className="surface-card p-4">
        <p className="mb-3 text-sm font-semibold text-[#f3ecd9]">Archivos y recursos</p>
        <div className="space-y-2.5 text-sm text-white/65">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 flex-shrink-0 text-white/35" /> Guion_Ep24_v1.docx
          </div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 flex-shrink-0 text-white/35" /> Datos_Sector_2026.xlsx
          </div>
        </div>
      </div>
    </>
  );
}

const DEFAULT_META_FIELDS = [
  { id: "estado_general", value: "en_progreso" },
  { id: "progreso_total", value: 65 },
  { id: "fecha_objetivo", value: "2026-05-28" },
  { id: "responsable", value: "Ana Torres" },
];

export function PodcastProduccionView() {
  const { sections, addSection, removeSection } = useSectionsState(initialSections);
  const { metaFields, updateMetaFields } = usePageConfig("/marketing/podcast/produccion", DEFAULT_META_FIELDS);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageShell
      title="Ep. 24 — Lo que casi nadie te cuenta sobre escalar"
      description="Conversación con una operadora experimentada sobre los errores que frenan el crecimiento."
      status="en_progreso"
      sidePanel={<SidePanel />}
      onNewBlock={() => setCreateOpen(true)}
    >
      <Tabs defaultValue="resumen" className="mb-5">
        <TabsList className="h-auto flex-wrap bg-transparent p-0">
          {[
            ["resumen", "Resumen"],
            ["guion", "Guion y Contenido"],
            ["invitado", "Invitado"],
            ["produccion", "Producción"],
            ["promocion", "Promoción"],
            ["publicacion", "Publicación"],
            ["analitica", "Analítica"],
            ["archivos", "Archivos"],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-lg border border-transparent px-3 py-1.5 text-sm text-white/50 data-[state=active]:border-[var(--allpa-gold-400)]/30 data-[state=active]:bg-[var(--allpa-gold-400)]/10 data-[state=active]:text-[var(--allpa-gold-300)]"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumen" className="mt-4">
          <MetaBar fields={metaFields} onFieldsChange={updateMetaFields} />
          <RepurposeFlow />
          {sections.map((s) => (
            <AccordionSection key={s.id} data={s} onDelete={() => removeSection(s.id)} />
          ))}
          <AddSectionButton onClick={() => setCreateOpen(true)} />
          <CreateSectionDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addSection} />
        </TabsContent>

        {["guion", "invitado", "produccion", "promocion", "publicacion", "analitica", "archivos"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="surface-card flex items-center justify-center py-16 text-sm text-white/35">
              Esta pestaña se activará en un próximo avance.
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </PageShell>
  );
}

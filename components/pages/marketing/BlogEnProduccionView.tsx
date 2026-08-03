"use client";

import { useState } from "react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { MetaBar } from "@/components/page-blocks/MetaBar";
import { AccordionSection, AddSectionButton, type AccordionSectionData } from "@/components/page-blocks/AccordionSection";
import { CreateSectionDialog } from "@/components/page-blocks/CreateSectionDialog";
import { usePageConfig } from "@/lib/use-page-config";

const initialSections: AccordionSectionData[] = [
  {
    id: "investigacion",
    title: "1. Investigación y Planificación",
    icon: "Search",
    status: "completado",
    priority: "alta",
    assignees: ["Ana Torres", "Luis Peña"],
    richContent:
      "<h3>Objetivo del bloque</h3><p>Define claramente el enfoque del artículo y asegura que el contenido responda a las preguntas que tiene nuestra audiencia.</p>",
    checklist: [
      { id: "1", text: "Definir objetivo del artículo", status: "completado", assignee: "Ana Torres", dueDate: "2026-05-10", notes: [] },
      { id: "2", text: "Investigación de temas y fuentes", status: "completado", assignee: "Luis Peña", dueDate: "2026-05-12", notes: [] },
      { id: "3", text: "Definir keyword principal y secundarias", status: "en_revision", assignee: "SEO Team", dueDate: "2026-05-13", notes: [] },
      { id: "4", text: "Crear esquema del artículo (outline)", status: "pendiente", assignee: "Luis Peña", dueDate: "2026-05-14", notes: [] },
    ],
  },
  {
    id: "redaccion",
    title: "2. Redacción del Contenido",
    icon: "PenLine",
    status: "en_progreso",
    priority: "alta",
    assignees: ["Luis Peña"],
    richContent: "<p>Redactar el cuerpo del artículo siguiendo el outline aprobado, con tono cercano y ejemplos concretos.</p>",
    checklist: [
      { id: "1", text: "Redactar introducción", status: "completado", assignee: "Luis Peña", dueDate: "2026-05-16", notes: [] },
      { id: "2", text: "Redactar cuerpo del artículo", status: "en_progreso", assignee: "Luis Peña", dueDate: "2026-05-19", notes: [] },
      { id: "3", text: "Redactar cierre y CTA", status: "pendiente", assignee: "Luis Peña", dueDate: "2026-05-20", notes: [] },
    ],
  },
  { id: "seo", title: "3. Optimización SEO", icon: "SearchCheck", status: "en_revision", priority: "media", assignees: ["SEO Team"], richContent: "", checklist: [
    { id: "1", text: "Revisar densidad de keywords", status: "en_revision", assignee: "SEO Team", dueDate: "2026-05-21", notes: [] },
    { id: "2", text: "Optimizar meta título y descripción", status: "pendiente", assignee: "SEO Team", dueDate: "2026-05-21", notes: [] },
  ] },
  { id: "diseno", title: "4. Diseño y Recursos", icon: "Image", status: "pendiente", priority: "media", assignees: ["Ana Torres"], richContent: "", checklist: [
    { id: "1", text: "Seleccionar imagen destacada", status: "pendiente", assignee: "Ana Torres", dueDate: "2026-05-22", notes: [] },
  ] },
  { id: "revision", title: "5. Revisión y Aprobación", icon: "CheckCircle2", status: "pendiente", priority: "alta", assignees: ["Ana Torres"], richContent: "", checklist: [
    { id: "1", text: "Revisión editorial final", status: "pendiente", assignee: "Ana Torres", dueDate: "2026-05-23", notes: [] },
  ] },
  { id: "publicacion", title: "6. Publicación", icon: "Send", status: "pendiente", priority: "alta", assignees: ["Luis Peña"], richContent: "", checklist: [
    { id: "1", text: "Programar publicación", status: "pendiente", assignee: "Luis Peña", dueDate: "2026-05-25", notes: [] },
  ] },
];

const DEFAULT_META_FIELDS = [
  { id: "progreso_total", value: 68 },
  { id: "responsable", value: "Luis Peña" },
  { id: "fecha_objetivo", value: "2026-05-25" },
  { id: "categoria", value: "Educación" },
  { id: "palabra_objetivo", value: "1800 – 2200" },
  { id: "estado_seo", value: "Optimizado" },
];

export function BlogEnProduccionView() {
  const { metaFields, updateMetaFields, sections, addSection, updateSection, removeSection } = usePageConfig(
    "/marketing/blog/en-produccion",
    DEFAULT_META_FIELDS,
    initialSections
  );
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageShell
      title="Los 5 errores más comunes al escalar tu operación"
      description="Artículo educativo sobre los fundamentos para crecer sin perder el control de la operación."
      status="en_progreso"
      onNewBlock={() => setCreateOpen(true)}
    >
      <MetaBar fields={metaFields} onFieldsChange={updateMetaFields} />
      {sections.map((s) => (
        <AccordionSection
          key={s.id}
          data={s}
          onChange={(patch) => updateSection(s.id, patch)}
          onDelete={() => removeSection(s.id)}
        />
      ))}
      <AddSectionButton onClick={() => setCreateOpen(true)} />
      <CreateSectionDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addSection} />
    </PageShell>
  );
}

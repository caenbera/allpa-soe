"use client";

import { useState } from "react";
import { PageShell } from "@/components/page-blocks/PageShell";
import { MetaBar } from "@/components/page-blocks/MetaBar";
import { AccordionSection, AddSectionButton, type AccordionSectionData } from "@/components/page-blocks/AccordionSection";
import { CreateSectionDialog } from "@/components/page-blocks/CreateSectionDialog";
import { useSectionsState } from "@/lib/use-sections";
import { usePageConfig } from "@/lib/use-page-config";

const initialSections: AccordionSectionData[] = [
  {
    id: "hero",
    title: "Hero Principal",
    icon: "Sparkles",
    status: "en_progreso",
    priority: "alta",
    assignees: ["Ana Torres", "Luis Peña"],
    richContent:
      "<h3>Objetivo del bloque</h3><p>Captar la atención del visitante desde el primer momento con un mensaje claro, confiable y enfocado en el valor que ofrecemos.</p><h3>Elementos clave</h3><ul><li>Mensaje claro y directo</li><li>Llamado a la acción visible</li><li>Diseño limpio y profesional</li><li>Generar confianza inmediatamente</li></ul>",
    checklist: [
      { id: "1", text: "Logo aprobado", status: "completado", assignee: "Ana Torres", dueDate: "10 may", notes: [{ id: "n1", author: "Ana Torres", text: "Versión final aprobada por dirección.", time: "hace 2 días" }] },
      { id: "2", text: "Texto principal", status: "en_revision", assignee: "Luis Peña", dueDate: "12 may", notes: [{ id: "n2", author: "Luis Peña", text: "Primera versión lista, falta revisión de tono.", time: "hace 1 día" }] },
      { id: "3", text: "CTA principal", status: "pendiente", assignee: "David López", dueDate: "15 may", notes: [] },
      { id: "4", text: "CTA secundario", status: "pendiente", assignee: "Ana Torres", dueDate: "15 may", notes: [] },
    ],
  },
  {
    id: "servicios",
    title: "Servicios",
    icon: "LayoutGrid",
    status: "en_progreso",
    priority: "alta",
    assignees: ["Luis Peña"],
    richContent: "<p>Describe los servicios principales con íconos y una frase corta de valor por cada uno.</p>",
    checklist: [
      { id: "1", text: "Definir los 3 servicios destacados", status: "completado", assignee: "Luis Peña", dueDate: "8 may", notes: [] },
      { id: "2", text: "Redactar descripciones cortas", status: "completado", assignee: "Luis Peña", dueDate: "9 may", notes: [] },
      { id: "3", text: "Seleccionar iconografía", status: "en_revision", assignee: "Ana Torres", dueDate: "14 may", notes: [] },
    ],
  },
  {
    id: "testimonios",
    title: "Testimonios",
    icon: "Quote",
    status: "en_revision",
    priority: "media",
    assignees: ["David López"],
    richContent: "<p>Selecciona 3-4 testimonios reales de clientes con foto, nombre y cargo.</p>",
    checklist: [
      { id: "1", text: "Recopilar testimonios de clientes", status: "completado", assignee: "David López", dueDate: "5 may", notes: [] },
      { id: "2", text: "Diseñar carrusel de testimonios", status: "pendiente", assignee: "David López", dueDate: "18 may", notes: [] },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    icon: "HelpCircle",
    status: "pendiente",
    priority: "media",
    assignees: ["Ana Torres"],
    richContent: "<p>Preguntas frecuentes que reduzcan la fricción antes del contacto o la compra.</p>",
    checklist: [
      { id: "1", text: "Listar 6 preguntas frecuentes", status: "pendiente", assignee: "Ana Torres", dueDate: "20 may", notes: [] },
      { id: "2", text: "Redactar respuestas", status: "pendiente", assignee: "Ana Torres", dueDate: "22 may", notes: [] },
    ],
  },
];

const DEFAULT_META_FIELDS = [
  { id: "progreso_total", value: 62 },
  { id: "responsable", value: "Ana Torres" },
  { id: "fecha_objetivo", value: "2026-06-30" },
  { id: "prioridad", value: "alta" },
];

export function HomepageView() {
  const { sections, addSection, removeSection } = useSectionsState(initialSections);
  const { metaFields, updateMetaFields } = usePageConfig("/marketing/sitio-web/homepage", DEFAULT_META_FIELDS);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageShell
      title="Homepage"
      description="Planificación y estructura de la página principal del sitio web."
      status="en_progreso"
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

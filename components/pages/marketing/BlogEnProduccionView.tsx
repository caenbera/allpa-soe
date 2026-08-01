import { PageShell, MetaStrip } from "@/components/page-blocks/PageShell";
import { AccordionSection, AddSectionButton, type AccordionSectionData } from "@/components/page-blocks/AccordionSection";

const sections: AccordionSectionData[] = [
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
      { id: "1", text: "Definir objetivo del artículo", status: "completado", assignee: "Ana Torres", dueDate: "10 may", notes: [] },
      { id: "2", text: "Investigación de temas y fuentes", status: "completado", assignee: "Luis Peña", dueDate: "12 may", notes: [] },
      { id: "3", text: "Definir keyword principal y secundarias", status: "en_revision", assignee: "SEO Team", dueDate: "13 may", notes: [] },
      { id: "4", text: "Crear esquema del artículo (outline)", status: "pendiente", assignee: "Luis Peña", dueDate: "14 may", notes: [] },
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
      { id: "1", text: "Redactar introducción", status: "completado", assignee: "Luis Peña", dueDate: "16 may", notes: [] },
      { id: "2", text: "Redactar cuerpo del artículo", status: "en_progreso", assignee: "Luis Peña", dueDate: "19 may", notes: [] },
      { id: "3", text: "Redactar cierre y CTA", status: "pendiente", assignee: "Luis Peña", dueDate: "20 may", notes: [] },
    ],
  },
  { id: "seo", title: "3. Optimización SEO", icon: "SearchCheck", status: "en_revision", priority: "media", assignees: ["SEO Team"], richContent: "", checklist: [
    { id: "1", text: "Revisar densidad de keywords", status: "en_revision", assignee: "SEO Team", dueDate: "21 may", notes: [] },
    { id: "2", text: "Optimizar meta título y descripción", status: "pendiente", assignee: "SEO Team", dueDate: "21 may", notes: [] },
  ] },
  { id: "diseno", title: "4. Diseño y Recursos", icon: "Image", status: "pendiente", priority: "media", assignees: ["Ana Torres"], richContent: "", checklist: [
    { id: "1", text: "Seleccionar imagen destacada", status: "pendiente", assignee: "Ana Torres", dueDate: "22 may", notes: [] },
  ] },
  { id: "revision", title: "5. Revisión y Aprobación", icon: "CheckCircle2", status: "pendiente", priority: "alta", assignees: ["Ana Torres"], richContent: "", checklist: [
    { id: "1", text: "Revisión editorial final", status: "pendiente", assignee: "Ana Torres", dueDate: "23 may", notes: [] },
  ] },
  { id: "publicacion", title: "6. Publicación", icon: "Send", status: "pendiente", priority: "alta", assignees: ["Luis Peña"], richContent: "", checklist: [
    { id: "1", text: "Programar publicación", status: "pendiente", assignee: "Luis Peña", dueDate: "25 may", notes: [] },
  ] },
];

export function BlogEnProduccionView() {
  return (
    <PageShell
      title="Los 5 errores más comunes al escalar tu operación"
      description="Artículo educativo sobre los fundamentos para crecer sin perder el control de la operación."
      status="en_progreso"
    >
      <MetaStrip
        items={[
          { label: "Progreso total", value: "68%" },
          { label: "Responsable", value: "Luis Peña" },
          { label: "Fecha objetivo", value: "25 may 2026" },
          { label: "Categoría", value: "Educación" },
          { label: "Palabras objetivo", value: "1800 – 2200" },
          { label: "Estado SEO", value: "Optimizado" },
        ]}
      />
      {sections.map((s) => (
        <AccordionSection key={s.id} data={s} />
      ))}
      <AddSectionButton />
    </PageShell>
  );
}

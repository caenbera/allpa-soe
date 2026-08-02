"use client";

import { useState } from "react";
import type { AccordionSectionData } from "@/components/page-blocks/AccordionSection";
import type { SectionPriority } from "@/lib/types";

export interface NewSectionInput {
  title: string;
  icon: string;
  priority: SectionPriority;
}

/** Estado local (por página) de la lista de bloques tipo acordeón: crear y eliminar. */
export function useSectionsState(initial: AccordionSectionData[]) {
  const [sections, setSections] = useState<AccordionSectionData[]>(initial);

  const addSection = (input: NewSectionInput) => {
    setSections((list) => [
      ...list,
      {
        id: `section-${Date.now()}`,
        title: input.title,
        icon: input.icon,
        priority: input.priority,
        status: "pendiente",
        assignees: [],
        checklist: [],
        richContent: "",
      },
    ]);
  };

  const removeSection = (id: string) => {
    setSections((list) => list.filter((s) => s.id !== id));
  };

  return { sections, addSection, removeSection };
}

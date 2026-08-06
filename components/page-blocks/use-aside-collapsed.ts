"use client";

import { useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const KEY_PREFIX = "allpa:aside-collapsed:";

/**
 * El estado vive en `localStorage`, que está fuera de React: se expone con
 * `useSyncExternalStore`, que es la forma prevista de leer algo que solo
 * existe en el navegador sin desajustar la hidratación.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // `storage` cubre el caso de tenerlo abierto en dos pestañas.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    // Modo privado o almacenamiento bloqueado: se queda desplegado.
    return false;
  }
}

function write(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // Sin persistencia, pero el plegado de esta sesión sigue funcionando.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Recuerda si el panel lateral de esta página quedó plegado.
 *
 * Va en el navegador y no en la configuración de la página porque es una
 * preferencia de quien mira, no de la empresa: guardarla en Firestore se lo
 * plegaría a todo el equipo.
 */
export function useAsideCollapsed() {
  const pathname = usePathname();
  const key = KEY_PREFIX + pathname;

  const collapsed = useSyncExternalStore(
    subscribe,
    () => read(key),
    // En el servidor no hay almacenamiento: se pinta desplegado.
    () => false
  );

  const toggle = useCallback(() => write(key, !read(key)), [key]);

  return { collapsed, toggle };
}

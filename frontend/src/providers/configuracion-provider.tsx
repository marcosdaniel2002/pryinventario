"use client";

import { createContext, useContext, useMemo } from "react";

import { useConfiguraciones } from "@/features/seguridad/configuraciones/hooks";
import type { ConfiguracionListItem } from "@/features/seguridad/configuraciones/types";

interface ConfiguracionContextValue {
  configuracion: ConfiguracionListItem | null;
  isLoading: boolean;
  isError: boolean;
}

const ConfiguracionContext = createContext<ConfiguracionContextValue | null>(null);

/**
 * La configuración de la página (nombre, ícono, descripción, contacto) es
 * pública — se pide una sola vez acá, montado en la raíz (app/layout.tsx),
 * y tanto la landing page pública como el navbar del admin la leen vía
 * `useConfiguracion()` en vez de repetir el fetch cada uno.
 */
export function ConfiguracionProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useConfiguraciones();

  const value = useMemo<ConfiguracionContextValue>(
    () => ({
      configuracion: data?.[0] ?? null,
      isLoading,
      isError,
    }),
    [data, isLoading, isError],
  );

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  );
}

export function useConfiguracion() {
  const context = useContext(ConfiguracionContext);
  if (!context) {
    throw new Error("useConfiguracion must be used within a ConfiguracionProvider");
  }
  return context;
}

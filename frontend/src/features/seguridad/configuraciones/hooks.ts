"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createConfiguracion,
  getConfiguraciones,
  updateConfiguracion,
} from "./api";

const QUERY_KEY = ["configuraciones"];

/**
 * Configuracion es un singleton (un solo registro activo) — no hace falta
 * paginar ni un hook de "eliminar" expuesto en la UI, así que no pasa por
 * `createCrudHooks` (pensada para listados con tabla). Es pública (no
 * depende de un token para funcionar: la landing page sin sesión también
 * la necesita) — ver ConfiguracionProvider, que la expone vía contexto.
 */
export function useConfiguraciones(token?: string | null) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getConfiguraciones(token),
  });
}

export function useCreateConfiguracion(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createConfiguracion(token!, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateConfiguracion(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateConfiguracion(token!, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

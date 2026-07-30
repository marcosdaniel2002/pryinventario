"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { PaginatedResponse } from "./pagination";

/**
 * Los hooks useX/useCreateX/useUpdateX/useDeleteX de cada feature son casi
 * identicos entre entidades (mismo shape de query/mutation + invalidacion).
 * Esta factory los genera una sola vez a partir de las funciones de `api.ts`.
 */

interface CrudHooksConfig<TListItem, TCreateData, TUpdateData> {
  /** Se usa como query key (`[queryKey]`) y para invalidar tras cada mutation. */
  queryKey: string;
  getAll: (token: string) => Promise<TListItem[]>;
  /**
   * Igual que `getAll` pero paginado server-side (usado por la tabla propia
   * de la entidad). `getAll` sigue trayendo el arreglo completo sin paginar
   * — lo siguen usando los combobox de otras pantallas (ej. selector de
   * categoría en Productos), que necesitan la lista entera.
   */
  getAllPaginated?: (
    token: string,
    params: { page: number; limit: number },
  ) => Promise<PaginatedResponse<TListItem>>;
  create: (token: string, data: TCreateData) => Promise<TListItem>;
  update: (token: string, id: string, data: TUpdateData) => Promise<TListItem>;
  delete: (token: string, id: string) => Promise<void>;
  /** Query keys extra a invalidar (ej. ["menu"] en grupos-url, que alimenta el sidebar). */
  extraInvalidateKeys?: string[][];
}

export function createCrudHooks<TListItem, TCreateData, TUpdateData>(
  config: CrudHooksConfig<TListItem, TCreateData, TUpdateData>,
) {
  const queryKey = [config.queryKey];

  function useList(token: string | null) {
    return useQuery({
      queryKey,
      queryFn: () => config.getAll(token!),
      enabled: !!token,
    });
  }

  function useListPaginated(
    token: string | null,
    page: number,
    limit: number,
  ) {
    const getAllPaginated = config.getAllPaginated;
    if (!getAllPaginated) {
      throw new Error(
        `createCrudHooks("${config.queryKey}"): falta getAllPaginated en la config.`,
      );
    }

    return useQuery({
      queryKey: [...queryKey, "paginated", page, limit],
      queryFn: () => getAllPaginated(token!, { page, limit }),
      enabled: !!token,
      // evita el parpadeo a "Cargando..." al cambiar de página.
      placeholderData: keepPreviousData,
    });
  }

  function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey });
    for (const extraKey of config.extraInvalidateKeys ?? []) {
      queryClient.invalidateQueries({ queryKey: extraKey });
    }
  }

  function useCreate(token: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: TCreateData) => config.create(token!, data),
      onSuccess: () => invalidate(queryClient),
    });
  }

  function useUpdate(token: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: TUpdateData }) =>
        config.update(token!, id, data),
      onSuccess: () => invalidate(queryClient),
    });
  }

  function useDelete(token: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => config.delete(token!, id),
      onSuccess: () => invalidate(queryClient),
    });
  }

  return { useList, useListPaginated, useCreate, useUpdate, useDelete };
}

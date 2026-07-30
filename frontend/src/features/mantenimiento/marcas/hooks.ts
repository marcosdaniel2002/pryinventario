"use client";

import { createCrudHooks } from "@/lib/create-crud-hooks";

import { createMarca, deleteMarca, getMarcas, updateMarca } from "./api";
import type { MarcaListItem } from "./types";

const marcasHooks = createCrudHooks<
  MarcaListItem,
  Parameters<typeof createMarca>[1],
  Parameters<typeof updateMarca>[2]
>({
  queryKey: "marcas",
  getAll: getMarcas,
  create: createMarca,
  update: updateMarca,
  delete: deleteMarca,
});

export const useMarcas = marcasHooks.useList;
export const useCreateMarca = marcasHooks.useCreate;
export const useUpdateMarca = marcasHooks.useUpdate;
export const useDeleteMarca = marcasHooks.useDelete;

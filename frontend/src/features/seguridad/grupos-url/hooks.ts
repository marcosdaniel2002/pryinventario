"use client";

import { createCrudHooks } from "@/lib/create-crud-hooks";

import {
  createGrupoUrl,
  deleteGrupoUrl,
  getGruposUrl,
  getGruposUrlPaginated,
  updateGrupoUrl,
} from "./api";
import type { GrupoUrlListItem } from "./types";

const gruposUrlHooks = createCrudHooks<
  GrupoUrlListItem,
  Parameters<typeof createGrupoUrl>[1],
  Parameters<typeof updateGrupoUrl>[2]
>({
  queryKey: "grupos-url",
  getAll: getGruposUrl,
  getAllPaginated: getGruposUrlPaginated,
  create: createGrupoUrl,
  update: updateGrupoUrl,
  delete: deleteGrupoUrl,
  // grupos-url alimenta el menu del sidebar: cualquier cambio lo invalida tambien.
  extraInvalidateKeys: [["menu"]],
});

export const useGruposUrl = gruposUrlHooks.useList;
export const useGruposUrlPaginated = gruposUrlHooks.useListPaginated;
export const useCreateGrupoUrl = gruposUrlHooks.useCreate;
export const useUpdateGrupoUrl = gruposUrlHooks.useUpdate;
export const useDeleteGrupoUrl = gruposUrlHooks.useDelete;

"use client";

import { createCrudHooks } from "@/lib/create-crud-hooks";

import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  getUsuariosPaginated,
  updateUsuario,
} from "./api";
import type { UsuarioListItem } from "./types";

const usuariosHooks = createCrudHooks<
  UsuarioListItem,
  Parameters<typeof createUsuario>[1],
  Parameters<typeof updateUsuario>[2]
>({
  queryKey: "usuarios",
  getAll: getUsuarios,
  getAllPaginated: getUsuariosPaginated,
  create: createUsuario,
  update: updateUsuario,
  delete: deleteUsuario,
});

export const useUsuarios = usuariosHooks.useList;
export const useUsuariosPaginated = usuariosHooks.useListPaginated;
export const useCreateUsuario = usuariosHooks.useCreate;
export const useUpdateUsuario = usuariosHooks.useUpdate;
export const useDeleteUsuario = usuariosHooks.useDelete;

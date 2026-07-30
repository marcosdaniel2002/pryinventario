"use client";

import { createCrudHooks } from "@/lib/create-crud-hooks";

import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  getCategoriasPaginated,
  updateCategoria,
} from "./api";
import type { CategoriaListItem } from "./types";

const categoriasHooks = createCrudHooks<
  CategoriaListItem,
  Parameters<typeof createCategoria>[1],
  Parameters<typeof updateCategoria>[2]
>({
  queryKey: "categorias",
  getAll: getCategorias,
  getAllPaginated: getCategoriasPaginated,
  create: createCategoria,
  update: updateCategoria,
  delete: deleteCategoria,
});

export const useCategorias = categoriasHooks.useList;
export const useCategoriasPaginated = categoriasHooks.useListPaginated;
export const useCreateCategoria = categoriasHooks.useCreate;
export const useUpdateCategoria = categoriasHooks.useUpdate;
export const useDeleteCategoria = categoriasHooks.useDelete;

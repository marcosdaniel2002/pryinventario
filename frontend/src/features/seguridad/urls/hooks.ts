"use client";

import { createCrudHooks } from "@/lib/create-crud-hooks";

import {
  createUrl,
  deleteUrl,
  getUrls,
  getUrlsPaginated,
  updateUrl,
} from "./api";
import type { UrlListItem } from "./types";

const urlsHooks = createCrudHooks<
  UrlListItem,
  Parameters<typeof createUrl>[1],
  Parameters<typeof updateUrl>[2]
>({
  queryKey: "urls",
  getAll: getUrls,
  getAllPaginated: getUrlsPaginated,
  create: createUrl,
  update: updateUrl,
  delete: deleteUrl,
  // urls alimenta el menu del sidebar: cualquier cambio lo invalida tambien.
  extraInvalidateKeys: [["menu"]],
});

export const useUrls = urlsHooks.useList;
export const useUrlsPaginated = urlsHooks.useListPaginated;
export const useCreateUrl = urlsHooks.useCreate;
export const useUpdateUrl = urlsHooks.useUpdate;
export const useDeleteUrl = urlsHooks.useDelete;

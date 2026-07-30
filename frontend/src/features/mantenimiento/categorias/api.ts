import { apiFetch, apiUpload } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type { CategoriaListItem } from "./types";

export function getCategorias(token: string) {
  return apiFetch<CategoriaListItem[]>("/mantenimiento/categorias", token);
}

export function getCategoriasPaginated(
  token: string,
  { page, limit }: { page: number; limit: number },
) {
  return apiFetch<PaginatedResponse<CategoriaListItem>>(
    `/mantenimiento/categorias?page=${page}&limit=${limit}`,
    token,
  );
}

// multipart/form-data (no JSON): mismo formato que el resto del proyecto,
// tenga o no campos de archivo la entidad — ver EntityDialog.
export function createCategoria(token: string, formData: FormData) {
  return apiUpload<CategoriaListItem>(
    "/mantenimiento/categorias",
    token,
    formData,
    "POST",
  );
}

export function updateCategoria(token: string, id: string, formData: FormData) {
  return apiUpload<CategoriaListItem>(
    `/mantenimiento/categorias/${id}`,
    token,
    formData,
    "PATCH",
  );
}

export function deleteCategoria(token: string, id: string) {
  return apiFetch<void>(`/mantenimiento/categorias/${id}`, token, {
    method: "DELETE",
  });
}

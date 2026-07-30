import { apiFetch, apiUpload } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";
import type { ProductoListItem } from "./types";

/** Forma de los datos antes de armar el FormData (ver ProductoDialog). */
export interface ProductoPayload {
  codigo: string;
  nombre: string;
  descripcion?: string;
  costo: number;
  porcentaje_iva: number;
  pvp: number;
  categoria_id?: string;
  marca_id?: string;
}

export function getProductos(token: string) {
  return apiFetch<ProductoListItem[]>("/mantenimiento/productos", token);
}

export interface ProductosFilters {
  criterio?: string;
  categoria_id?: string;
  marca_id?: string;
}

export function getProductosPaginated(
  token: string,
  { page, limit, criterio, categoria_id, marca_id }: {
    page: number;
    limit: number;
  } & ProductosFilters,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (criterio) params.set("criterio", criterio);
  if (categoria_id) params.set("categoria_id", categoria_id);
  if (marca_id) params.set("marca_id", marca_id);

  return apiFetch<PaginatedResponse<ProductoListItem>>(
    `/mantenimiento/productos?${params.toString()}`,
    token,
  );
}

/**
 * Van como multipart/form-data (no JSON): el mismo request crea/actualiza
 * el producto y sube (o saca) la foto — ver EntityDialog.
 */
export function createProducto(token: string, formData: FormData) {
  return apiUpload<ProductoListItem>("/mantenimiento/productos", token, formData, "POST");
}

export function updateProducto(token: string, id: string, formData: FormData) {
  return apiUpload<ProductoListItem>(
    `/mantenimiento/productos/${id}`,
    token,
    formData,
    "PATCH",
  );
}

export function deleteProducto(token: string, id: string) {
  return apiFetch<void>(`/mantenimiento/productos/${id}`, token, {
    method: "DELETE",
  });
}

import { apiFetch } from "@/lib/api-client";
import type { MarcaListItem } from "./types";

export function getMarcas(token: string) {
  return apiFetch<MarcaListItem[]>("/mantenimiento/marcas", token);
}

export function createMarca(token: string, data: { nombre: string }) {
  return apiFetch<MarcaListItem>("/mantenimiento/marcas", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMarca(
  token: string,
  id: string,
  data: Partial<{ nombre: string }>,
) {
  return apiFetch<MarcaListItem>(`/mantenimiento/marcas/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteMarca(token: string, id: string) {
  return apiFetch<void>(`/mantenimiento/marcas/${id}`, token, {
    method: "DELETE",
  });
}

import { apiFetch, apiUpload } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";

import type { RolListItem } from "./types";

export function getRoles(token: string) {
  return apiFetch<RolListItem[]>("/seguridad/roles", token);
}

export function getRolesPaginated(
  token: string,
  { page, limit }: { page: number; limit: number }
) {
  return apiFetch<PaginatedResponse<RolListItem>>(
    `/seguridad/roles?page=${page}&limit=${limit}`,
    token
  );
}

// multipart/form-data (no JSON): mismo formato que el resto del proyecto —
// ver EntityDialog. Roles no usa EntityDialog (tiene diálogos a medida por
// el checklist de urls), así que el armado del FormData vive acá adentro
// en vez de en el componente.
function toFormData(data: Record<string, unknown>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    formData.append(key, String(value));
  }
  return formData;
}

export function createRol(
  token: string,
  data: { nombre: string; descripcion?: string }
) {
  return apiUpload<RolListItem>(
    "/seguridad/roles",
    token,
    toFormData(data),
    "POST"
  );
}

export function updateRol(
  token: string,
  id: string,
  data: Partial<{ nombre: string; descripcion: string }>
) {
  return apiUpload<RolListItem>(
    `/seguridad/roles/${id}`,
    token,
    toFormData(data),
    "PATCH"
  );
}

export function deleteRol(token: string, id: string) {
  return apiFetch<void>(`/seguridad/roles/${id}`, token, {
    method: "DELETE",
  });
}

export function getRolUrlIds(token: string, rolId: string) {
  return apiFetch<{ url_ids: string[] }>(
    `/seguridad/roles/${rolId}/urls`,
    token
  );
}

export function setRolUrlIds(token: string, rolId: string, urlIds: string[]) {
  const formData = new FormData();
  // url_ids es un array: va como un único campo con el JSON adentro (ver
  // AssignRolUrlsDto en el backend, que lo parsea de vuelta).
  formData.append("url_ids", JSON.stringify(urlIds));

  return apiUpload<{ url_ids: string[] }>(
    `/seguridad/roles/${rolId}/urls`,
    token,
    formData,
    "PUT"
  );
}

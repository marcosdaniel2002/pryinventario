import { apiFetch, apiUpload } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";

import type { GrupoUrlListItem } from "./types";

export function getGruposUrl(token: string) {
  return apiFetch<GrupoUrlListItem[]>("/seguridad/grupos-url", token);
}

export function getGruposUrlPaginated(
  token: string,
  { page, limit }: { page: number; limit: number },
) {
  return apiFetch<PaginatedResponse<GrupoUrlListItem>>(
    `/seguridad/grupos-url?page=${page}&limit=${limit}`,
    token,
  );
}

// multipart/form-data (no JSON): mismo formato que el resto del proyecto,
// tenga o no campos de archivo la entidad — ver EntityDialog.
export function createGrupoUrl(token: string, formData: FormData) {
  return apiUpload<GrupoUrlListItem>(
    "/seguridad/grupos-url",
    token,
    formData,
    "POST",
  );
}

export function updateGrupoUrl(token: string, id: string, formData: FormData) {
  return apiUpload<GrupoUrlListItem>(
    `/seguridad/grupos-url/${id}`,
    token,
    formData,
    "PATCH",
  );
}

export function deleteGrupoUrl(token: string, id: string) {
  return apiFetch<void>(`/seguridad/grupos-url/${id}`, token, {
    method: "DELETE",
  });
}

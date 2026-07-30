import { apiFetch, apiUpload } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";

import type { UsuarioListItem } from "./types";

export function getUsuarios(token: string) {
  return apiFetch<UsuarioListItem[]>("/seguridad/usuarios", token);
}

export function getUsuariosPaginated(
  token: string,
  { page, limit }: { page: number; limit: number },
) {
  return apiFetch<PaginatedResponse<UsuarioListItem>>(
    `/seguridad/usuarios?page=${page}&limit=${limit}`,
    token,
  );
}

// multipart/form-data (no JSON): mismo formato que el resto del proyecto,
// tenga o no campos de archivo la entidad — ver EntityDialog.
export function createUsuario(token: string, formData: FormData) {
  return apiUpload<UsuarioListItem>(
    "/seguridad/usuarios",
    token,
    formData,
    "POST",
  );
}

export function updateUsuario(token: string, id: string, formData: FormData) {
  return apiUpload<UsuarioListItem>(
    `/seguridad/usuarios/${id}`,
    token,
    formData,
    "PATCH",
  );
}

export function deleteUsuario(token: string, id: string) {
  return apiFetch<void>(`/seguridad/usuarios/${id}`, token, {
    method: "DELETE",
  });
}

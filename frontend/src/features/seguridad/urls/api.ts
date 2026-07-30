import { apiFetch, apiUpload } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/pagination";

import type { UrlListItem } from "./types";

export function getUrls(token: string) {
  return apiFetch<UrlListItem[]>("/seguridad/urls", token);
}

export function getUrlsPaginated(
  token: string,
  { page, limit }: { page: number; limit: number }
) {
  return apiFetch<PaginatedResponse<UrlListItem>>(
    `/seguridad/urls?page=${page}&limit=${limit}`,
    token
  );
}

// multipart/form-data (no JSON): mismo formato que el resto del proyecto,
// tenga o no campos de archivo la entidad — ver EntityDialog.
export function createUrl(token: string, formData: FormData) {
  return apiUpload<UrlListItem>("/seguridad/urls", token, formData, "POST");
}

export function updateUrl(token: string, id: string, formData: FormData) {
  return apiUpload<UrlListItem>(
    `/seguridad/urls/${id}`,
    token,
    formData,
    "PATCH",
  );
}

export function deleteUrl(token: string, id: string) {
  return apiFetch<void>(`/seguridad/urls/${id}`, token, {
    method: "DELETE",
  });
}

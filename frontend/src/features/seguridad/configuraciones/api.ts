import { apiFetch, apiUpload } from "@/lib/api-client";
import type { ConfiguracionListItem } from "./types";

// Público: sin guard en el backend (nombre/ícono/descripción/contacto los
// consume tanto la landing page pública como el navbar del admin). El token
// es opcional acá — si hay uno lo manda igual, pero no hace falta.
export function getConfiguraciones(token?: string | null) {
  return apiFetch<ConfiguracionListItem[]>("/seguridad/configuraciones", token);
}

// multipart/form-data (no JSON): mismo formato que el resto del proyecto —
// ver EntityDialog. Acá no se usa EntityDialog (es un form directo en la
// página, no un dialog crear/editar), pero el wire format es el mismo.
export function createConfiguracion(token: string, formData: FormData) {
  return apiUpload<ConfiguracionListItem>(
    "/seguridad/configuraciones",
    token,
    formData,
    "POST",
  );
}

export function updateConfiguracion(token: string, id: string, formData: FormData) {
  return apiUpload<ConfiguracionListItem>(
    `/seguridad/configuraciones/${id}`,
    token,
    formData,
    "PATCH",
  );
}

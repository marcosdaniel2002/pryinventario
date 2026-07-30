import { API_URL } from "./api-client";

/** Convierte una ruta relativa devuelta por el backend (ej. "/media/producto/x.jpg") en una URL absoluta. */
export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${API_URL}${path}`;
}

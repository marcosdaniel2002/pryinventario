/**
 * Vuelca un objeto plano de primitivos en un FormData, saltando undefined/
 * null (así toCreatePayload/toUpdatePayload pueden omitir un campo entero
 * en vez de mandar ""). Usado por EntityDialog y por cualquier form fuera
 * de un dialog que también hable multipart/form-data (ej. ConfiguracionForm).
 */
export function appendFormData(formData: FormData, payload: Record<string, unknown>) {
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    formData.append(key, String(value));
  }
}

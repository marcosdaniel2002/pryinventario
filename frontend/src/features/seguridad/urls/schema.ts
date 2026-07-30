import { z } from "zod";

export const urlFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  path: z.string().min(1, "El path es obligatorio"),
  icono: z.string().optional(),
  orden: z.number().int().optional(),
  grupo_url_id: z.string().min(1, "El grupo es obligatorio"),
});

export type UrlFormValues = z.infer<typeof urlFormSchema>;

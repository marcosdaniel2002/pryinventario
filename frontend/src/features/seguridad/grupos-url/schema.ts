import { z } from "zod";

export const grupoUrlFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  path: z.string().min(1, "El path es obligatorio"),
  icono: z.string().optional(),
  orden: z.number().int().optional(),
});

export type GrupoUrlFormValues = z.infer<typeof grupoUrlFormSchema>;

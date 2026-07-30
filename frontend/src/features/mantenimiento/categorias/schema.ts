import { z } from "zod";

export const categoriaFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

export type CategoriaFormValues = z.infer<typeof categoriaFormSchema>;

import { z } from "zod";

export const configuracionFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  celular: z.string().optional(),
  correo: z
    .union([z.literal(""), z.string().email("El correo no es válido")])
    .optional(),
});

export type ConfiguracionFormValues = z.infer<typeof configuracionFormSchema>;

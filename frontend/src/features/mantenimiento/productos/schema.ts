import { z } from "zod";

export const productoFormSchema = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  costo: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  porcentaje_iva: z
    .number()
    .min(0, "El porcentaje de IVA debe ser mayor o igual a 0"),
  pvp: z.number().min(0, "El PVP debe ser mayor o igual a 0"),
  categoria_id: z.string().optional(),
  marca_id: z.string().optional(),
});

export type ProductoFormValues = z.infer<typeof productoFormSchema>;

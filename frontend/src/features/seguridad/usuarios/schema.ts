import { z } from "zod";

// Password requerida al crear (min 4, igual que el backend @MinLength(4)).
export const usuarioFormSchema = z.object({
  username: z.string().min(1, "El username es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().optional(),
  rol_id: z.string().min(1, "El rol es obligatorio"),
  password: z
    .string()
    .min(4, "La contraseña debe tener al menos 4 caracteres"),
});

export type UsuarioFormValues = z.infer<typeof usuarioFormSchema>;

// Password opcional al editar: vacio = no cambiarla. `.optional()` hace que
// AutoForm no le ponga "*" a este campo en el form de edicion.
export const usuarioEditFormSchema = z.object({
  username: z.string().min(1, "El username es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().optional(),
  rol_id: z.string().min(1, "El rol es obligatorio"),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 4, {
      message: "La contraseña debe tener al menos 4 caracteres",
    }),
});

export type UsuarioEditFormValues = z.infer<typeof usuarioEditFormSchema>;

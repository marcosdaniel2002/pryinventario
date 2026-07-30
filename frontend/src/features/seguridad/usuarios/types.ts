import type { Rol } from "@/features/seguridad/roles/types";

export interface UsuarioListItem {
  id: string;
  username: string;
  nombre: string;
  email: string | null;
  rol: Rol;
}

import type { Rol } from "@/features/seguridad/roles/types";

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  email: string | null;
  rol: Rol;
}

export interface LoginResponse {
  accessToken: string;
  usuario: Usuario;
}

export interface MenuUrl {
  id: string;
  nombre: string;
  path: string;
  icono: string | null;
  orden: number;
}

export interface MenuGrupo {
  id: string;
  nombre: string;
  path: string;
  icono: string | null;
  orden: number;
  urls: MenuUrl[];
}

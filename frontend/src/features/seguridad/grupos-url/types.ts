import type { MenuUrl } from "@/features/auth/types";

export interface GrupoUrlListItem {
  id: string;
  nombre: string;
  path: string;
  icono: string | null;
  orden: number;
  urls: MenuUrl[];
}

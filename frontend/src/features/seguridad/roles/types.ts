// Minimal reference shape used wherever another entity points at a Rol
// (e.g. `usuarios`' `rol` field) without needing the full RolListItem.
export interface Rol {
  id: string;
  nombre: string;
}

export interface RolListItem {
  id: string;
  nombre: string;
  descripcion: string | null;
}

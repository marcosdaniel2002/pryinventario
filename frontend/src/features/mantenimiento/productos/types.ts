export interface ProductoListItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  costo: number;
  porcentaje_iva: number;
  pvp: number;
  categoria_id: string | null;
  marca_id: string | null;
  /** Ruta relativa servida por el backend (ej. "/media/producto/x.jpg"), o null si no tiene. */
  foto: string | null;
  /** Segunda foto, misma forma que `foto` (ej. "/media/producto-2/x.jpg"). */
  foto_2: string | null;
}

export interface ConfiguracionListItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  /** Ruta relativa servida por el backend (ej. "/media/configuracion/x.jpg"), o null si no tiene. */
  icono: string | null;
  celular: string | null;
  correo: string | null;
}

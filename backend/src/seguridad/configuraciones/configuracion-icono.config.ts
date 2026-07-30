import { join } from 'path';
import type { ImageUploadFieldConfig } from 'src/common/upload/image-upload.factory';

export interface ConfiguracionIconoField extends ImageUploadFieldConfig {
  name: 'icono';
  urlPrefix: string;
}

/**
 * Carpeta en disco donde se guarda el icono de la configuración —
 * configurable vía env var CONFIGURACION_ICONO_DIR (ej. una ruta absoluta
 * a otro disco); si no se define, cae en ./media/configuracion.
 */
export const CONFIGURACION_ICONO_FIELD: ConfiguracionIconoField = {
  name: 'icono',
  destinationDir:
    process.env.CONFIGURACION_ICONO_DIR ??
    join(process.cwd(), 'media', 'configuracion'),
  urlPrefix: '/media/configuracion',
};

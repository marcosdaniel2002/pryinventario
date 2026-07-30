import { join } from 'path';
import type { ImageUploadFieldConfig } from 'src/common/upload/image-upload.factory';

export type ProductoFotoFieldName = 'foto' | 'foto_2';

/** Shape que arma Nest con `@UploadedFiles()` + `FileFieldsInterceptor`. */
export type ProductoFotoFiles = Partial<
  Record<ProductoFotoFieldName, Express.Multer.File[]>
>;

export interface ProductoFotoField extends ImageUploadFieldConfig {
  name: ProductoFotoFieldName;
  /**
   * Prefijo público bajo el que se sirve este campo (ver main.ts, que monta
   * `destinationDir` en esta ruta con `useStaticAssets`). Queda fijo aunque
   * `destinationDir` apunte a cualquier carpeta del disco.
   */
  urlPrefix: string;
}

/**
 * Un campo de foto por entrada, cada uno con su propia carpeta en disco
 * (configurable por env var, "que yo pueda elegir la ruta"), sus propios
 * mimetypes permitidos y su propio tamaño máximo (ver
 * createImageUploadOptions, que es genérico para N campos). Agregar otra
 * foto a Producto es agregar una entrada más acá.
 */
export const PRODUCTO_FOTO_FIELDS: ProductoFotoField[] = [
  {
    name: 'foto',
    destinationDir:
      process.env.PRODUCTO_FOTOS_DIR ?? join(process.cwd(), 'media', 'producto'),
    urlPrefix: '/media/producto',
  },
  {
    name: 'foto_2',
    destinationDir:
      process.env.PRODUCTO_FOTOS_2_DIR ?? join(process.cwd(), 'media', 'producto-2'),
    urlPrefix: '/media/producto-2',
  },
];

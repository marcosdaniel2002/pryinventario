import { BadRequestException } from '@nestjs/common';
import type { MulterModuleOptions } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import { extname } from 'path';
import { diskStorage } from 'multer';

const DEFAULT_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ImageUploadFieldConfig {
  /** Nombre del campo en el multipart (ej. "foto", "foto_2"). */
  name: string;
  /** Carpeta en disco donde se guardan los archivos de este campo. */
  destinationDir: string;
  /** Mimetypes permitidos para este campo. Default: jpg/png/webp. */
  allowedMimeTypes?: string[];
  /** Tamaño máximo en bytes para este campo. Default: 5MB. */
  maxFileSizeBytes?: number;
}

/**
 * Config de multer reusable para uno o más campos de imagen, cada uno con
 * su propia carpeta, mimetypes permitidos y tamaño máximo. Pensada para
 * `FileFieldsInterceptor` cuando una entidad tiene más de un campo de
 * archivo (ej. Producto con "foto" y "foto_2") — ver producto-foto.config.ts.
 *
 * multer solo admite un `limits.fileSize` por instancia, no uno por campo:
 * acá se usa el mayor de todos como techo duro de multer (early-reject de
 * uploads gigantes), y el límite exacto de cada campo se revisa después de
 * subido con `assertUploadedFilesWithinLimits`.
 */
export function createImageUploadOptions(fields: ImageUploadFieldConfig[]): MulterModuleOptions {
  const configByFieldName = new Map(fields.map((field) => [field.name, field]));

  for (const field of fields) {
    if (!existsSync(field.destinationDir)) {
      mkdirSync(field.destinationDir, { recursive: true });
    }
  }

  return {
    storage: diskStorage({
      destination: (_req, file, callback) => {
        const field = configByFieldName.get(file.fieldname);
        if (!field) {
          callback(
            new BadRequestException(`Campo de archivo "${file.fieldname}" no esperado.`),
            '',
          );
          return;
        }
        callback(null, field.destinationDir);
      },
      filename: (_req, file, callback) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
        callback(null, uniqueName);
      },
    }),
    fileFilter: (_req, file, callback) => {
      const field = configByFieldName.get(file.fieldname);
      const allowedMimeTypes = field?.allowedMimeTypes ?? DEFAULT_IMAGE_MIME_TYPES;
      if (!field || !allowedMimeTypes.includes(file.mimetype)) {
        callback(
          new BadRequestException(
            `El campo "${file.fieldname}" solo acepta: ${allowedMimeTypes.join(', ')}.`,
          ),
          false,
        );
        return;
      }
      callback(null, true);
    },
    limits: {
      fileSize: Math.max(
        DEFAULT_MAX_FILE_SIZE_BYTES,
        ...fields.map((field) => field.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES),
      ),
    },
  };
}

/**
 * Revisa el tamaño real de cada archivo ya subido contra el límite propio
 * de su campo (multer solo puede aplicar el límite global de arriba) y, si
 * alguno se pasa, borra TODOS los archivos de la tanda antes de tirar el
 * error — para no dejar huérfano en disco un archivo de otro campo que sí
 * era válido.
 */
export async function assertUploadedFilesWithinLimits(
  files: Express.Multer.File[],
  fields: ImageUploadFieldConfig[],
): Promise<void> {
  const configByFieldName = new Map(fields.map((field) => [field.name, field]));

  const violation = files.find((file) => {
    const maxFileSizeBytes =
      configByFieldName.get(file.fieldname)?.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
    return file.size > maxFileSizeBytes;
  });

  if (!violation) return;

  await Promise.all(files.map((file) => unlink(file.path).catch(() => undefined)));

  const maxFileSizeBytes =
    configByFieldName.get(violation.fieldname)?.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  throw new BadRequestException(
    `El campo "${violation.fieldname}" no puede superar ${(maxFileSizeBytes / (1024 * 1024)).toFixed(1)}MB.`,
  );
}

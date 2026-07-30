import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { PRODUCTO_FOTO_FIELDS } from './mantenimiento/productos/producto-foto.config';
import { CONFIGURACION_ICONO_FIELD } from './seguridad/configuraciones/configuracion-icono.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Sirve las fotos/iconos como archivos estáticos, una carpeta por campo,
  // sin importar en qué carpeta del disco esté configurado cada una.
  for (const field of [...PRODUCTO_FOTO_FIELDS, CONFIGURACION_ICONO_FIELD]) {
    app.useStaticAssets(field.destinationDir, { prefix: field.urlPrefix });
  }
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

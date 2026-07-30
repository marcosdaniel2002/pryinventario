import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeguridadModule } from './seguridad/seguridad.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MantenimientoModule } from './mantenimiento/mantenimiento.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // BASICOS
    PrismaModule,
    SeguridadModule,
    AuthModule,
    // CUSTOMS
    MantenimientoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { MarcasRepository } from './marcas.repository';

@Module({
  controllers: [MarcasController],
  providers: [MarcasService, MarcasRepository],
  exports: [MarcasService, MarcasRepository],
})
export class MarcasModule {}

import { Module } from '@nestjs/common';
import { ProductosModule } from './productos/productos.module';
import { MarcasModule } from './marcas/marcas.module';
import { CategoriasModule } from './categorias/categorias.module';

@Module({
  imports: [ProductosModule, MarcasModule, CategoriasModule],
  exports: [],
})
export class MantenimientoModule {}

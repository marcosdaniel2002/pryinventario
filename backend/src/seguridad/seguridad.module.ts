import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { GruposUrlModule } from './grupos-url/grupos-url.module';
import { UrlsModule } from './urls/urls.module';
import { ConfiguracionesModule } from './configuraciones/configuraciones.module';

@Module({
  imports: [RolesModule, UsuariosModule, GruposUrlModule, UrlsModule, ConfiguracionesModule],
  exports: [RolesModule, UsuariosModule, GruposUrlModule, UrlsModule, ConfiguracionesModule],
})
export class SeguridadModule {}

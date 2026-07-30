import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosRepository } from '../seguridad/usuarios/usuarios.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosRepository: UsuariosRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const usuario = await this.usuariosRepository.findByUsername(username);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (usuario.status === false) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(password, usuario.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return usuario;
  }

  login(usuario: {
    id: string;
    username: string;
    nombre: string;
    email: string | null;
    rol_id: string;
    rol: { id: string; nombre: string };
  }) {
    const payload = {
      sub: usuario.id,
      username: usuario.username,
      rolId: usuario.rol_id,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: {
          id: usuario.rol.id,
          nombre: usuario.rol.nombre,
        },
      },
    };
  }
}

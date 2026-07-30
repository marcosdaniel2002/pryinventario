import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuariosRepository } from '../seguridad/usuarios/usuarios.repository';
import { UrlsService } from '../seguridad/urls/urls.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosRepository: UsuariosRepository,
    private readonly urlsService: UrlsService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const usuario = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    return this.authService.login(usuario);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const userId = (req.user as { id: string }).id;
    const usuario = await this.usuariosRepository.findOne(userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: {
        id: usuario.rol.id,
        nombre: usuario.rol.nombre,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('menu')
  getMenu(@Req() req: Request) {
    const rolId = (req.user as { rolId: string }).rolId;
    return this.urlsService.getMenu(rolId);
  }
}

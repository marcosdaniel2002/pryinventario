import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UsuariosRepository } from './usuarios.repository';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(private readonly usuariosRepository: UsuariosRepository) {}

  private sanitize<T extends { password: string }>(usuario: T) {
    const { password, ...rest } = usuario;
    return rest;
  }

  async create(createUsuarioDto: CreateUsuarioDto, usuarioActualId: string) {
    await this.ensureUsernameDisponible(createUsuarioDto.username);
    if (createUsuarioDto.email) {
      await this.ensureEmailDisponible(createUsuarioDto.email);
    }

    const { password, ...rest } = createUsuarioDto;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const data: Prisma.UsuarioUncheckedCreateInput = {
      ...rest,
      password: hashedPassword,
    };

    const usuario = await this.usuariosRepository.create(
      data,
      usuarioActualId,
    );
    return this.sanitize(usuario);
  }

  /**
   * Sin page/limit devuelve el arreglo completo (lo consumen los combobox
   * de otras pantallas). Con page/limit devuelve `{ data, total, page,
   * limit }` para la tabla propia.
   */
  async findAll(page?: number, limit?: number) {
    if (page === undefined && limit === undefined) {
      const usuarios = await this.usuariosRepository.findAll();
      return usuarios.map((usuario) => this.sanitize(usuario));
    }

    return this.findAllPaginated(page ?? 1, limit ?? 10);
  }

  private async findAllPaginated(page: number, limit: number) {
    const { data, total } = await this.usuariosRepository.findAllPaginated(
      page,
      limit,
    );
    return { data: data.map((usuario) => this.sanitize(usuario)), total, page, limit };
  }

  async findOne(id: string) {
    const usuario = await this.usuariosRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return this.sanitize(usuario);
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
    usuarioActualId: string,
  ) {
    await this.ensureExists(id);

    if (updateUsuarioDto.username) {
      await this.ensureUsernameDisponible(updateUsuarioDto.username, id);
    }
    if (updateUsuarioDto.email) {
      await this.ensureEmailDisponible(updateUsuarioDto.email, id);
    }

    const { password, ...rest } = updateUsuarioDto;
    const data: Prisma.UsuarioUncheckedUpdateInput = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const usuario = await this.usuariosRepository.update(
      id,
      data,
      usuarioActualId,
    );
    return this.sanitize(usuario);
  }

  async remove(id: string, usuarioActualId: string) {
    await this.ensureExists(id);
    const usuario = await this.usuariosRepository.deactivate(
      id,
      usuarioActualId,
    );
    return this.sanitize(usuario);
  }

  private async ensureExists(id: string) {
    const usuario = await this.usuariosRepository.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  private async ensureUsernameDisponible(username: string, excludeId?: string) {
    const existente = await this.usuariosRepository.findActiveByUsername(
      username,
      excludeId,
    );
    if (existente) {
      throw new ConflictException(
        `Ya existe un usuario activo con el username "${username}"`,
      );
    }
  }

  private async ensureEmailDisponible(email: string, excludeId?: string) {
    const existente = await this.usuariosRepository.findActiveByEmail(
      email,
      excludeId,
    );
    if (existente) {
      throw new ConflictException(
        `Ya existe un usuario activo con el email "${email}"`,
      );
    }
  }
}

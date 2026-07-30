import { Injectable, NotFoundException } from '@nestjs/common';
import { MarcasRepository } from './marcas.repository';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Injectable()
export class MarcasService {
  constructor(private readonly marcasRepository: MarcasRepository) {}

  create(createMarcaDto: CreateMarcaDto, usuarioActualId: string) {
    return this.marcasRepository.create(createMarcaDto, usuarioActualId);
  }

  findAll() {
    return this.marcasRepository.findAll();
  }

  async findOne(id: string) {
    const marca = await this.marcasRepository.findOne(id);
    if (!marca) {
      throw new NotFoundException(`Marca con id ${id} no encontrado`);
    }
    return marca;
  }

  async update(
    id: string,
    updateMarcaDto: UpdateMarcaDto,
    usuarioActualId: string,
  ) {
    await this.findOne(id);
    return this.marcasRepository.update(id, updateMarcaDto, usuarioActualId);
  }

  async remove(id: string, usuarioActualId: string) {
    await this.findOne(id);
    return this.marcasRepository.deactivate(id, usuarioActualId);
  }
}

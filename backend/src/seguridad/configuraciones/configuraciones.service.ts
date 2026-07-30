import { Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { ConfiguracionesRepository } from './configuraciones.repository';
import { CreateConfiguracionDto } from './dto/create-configuracion.dto';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';
import { CONFIGURACION_ICONO_FIELD } from './configuracion-icono.config';

@Injectable()
export class ConfiguracionesService {
  constructor(private readonly configuracionesRepository: ConfiguracionesRepository) {}

  create(
    createConfiguracionDto: CreateConfiguracionDto,
    icono: Express.Multer.File | undefined,
    usuarioActualId: string,
  ) {
    const iconoUrl = icono
      ? `${CONFIGURACION_ICONO_FIELD.urlPrefix}/${icono.filename}`
      : undefined;

    return this.configuracionesRepository.create(
      { ...createConfiguracionDto, ...(iconoUrl ? { icono: iconoUrl } : {}) },
      usuarioActualId,
    );
  }

  findAll() {
    return this.configuracionesRepository.findAll();
  }

  async findOne(id: string) {
    const configuracion = await this.configuracionesRepository.findOne(id);
    if (!configuracion) {
      throw new NotFoundException(`Configuracion con id ${id} no encontrado`);
    }
    return configuracion;
  }

  async update(
    id: string,
    updateConfiguracionDto: UpdateConfiguracionDto,
    icono: Express.Multer.File | undefined,
    usuarioActualId: string,
  ) {
    const configuracion = await this.findOne(id);

    const { icono_eliminar, ...datosConfiguracion } = updateConfiguracionDto;

    // undefined = no tocar el icono actual; el resto de los casos sí lo tocan.
    let iconoUrl: string | null | undefined;
    if (icono) {
      if (configuracion.icono) await this.deleteIconoFile(configuracion.icono);
      iconoUrl = `${CONFIGURACION_ICONO_FIELD.urlPrefix}/${icono.filename}`;
    } else if (icono_eliminar && configuracion.icono) {
      await this.deleteIconoFile(configuracion.icono);
      iconoUrl = null;
    }

    return this.configuracionesRepository.update(
      id,
      { ...datosConfiguracion, ...(iconoUrl !== undefined ? { icono: iconoUrl } : {}) },
      usuarioActualId,
    );
  }

  async remove(id: string, usuarioActualId: string) {
    await this.findOne(id);
    return this.configuracionesRepository.deactivate(id, usuarioActualId);
  }

  /** Borra el archivo de disco correspondiente a un icono ya reemplazado o eliminado. */
  private async deleteIconoFile(icono: string) {
    const filename = icono.replace(`${CONFIGURACION_ICONO_FIELD.urlPrefix}/`, '');
    await unlink(join(CONFIGURACION_ICONO_FIELD.destinationDir, filename)).catch(
      () => undefined,
    );
  }
}

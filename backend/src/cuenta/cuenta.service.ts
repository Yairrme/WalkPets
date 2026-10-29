import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { normalizarTelefono } from '../common/telefono';
import { PaseadoresService } from '../paseadores/paseadores.service';
import { CambiosUsuario, UsuarioPublico, UsuariosService } from '../usuarios/usuarios.service';
import { ActualizarCuentaDto } from './dto/actualizar-cuenta.dto';

// Cuenta del usuario autenticado ("Mi perfil"). Coordina usuarios y perfiles
// de paseador para que nombre y teléfono queden iguales en ambos.
@Injectable()
export class CuentaService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly paseadores: PaseadoresService
  ) {}

  async obtener(usuarioId: string): Promise<UsuarioPublico> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new NotFoundException('No encontramos tu cuenta.');
    return this.usuarios.publico(usuario);
  }

  async actualizar(usuarioId: string, datos: ActualizarCuentaDto): Promise<UsuarioPublico> {
    const actual = await this.usuarios.buscarPorId(usuarioId);
    if (!actual) throw new NotFoundException('No encontramos tu cuenta.');

    const cambios: CambiosUsuario = {};
    if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
    if (datos.apellido !== undefined) cambios.apellido = datos.apellido;
    if (datos.ciudad !== undefined) cambios.ciudad = datos.ciudad;
    if (datos.barrio !== undefined) cambios.barrio = datos.barrio;
    if (datos.mascotas !== undefined) cambios.mascotas = datos.mascotas;

    if (datos.telefono !== undefined) {
      if (!datos.telefono.trim()) {
        if (actual.rol === 'paseador') {
          throw new BadRequestException('El teléfono es obligatorio para los paseadores.');
        }
        cambios.telefono = null;
      } else {
        const normalizado = normalizarTelefono(datos.telefono);
        if (!normalizado) throw new BadRequestException('El teléfono no es válido.');
        cambios.telefono = `+${normalizado}`;
      }
    }

    const usuario = await this.usuarios.actualizar(usuarioId, cambios);
    if (!usuario) throw new NotFoundException('No encontramos tu cuenta.');

    if (usuario.rol === 'paseador') {
      if (cambios.nombre !== undefined || cambios.apellido !== undefined) {
        await this.paseadores.sincronizarNombre(usuarioId, usuario.nombre, usuario.apellido);
      }
      if (cambios.telefono) {
        await this.paseadores.actualizarPropio(usuarioId, { telefono: cambios.telefono });
      }
    }

    return this.usuarios.publico(usuario);
  }
}

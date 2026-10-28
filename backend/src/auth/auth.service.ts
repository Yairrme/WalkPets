import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { normalizarTelefono } from '../common/telefono';
import { PaseadoresService } from '../paseadores/paseadores.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto, RegistroDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/usuario-autenticado';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly paseadores: PaseadoresService,
    private readonly jwt: JwtService
  ) {}

  async registro(dto: RegistroDto) {
    const esPaseador = dto.rol === 'paseador';

    if (esPaseador && !dto.paseador) {
      throw new BadRequestException(
        'Los paseadores deben enviar los datos de su perfil.'
      );
    }

    let telefono: string | null = null;
    if (dto.telefono?.trim()) {
      const normalizado = normalizarTelefono(dto.telefono);
      if (!normalizado) {
        throw new BadRequestException('El teléfono no es válido.');
      }
      telefono = `+${normalizado}`;
    }

    if (esPaseador && !telefono) {
      throw new BadRequestException(
        'El teléfono es obligatorio para los paseadores.'
      );
    }

    const usuario = await this.usuarios.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      password: dto.password,
      telefono,
      rol: dto.rol,
    });

    try {
      let perfil = null;

      if (esPaseador && dto.paseador) {
        perfil = await this.paseadores.crearPerfil(
          usuario,
          dto.paseador,
          telefono
        );
      }

      return {
        accessToken: this.firmarToken(
          usuario._id.toString(),
          usuario.email,
          usuario.rol
        ),
        usuario: this.usuarios.publico(usuario),
        ...(perfil
          ? { paseador: this.paseadores.mapear(perfil, { resenas: [] }) }
          : {}),
      };
    } catch (error) {
      // Si falla la creación del perfil, no dejamos una cuenta huérfana.
      await this.usuarios.eliminar(usuario._id.toString());
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.buscarPorEmailConPassword(dto.email);

    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const coincide = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!coincide) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    return {
      accessToken: this.firmarToken(
        usuario._id.toString(),
        usuario.email,
        usuario.rol
      ),
      usuario: this.usuarios.publico(usuario),
    };
  }

  private firmarToken(sub: string, email: string, rol: JwtPayload['rol']) {
    const payload: JwtPayload = { sub, email, rol };
    return this.jwt.sign(payload);
  }
}

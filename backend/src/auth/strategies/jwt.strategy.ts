import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../../usuarios/usuarios.service';
import {
  JwtPayload,
  UsuarioAutenticado,
} from '../interfaces/usuario-autenticado';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usuarios: UsuariosService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload): Promise<UsuarioAutenticado> {
    const usuario = await this.usuarios.buscarPorId(payload.sub);

    if (!usuario) {
      throw new UnauthorizedException('La sesión ya no es válida.');
    }

    return {
      id: usuario._id.toString(),
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
    };
  }
}

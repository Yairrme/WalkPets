import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Exige un JWT válido. Las rutas privadas lo usan junto con RolesGuard.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegistroDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Registra un cliente o un paseador' })
  registro(@Body() dto: RegistroDto) {
    return this.auth.registro(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Inicia sesión y devuelve un JWT' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}

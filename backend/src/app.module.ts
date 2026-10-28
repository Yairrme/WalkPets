import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { validarEntorno } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { PaseadoresModule } from './paseadores/paseadores.module';
import { ResenasModule } from './resenas/resenas.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validarEntorno }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    UsuariosModule,
    PaseadoresModule,
    ResenasModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}

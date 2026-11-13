import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AdminService } from '../admin/admin.service';
import { AppModule } from '../app.module';

// Crea (o actualiza la contraseña de) la cuenta de administrador.
// Uso: completar ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env y correr
// `npm run crear-admin`. Nunca se imprime la contraseña.
async function crearAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const config = app.get(ConfigService);
    const email = config.get<string>('ADMIN_EMAIL')?.trim() ?? '';
    const password = config.get<string>('ADMIN_PASSWORD') ?? '';

    if (!email || !password) {
      throw new Error('Completá ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env.');
    }

    const resultado = await app.get(AdminService).crearAdmin({
      email,
      password,
      nombre: config.get<string>('ADMIN_NOMBRE'),
      apellido: config.get<string>('ADMIN_APELLIDO'),
    });

    console.log(
      resultado === 'creado'
        ? `Cuenta de administrador creada: ${email}`
        : `La cuenta de administrador ${email} ya existía: se actualizó su contraseña.`
    );
  } finally {
    await app.close();
  }
}

crearAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

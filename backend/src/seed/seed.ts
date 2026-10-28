import { ConflictException, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado';
import { PerfilPaseadorDto } from '../paseadores/dto/perfil-paseador.dto';
import { PaseadoresService } from '../paseadores/paseadores.service';
import { ResenasService } from '../resenas/resenas.service';
import { UsuariosService } from '../usuarios/usuarios.service';

// Script idempotente: crea cuentas y perfiles de demostración solo si no
// existen. No elimina ni sobrescribe datos de una base existente.
//
// Uso:
//   SEED_PASSWORD="una-clave-segura" npm run seed
//
// La contraseña se recibe por variable de entorno para no guardarla en Git.

type PerfilSeed = {
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  perfil: PerfilPaseadorDto;
  resenas: { mascota: string; texto: string; calificacion: number }[];
};

const PERFILES: PerfilSeed[] = [
  {
    email: 'paseador@walkpets.demo',
    nombre: 'Lucía',
    apellido: 'Fernández',
    telefono: '+5492994123456',
    perfil: {
      fotoUrl: 'https://randomuser.me/api/portraits/women/43.jpg',
      ciudad: 'Cipolletti',
      barrio: 'Cipolletti Centro',
      descripcion:
        'Amante de los animales con 4 años de experiencia. Salidas diarias, puntual y responsable. Mando fotos y videos durante cada paseo.',
      precioHora: 1800,
      razasAceptadas: ['Todas las razas'],
      disponible: true,
    },
    resenas: [
      {
        mascota: 'Rocky',
        texto:
          'Lucía es súper responsable. Rocky vuelve cansado y feliz después de cada paseo.',
        calificacion: 5,
      },
    ],
  },
  {
    email: 'mateo@walkpets.demo',
    nombre: 'Mateo',
    apellido: 'Torres',
    telefono: '+5492994123457',
    perfil: {
      fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      ciudad: 'Cipolletti',
      barrio: 'Villa Alberdi',
      descripcion:
        'Paseos personalizados y juegos al aire libre. Trabajo con razas pequeñas y medianas, siempre con paciencia y cariño.',
      precioHora: 1500,
      razasAceptadas: ['Razas pequeñas', 'Razas medianas'],
      disponible: true,
    },
    resenas: [],
  },
  {
    email: 'santiago@walkpets.demo',
    nombre: 'Santiago',
    apellido: 'Morales',
    telefono: '+5492994123458',
    perfil: {
      fotoUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
      ciudad: 'Neuquén',
      barrio: 'Neuquén Centro',
      descripcion:
        'Entrenador canino y paseador en Neuquén. Me enfoco en el bienestar y la socialización de cada mascota.',
      precioHora: 2000,
      razasAceptadas: ['Todas las razas'],
      disponible: false,
    },
    resenas: [],
  },
];

const CLIENTE = {
  email: 'cliente@walkpets.demo',
  nombre: 'Martina',
  apellido: 'Gómez',
  telefono: '+5492994000001',
};

async function main() {
  const password = process.env.SEED_PASSWORD;

  if (!password || password.length < 8) {
    throw new Error(
      'Definí SEED_PASSWORD (mínimo 8 caracteres) antes de ejecutar el seed.'
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const logger = new Logger('Seed');
  const usuarios = app.get(UsuariosService);
  const paseadores = app.get(PaseadoresService);
  const resenas = app.get(ResenasService);

  let cliente = await usuarios.buscarPorEmail(CLIENTE.email);
  if (!cliente) {
    try {
      cliente = await usuarios.crear({
        ...CLIENTE,
        password,
        rol: 'cliente',
      });
      logger.log(`Cliente creado: ${CLIENTE.email}`);
    } catch (error) {
      if (!(error instanceof ConflictException)) throw error;
      cliente = await usuarios.buscarPorEmail(CLIENTE.email);
    }
  }

  for (const datos of PERFILES) {
    let usuario = await usuarios.buscarPorEmail(datos.email);

    if (!usuario) {
      try {
        usuario = await usuarios.crear({
          nombre: datos.nombre,
          apellido: datos.apellido,
          email: datos.email,
          password,
          telefono: datos.telefono,
          rol: 'paseador',
        });
        logger.log(`Paseador creado: ${datos.email}`);
      } catch (error) {
        if (!(error instanceof ConflictException)) throw error;
        usuario = await usuarios.buscarPorEmail(datos.email);
      }
    }

    if (!usuario) continue;

    let perfil = await paseadores.buscarPorUsuario(usuario._id.toString());
    if (!perfil) {
      perfil = await paseadores.crearPerfil(usuario, datos.perfil, datos.telefono);
      logger.log(`Perfil creado para ${datos.email}`);
    }

    if (perfil.cantidadResenas === 0 && datos.resenas.length > 0 && cliente) {
      const autor: UsuarioAutenticado = {
        id: cliente._id.toString(),
        email: cliente.email,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        rol: cliente.rol,
      };

      for (const resena of datos.resenas) {
        await resenas.crear(perfil._id.toString(), autor, resena);
      }
      logger.log(`Reseñas de ejemplo creadas para ${datos.email}`);
    }
  }

  await app.close();
  logger.log('Seed finalizado.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

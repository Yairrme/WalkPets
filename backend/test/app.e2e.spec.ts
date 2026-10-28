import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

// Pruebas de integración de la API completa contra una base MongoDB efímera.
// No usan credenciales reales ni una base de producción.

let app: INestApplication;
let mongod: MongoMemoryServer;

let tokenCliente = '';
let tokenPaseador = '';
let paseadorId = '';

const CLIENTE = {
  nombre: 'Martina',
  apellido: 'Gómez',
  email: 'cliente@test.walkpets',
  password: 'secreto123',
  telefono: '+54 299 4000001',
  rol: 'cliente',
};

const PASEADOR = {
  nombre: 'Lucía',
  apellido: 'Fernández',
  email: 'paseador@test.walkpets',
  password: 'secreto123',
  telefono: '+54 299 4123456',
  rol: 'paseador',
  paseador: {
    ciudad: 'Cipolletti',
    barrio: 'Cipolletti Centro',
    descripcion: 'Paseos diarios con experiencia y mucho cariño.',
    precioHora: 1800,
    razasAceptadas: ['Todas las razas'],
  },
};

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('walkpets_test');
  process.env.JWT_SECRET = 'secreto-de-pruebas-con-mas-de-32-caracteres';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.PORT = '3100';

  const { AppModule } = await import('../src/app.module');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  await app.init();
});

afterAll(async () => {
  if (app) await app.close();
  if (mongod) await mongod.stop();
});

describe('GET /api/health', () => {
  it('informa el estado del servicio y de la base', async () => {
    const respuesta = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(respuesta.body.status).toBe('ok');
    expect(respuesta.body.baseDeDatos).toBe('conectado');
  });
});

describe('POST /api/auth/registro', () => {
  it('crea una cuenta de cliente y devuelve un token', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send(CLIENTE)
      .expect(201);

    expect(respuesta.body.accessToken).toBeTruthy();
    expect(respuesta.body.usuario.email).toBe(CLIENTE.email);
    expect(respuesta.body.usuario.rol).toBe('cliente');
    expect(respuesta.body.usuario.passwordHash).toBeUndefined();

    tokenCliente = respuesta.body.accessToken;
  });

  it('rechaza un correo duplicado', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send(CLIENTE)
      .expect(409);
  });

  it('rechaza un cliente sin contraseña válida', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({ ...CLIENTE, email: 'otro@test.walkpets', password: 'corta' })
      .expect(400);
  });

  it('exige teléfono a los paseadores', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({
        ...PASEADOR,
        email: 'sin-telefono@test.walkpets',
        telefono: undefined,
      })
      .expect(400);
  });

  it('exige el perfil a los paseadores', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({
        ...PASEADOR,
        email: 'sin-perfil@test.walkpets',
        paseador: undefined,
      })
      .expect(400);
  });

  it('rechaza una ciudad fuera de Cipolletti y Neuquén', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({
        ...PASEADOR,
        email: 'ciudad-invalida@test.walkpets',
        paseador: { ...PASEADOR.paseador, ciudad: 'Buenos Aires' },
      })
      .expect(400);
  });

  it('crea la cuenta y el perfil de un paseador con teléfono normalizado', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send(PASEADOR)
      .expect(201);

    expect(respuesta.body.accessToken).toBeTruthy();
    expect(respuesta.body.usuario.rol).toBe('paseador');
    expect(respuesta.body.paseador.ciudad).toBe('Cipolletti');
    expect(respuesta.body.paseador.telefono).toBe('+5492994123456');
    expect(respuesta.body.paseador.calificacionPromedio).toBe(0);
    expect(respuesta.body.paseador.cantidadResenas).toBe(0);

    tokenPaseador = respuesta.body.accessToken;
    paseadorId = respuesta.body.paseador.id;
  });
});

describe('POST /api/auth/login', () => {
  it('rechaza credenciales incorrectas', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: CLIENTE.email, password: 'incorrecta' })
      .expect(401);
  });

  it('rechaza un correo inexistente', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nadie@test.walkpets', password: 'secreto123' })
      .expect(401);
  });

  it('devuelve un token con credenciales válidas', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: CLIENTE.email, password: CLIENTE.password })
      .expect(200);

    expect(respuesta.body.accessToken).toBeTruthy();
    expect(respuesta.body.usuario.email).toBe(CLIENTE.email);
  });
});

describe('GET /api/paseadores', () => {
  it('lista los paseadores y permite filtrar por ciudad', async () => {
    const todos = await request(app.getHttpServer())
      .get('/api/paseadores')
      .expect(200);

    expect(todos.body).toHaveLength(1);
    expect(todos.body[0].nombre).toBe('Lucía');

    const cipolletti = await request(app.getHttpServer())
      .get('/api/paseadores?ciudad=Cipolletti')
      .expect(200);
    expect(cipolletti.body).toHaveLength(1);

    const neuquen = await request(app.getHttpServer())
      .get('/api/paseadores?ciudad=Neuqu%C3%A9n')
      .expect(200);
    expect(neuquen.body).toHaveLength(0);
  });

  it('rechaza una ciudad inválida en el filtro', async () => {
    await request(app.getHttpServer())
      .get('/api/paseadores?ciudad=Rosario')
      .expect(400);
  });

  it('rechaza un valor no booleano en el filtro de disponibilidad', async () => {
    await request(app.getHttpServer())
      .get('/api/paseadores?disponible=quizas')
      .expect(400);
  });
});

describe('GET /api/paseadores/:id', () => {
  it('devuelve el perfil público con reseñas vacías', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/api/paseadores/${paseadorId}`)
      .expect(200);

    expect(respuesta.body.id).toBe(paseadorId);
    expect(respuesta.body.resenas).toEqual([]);
    expect(respuesta.body.esPropietario).toBeUndefined();
  });

  it('devuelve 404 para un id inexistente', async () => {
    await request(app.getHttpServer())
      .get('/api/paseadores/64b000000000000000000000')
      .expect(404);
  });

  it('devuelve 404 para un id con formato inválido', async () => {
    await request(app.getHttpServer())
      .get('/api/paseadores/no-es-un-id')
      .expect(404);
  });
});

describe('POST /api/paseadores/:id/resenas', () => {
  it('rechaza publicar sin sesión', async () => {
    await request(app.getHttpServer())
      .post(`/api/paseadores/${paseadorId}/resenas`)
      .send({ mascota: 'Rocky', texto: 'Muy buen paseo.', calificacion: 5 })
      .expect(401);
  });

  it('rechaza publicar como paseador', async () => {
    await request(app.getHttpServer())
      .post(`/api/paseadores/${paseadorId}/resenas`)
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .send({ mascota: 'Rocky', texto: 'Muy buen paseo.', calificacion: 5 })
      .expect(403);
  });

  it('rechaza una calificación fuera de rango', async () => {
    await request(app.getHttpServer())
      .post(`/api/paseadores/${paseadorId}/resenas`)
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ mascota: 'Rocky', texto: 'Muy buen paseo.', calificacion: 9 })
      .expect(400);
  });

  it('rechaza un texto demasiado corto', async () => {
    await request(app.getHttpServer())
      .post(`/api/paseadores/${paseadorId}/resenas`)
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ mascota: 'Rocky', texto: 'bien', calificacion: 5 })
      .expect(400);
  });

  it('publica la reseña como cliente y actualiza el promedio', async () => {
    const respuesta = await request(app.getHttpServer())
      .post(`/api/paseadores/${paseadorId}/resenas`)
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({
        mascota: 'Rocky',
        texto: 'Paseo puntual, con fotos y mucha paciencia.',
        calificacion: 5,
      })
      .expect(201);

    expect(respuesta.body.autorNombre).toBe('Martina Gómez');
    expect(respuesta.body.calificacion).toBe(5);

    const perfil = await request(app.getHttpServer())
      .get(`/api/paseadores/${paseadorId}`)
      .expect(200);

    expect(perfil.body.cantidadResenas).toBe(1);
    expect(perfil.body.calificacionPromedio).toBe(5);
    expect(perfil.body.resenas).toHaveLength(1);
  });

  it('devuelve 404 al reseñar un paseador inexistente', async () => {
    await request(app.getHttpServer())
      .post('/api/paseadores/64b000000000000000000000/resenas')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ mascota: 'Rocky', texto: 'Muy buen paseo.', calificacion: 5 })
      .expect(404);
  });
});

describe('GET /api/resenas/mias', () => {
  it('rechaza consultar sin sesión', async () => {
    await request(app.getHttpServer()).get('/api/resenas/mias').expect(401);
  });

  it('rechaza consultar como cliente', async () => {
    await request(app.getHttpServer())
      .get('/api/resenas/mias')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .expect(403);
  });

  it('devuelve las reseñas del perfil del paseador autenticado', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/resenas/mias')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .expect(200);

    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].mascota).toBe('Rocky');
  });
});

describe('Filtros combinados de paseadores', () => {
  let idNeuquen = '';

  beforeAll(async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({
        ...PASEADOR,
        email: 'neuquen@test.walkpets',
        telefono: '+54 299 4123459',
        paseador: {
          ...PASEADOR.paseador,
          ciudad: 'Neuquén',
          barrio: 'Neuquén Centro',
          disponible: false,
        },
      })
      .expect(201);

    idNeuquen = respuesta.body.paseador.id;
  });

  it('filtra por ciudad y devuelve solo perfiles de esa ciudad', async () => {
    const neuquen = await request(app.getHttpServer())
      .get('/api/paseadores?ciudad=Neuqu%C3%A9n')
      .expect(200);

    expect(neuquen.body).toHaveLength(1);
    expect(neuquen.body[0].ciudad).toBe('Neuquén');
    expect(neuquen.body[0].id).toBe(idNeuquen);
  });

  it('interpreta disponible=false como booleano real', async () => {
    const noDisponibles = await request(app.getHttpServer())
      .get('/api/paseadores?disponible=false')
      .expect(200);

    expect(noDisponibles.body).toHaveLength(1);
    expect(noDisponibles.body[0].id).toBe(idNeuquen);
    expect(noDisponibles.body[0].disponible).toBe(false);
  });

  it('filtra por ciudad y barrio a la vez', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/paseadores?ciudad=Cipolletti&barrio=Cipolletti%20Centro')
      .expect(200);

    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].id).toBe(paseadorId);
  });

  it('devuelve una lista vacía cuando no hay coincidencias', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/paseadores?ciudad=Cipolletti&barrio=Neuqu%C3%A9n%20Centro')
      .expect(200);

    expect(respuesta.body).toEqual([]);
  });
});

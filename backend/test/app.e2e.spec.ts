import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

// Pruebas de integración de la API completa contra una base MongoDB efímera.
// No usan credenciales reales ni una base de producción.

let app: NestExpressApplication;
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

  app = moduleRef.createNestApplication<NestExpressApplication>();
  const { configurarApp } = await import('../src/config/configurar-app');
  configurarApp(app);
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

  it('rechaza un correo con formato inválido', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({ ...CLIENTE, email: 'no-es-un-correo' })
      .expect(400);
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

  it('rechaza una segunda reseña del mismo cliente al mismo paseador', async () => {
    await request(app.getHttpServer())
      .post(`/api/paseadores/${paseadorId}/resenas`)
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ mascota: 'Rocky', texto: 'Otra vez un paseo excelente.', calificacion: 1 })
      .expect(409);

    const perfil = await request(app.getHttpServer())
      .get(`/api/paseadores/${paseadorId}`)
      .expect(200);

    expect(perfil.body.cantidadResenas).toBe(1);
    expect(perfil.body.calificacionPromedio).toBe(5);
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

describe('Foto de perfil del paseador', () => {
  const registrar = (email: string, fotoUrl: string) =>
    request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({ ...PASEADOR, email, paseador: { ...PASEADOR.paseador, fotoUrl } });

  it('acepta un avatar genérico', async () => {
    const respuesta = await registrar('avatar@test.walkpets', 'avatar:hombre').expect(201);
    expect(respuesta.body.paseador.fotoUrl).toBe('avatar:hombre');
  });

  it('acepta una foto subida como data URI de más de 100 KB', async () => {
    // Supera el límite por defecto de Express (100 KB): valida el bodyParser de 1 MB.
    const foto = `data:image/jpeg;base64,${'A'.repeat(200_000)}`;
    const respuesta = await registrar('foto@test.walkpets', foto).expect(201);
    expect(respuesta.body.paseador.fotoUrl).toBe(foto);
  });

  it('rechaza una foto que no es imagen ni URL', async () => {
    await registrar('mala@test.walkpets', 'javascript:alert(1)').expect(400);
  });

  it('rechaza una foto subida demasiado pesada', async () => {
    const foto = `data:image/jpeg;base64,${'A'.repeat(500_000)}`;
    await registrar('pesada@test.walkpets', foto).expect(400);
  });
});

describe('Panel del paseador: /api/paseadores/mio', () => {
  it('devuelve el perfil propio', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/paseadores/mio')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .expect(200);

    expect(respuesta.body.id).toBe(paseadorId);
    expect(respuesta.body.redes).toEqual({ instagram: '', facebook: '', tiktok: '', web: '' });
    expect(respuesta.body.certificaciones).toEqual([]);
  });

  it('edita precio, disponibilidad, redes y certificaciones', async () => {
    const respuesta = await request(app.getHttpServer())
      .patch('/api/paseadores/mio')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .send({
        precioHora: 2500,
        disponible: false,
        redes: { instagram: '@lucia.paseos', web: 'https://lucia.com.ar' },
        certificaciones: ['Habilitación municipal', ' Habilitación municipal '],
      })
      .expect(200);

    expect(respuesta.body.precioHora).toBe(2500);
    expect(respuesta.body.disponible).toBe(false);
    expect(respuesta.body.redes.instagram).toBe('lucia.paseos');
    expect(respuesta.body.certificaciones).toEqual(['Habilitación municipal']);

    const publico = await request(app.getHttpServer())
      .get(`/api/paseadores/${paseadorId}`)
      .expect(200);
    expect(publico.body.redes.web).toBe('https://lucia.com.ar');
    expect(publico.body.descripcion).toBe(PASEADOR.paseador.descripcion);
  });

  it('cambia el teléfono en el perfil y en la cuenta', async () => {
    await request(app.getHttpServer())
      .patch('/api/paseadores/mio')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .send({ telefono: '299 4999888' })
      .expect(200);

    const cuenta = await request(app.getHttpServer())
      .get('/api/cuenta')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .expect(200);
    expect(cuenta.body.telefono).toBe('+5492994999888');
  });

  it('rechaza redes mal escritas', async () => {
    await request(app.getHttpServer())
      .patch('/api/paseadores/mio')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .send({ redes: { instagram: 'con espacios' } })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/api/paseadores/mio')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .send({ redes: { web: 'sin-protocolo.com' } })
      .expect(400);
  });

  it('rechaza más de 8 certificaciones', async () => {
    await request(app.getHttpServer())
      .patch('/api/paseadores/mio')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .send({ certificaciones: Array.from({ length: 9 }, (_, i) => `Curso número ${i}`) })
      .expect(400);
  });

  it('no deja editar a un cliente ni sin sesión', async () => {
    await request(app.getHttpServer()).patch('/api/paseadores/mio').send({}).expect(401);
    await request(app.getHttpServer())
      .patch('/api/paseadores/mio')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ precioHora: 1 })
      .expect(403);
  });
});

describe('Mi perfil: /api/cuenta', () => {
  it('devuelve la cuenta propia sin datos sensibles', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/cuenta')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .expect(200);

    expect(respuesta.body.email).toBe(CLIENTE.email);
    expect(respuesta.body).not.toHaveProperty('passwordHash');
    expect(respuesta.body.mascotas).toBe('');
  });

  it('el cliente guarda ciudad, barrio y mascotas', async () => {
    const respuesta = await request(app.getHttpServer())
      .patch('/api/cuenta')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ ciudad: 'Neuquén', barrio: 'Alta Barda', mascotas: 'Rocky, labrador' })
      .expect(200);

    expect(respuesta.body).toMatchObject({
      ciudad: 'Neuquén',
      barrio: 'Alta Barda',
      mascotas: 'Rocky, labrador',
    });
  });

  it('el cliente puede quitar su teléfono; el paseador no', async () => {
    const cliente = await request(app.getHttpServer())
      .patch('/api/cuenta')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ telefono: '' })
      .expect(200);
    expect(cliente.body.telefono).toBeNull();

    await request(app.getHttpServer())
      .patch('/api/cuenta')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .send({ telefono: '' })
      .expect(400);
  });

  it('cambiar el nombre del paseador actualiza su perfil público', async () => {
    await request(app.getHttpServer())
      .patch('/api/cuenta')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .send({ nombre: 'Lucía Belén' })
      .expect(200);

    const publico = await request(app.getHttpServer())
      .get(`/api/paseadores/${paseadorId}`)
      .expect(200);
    expect(publico.body.nombre).toBe('Lucía Belén');
  });

  it('no permite cambiar el correo ni el rol', async () => {
    await request(app.getHttpServer())
      .patch('/api/cuenta')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ rol: 'paseador' })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/api/cuenta')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ email: 'otro@test.walkpets' })
      .expect(400);
  });

  it('rechaza una ciudad fuera de la zona', async () => {
    await request(app.getHttpServer())
      .patch('/api/cuenta')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ ciudad: 'Córdoba' })
      .expect(400);
  });
});

describe('Registro con redes y certificaciones', () => {
  it('guarda redes y certificaciones al crear el perfil', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({
        ...PASEADOR,
        email: 'redes@test.walkpets',
        paseador: {
          ...PASEADOR.paseador,
          redes: { tiktok: '@paseos.cipo' },
          certificaciones: ['Primeros auxilios caninos'],
        },
      })
      .expect(201);

    expect(respuesta.body.paseador.redes.tiktok).toBe('paseos.cipo');
    expect(respuesta.body.paseador.certificaciones).toEqual(['Primeros auxilios caninos']);
  });
});

import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import type { AdminService } from '../src/admin/admin.service';

// Gestión de usuarios y moderación de reseñas por el administrador, contra una
// base MongoDB efímera. No usa credenciales reales.

let app: NestExpressApplication;
let mongod: MongoMemoryServer;
let admin: AdminService;

const ADMIN = { email: 'admin@test.walkpets', password: 'clave-admin-123' };

const CLIENTE = {
  nombre: 'Martina',
  apellido: 'Gómez',
  email: 'cliente@test.walkpets',
  password: 'secreto123',
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
    ciudad: 'Neuquén',
    barrio: 'Santa Genoveva',
    descripcion: 'Paseos diarios con experiencia y mucho cariño.',
    precioHora: 2000,
  },
};

let tokenAdmin = '';
let tokenCliente = '';
let tokenPaseador = '';
let clienteId = '';
let paseadorUsuarioId = '';
let paseadorId = '';
let adminId = '';

const http = () => request(app.getHttpServer());

async function registrar(datos: object) {
  return (await http().post('/api/auth/registro').send(datos).expect(201)).body;
}

function login(email: string, password: string) {
  return http().post('/api/auth/login').send({ email, password });
}

function publicarResena(token: string, paseador: string, calificacion: number) {
  return http()
    .post(`/api/paseadores/${paseador}/resenas`)
    .set('Authorization', `Bearer ${token}`)
    .send({ mascota: 'Rocky', texto: 'Paseo puntual, con fotos y mucha paciencia.', calificacion });
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('walkpets_admin_test');
  process.env.JWT_SECRET = 'secreto-de-pruebas-con-mas-de-32-caracteres';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.PORT = '3101';

  const { AppModule } = await import('../src/app.module');
  const { AdminService: Servicio } = await import('../src/admin/admin.service');
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

  app = moduleRef.createNestApplication<NestExpressApplication>();
  const { configurarApp } = await import('../src/config/configurar-app');
  configurarApp(app);
  await app.init();
  admin = app.get(Servicio);

  const cliente = await registrar(CLIENTE);
  tokenCliente = cliente.accessToken;
  clienteId = cliente.usuario.id;

  const paseador = await registrar(PASEADOR);
  tokenPaseador = paseador.accessToken;
  paseadorUsuarioId = paseador.usuario.id;
  paseadorId = paseador.paseador.id;
});

afterAll(async () => {
  if (app) await app.close();
  if (mongod) await mongod.stop();
});

describe('Alta del administrador (npm run crear-admin)', () => {
  it('crea la cuenta y permite iniciar sesión con rol admin', async () => {
    await expect(admin.crearAdmin(ADMIN)).resolves.toBe('creado');

    const respuesta = await login(ADMIN.email, ADMIN.password).then((r) => r.body);
    expect(respuesta.usuario.rol).toBe('admin');
    tokenAdmin = respuesta.accessToken;
    adminId = respuesta.usuario.id;
  });

  it('si ya existe como admin, actualiza la contraseña', async () => {
    await expect(admin.crearAdmin({ ...ADMIN, password: 'otra-clave-456' })).resolves.toBe(
      'actualizado'
    );
    await login(ADMIN.email, 'otra-clave-456').then((r) => expect(r.status).toBe(200));
    await login(ADMIN.email, ADMIN.password).then((r) => expect(r.status).toBe(401));

    await admin.crearAdmin(ADMIN);
  });

  it('no convierte en admin una cuenta de cliente o paseador', async () => {
    await expect(admin.crearAdmin({ ...ADMIN, email: CLIENTE.email })).rejects.toThrow(
      'Ya existe una cuenta de cliente'
    );
  });

  it('rechaza correo o contraseña inválidos', async () => {
    await expect(admin.crearAdmin({ email: 'no-es-correo', password: 'clave-larga' })).rejects.toThrow(
      'ADMIN_EMAIL'
    );
    await expect(admin.crearAdmin({ email: 'otro@test.walkpets', password: 'corta' })).rejects.toThrow(
      'ADMIN_PASSWORD'
    );
  });

  it('nadie puede registrarse como admin desde la API', async () => {
    await http()
      .post('/api/auth/registro')
      .send({ ...CLIENTE, email: 'intruso@test.walkpets', rol: 'admin' })
      .expect(400);
  });
});

describe('GET /api/admin/usuarios', () => {
  it('exige sesión y rol admin', async () => {
    await http().get('/api/admin/usuarios').expect(401);
    await http()
      .get('/api/admin/usuarios')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .expect(403);
    await http()
      .get('/api/admin/usuarios')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .expect(403);
  });

  it('lista las cuentas con correo, rol y estado, sin passwordHash', async () => {
    const { body } = await http()
      .get('/api/admin/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);

    expect(body.total).toBe(3);
    expect(body.pagina).toBe(1);
    expect(body.porPagina).toBe(20);
    const paseador = body.items.find((u: { id: string }) => u.id === paseadorUsuarioId);
    expect(paseador).toMatchObject({
      email: PASEADOR.email,
      rol: 'paseador',
      activo: true,
      paseadorId,
    });
    expect(paseador.creadoEn).toBeTruthy();
    expect(JSON.stringify(body)).not.toContain('passwordHash');
  });

  it('filtra por rol y busca por nombre o correo', async () => {
    const porRol = await http()
      .get('/api/admin/usuarios?rol=cliente')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(porRol.body.items.map((u: { id: string }) => u.id)).toEqual([clienteId]);

    const porTexto = await http()
      .get(`/api/admin/usuarios?q=${encodeURIComponent('FERNÁN')}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(porTexto.body.items.map((u: { id: string }) => u.id)).toEqual([paseadorUsuarioId]);

    // Los caracteres especiales se buscan como texto, no como expresión regular.
    const especial = await http()
      .get(`/api/admin/usuarios?q=${encodeURIComponent('.*')}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(especial.body.total).toBe(0);
  });

  it('rechaza filtros inválidos', async () => {
    await http()
      .get('/api/admin/usuarios?rol=superusuario')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(400);
  });
});

describe('PATCH /api/admin/usuarios/:id/estado', () => {
  it('suspende al paseador: no se lista, no se abre, no inicia sesión y su token deja de servir', async () => {
    const { body } = await http()
      .patch(`/api/admin/usuarios/${paseadorUsuarioId}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ activo: false })
      .expect(200);
    expect(body.activo).toBe(false);

    const listado = await http().get('/api/paseadores').expect(200);
    expect(listado.body.map((p: { id: string }) => p.id)).not.toContain(paseadorId);
    await http().get(`/api/paseadores/${paseadorId}`).expect(404);
    expect((await publicarResena(tokenCliente, paseadorId, 5)).status).toBe(404);

    const intento = await login(PASEADOR.email, PASEADOR.password);
    expect(intento.status).toBe(403);
    expect(intento.body.message).toContain('suspendida');

    await http()
      .get('/api/paseadores/mio')
      .set('Authorization', `Bearer ${tokenPaseador}`)
      .expect(401);
  });

  it('la contraseña incorrecta de una cuenta suspendida sigue dando 401', async () => {
    await login(PASEADOR.email, 'otra-clave').then((r) => expect(r.status).toBe(401));
  });

  it('filtra por estado', async () => {
    const { body } = await http()
      .get('/api/admin/usuarios?activo=false')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(body.items.map((u: { id: string }) => u.id)).toEqual([paseadorUsuarioId]);
  });

  it('reactiva la cuenta y el perfil vuelve al listado', async () => {
    await http()
      .patch(`/api/admin/usuarios/${paseadorUsuarioId}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ activo: true })
      .expect(200);

    const listado = await http().get('/api/paseadores').expect(200);
    expect(listado.body.map((p: { id: string }) => p.id)).toContain(paseadorId);
    const reingreso = await login(PASEADOR.email, PASEADOR.password).expect(200);
    tokenPaseador = reingreso.body.accessToken;
  });

  it('no permite suspender la propia cuenta ni otra de admin', async () => {
    await http()
      .patch(`/api/admin/usuarios/${adminId}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ activo: false })
      .expect(400);

    await admin.crearAdmin({ email: 'admin2@test.walkpets', password: 'clave-admin-789' });
    const otro = await login('admin2@test.walkpets', 'clave-admin-789').expect(200);
    await http()
      .patch(`/api/admin/usuarios/${otro.body.usuario.id}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ activo: false })
      .expect(403);
  });

  it('valida el cuerpo y el id', async () => {
    await http()
      .patch(`/api/admin/usuarios/${clienteId}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ activo: 'no' })
      .expect(400);
    await http()
      .patch('/api/admin/usuarios/665f1b2c3d4e5f60718293ff/estado')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ activo: false })
      .expect(404);
  });
});

describe('Moderación de reseñas', () => {
  let resenaId = '';

  it('lista las reseñas con el nombre del paseador', async () => {
    await publicarResena(tokenCliente, paseadorId, 2).then((r) => expect(r.status).toBe(201));

    const { body } = await http()
      .get('/api/admin/resenas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(body.total).toBe(1);
    expect(body.items[0]).toMatchObject({
      paseadorId,
      paseadorNombre: 'Lucía Fernández',
      autorId: clienteId,
      autorNombre: 'Martina Gómez',
      calificacion: 2,
    });
    resenaId = body.items[0].id;
  });

  it('exige rol admin', async () => {
    await http()
      .delete(`/api/admin/resenas/${resenaId}`)
      .set('Authorization', `Bearer ${tokenCliente}`)
      .expect(403);
  });

  it('elimina la reseña y recalcula el promedio', async () => {
    await http()
      .delete(`/api/admin/resenas/${resenaId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(204);

    const perfil = await http().get(`/api/paseadores/${paseadorId}`).expect(200);
    expect(perfil.body.cantidadResenas).toBe(0);
    expect(perfil.body.calificacionPromedio).toBe(0);

    await http()
      .delete(`/api/admin/resenas/${resenaId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(404);
  });
});

describe('DELETE /api/admin/usuarios/:id', () => {
  it('al borrar un cliente se borran sus reseñas y se recalcula el promedio', async () => {
    await publicarResena(tokenCliente, paseadorId, 4).then((r) => expect(r.status).toBe(201));

    await http()
      .delete(`/api/admin/usuarios/${clienteId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(204);

    const perfil = await http().get(`/api/paseadores/${paseadorId}`).expect(200);
    expect(perfil.body.cantidadResenas).toBe(0);
    await login(CLIENTE.email, CLIENTE.password).then((r) => expect(r.status).toBe(401));
    await http().get('/api/cuenta').set('Authorization', `Bearer ${tokenCliente}`).expect(401);
  });

  it('al borrar un paseador desaparece su perfil público', async () => {
    await http()
      .delete(`/api/admin/usuarios/${paseadorUsuarioId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(204);

    await http().get(`/api/paseadores/${paseadorId}`).expect(404);
    const { body } = await http()
      .get('/api/admin/usuarios?rol=paseador')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);
    expect(body.total).toBe(0);
  });

  it('no permite borrar la propia cuenta', async () => {
    await http()
      .delete(`/api/admin/usuarios/${adminId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(400);
  });
});

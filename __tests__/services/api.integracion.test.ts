import {
  apiFetch,
  ApiError,
  MENSAJE_SESION_VENCIDA,
  registrarSesionRechazada,
} from '../../src/services/api/client';
import {
  cambiarEstadoUsuario,
  eliminarUsuarioAdmin,
  listarUsuariosAdmin,
} from '../../src/services/admin.service';
import { getPaseadorById, getPaseadores } from '../../src/services/paseadores.service';
import { crearResena } from '../../src/services/resenas.service';
import { guardarSesion } from '../../src/services/sesion.service';

// Forzamos el modo API y simulamos las respuestas del backend NestJS con la
// misma forma que devuelve el contrato documentado en docs/.
jest.mock('../../src/config/api', () => ({
  API_URL: 'http://api.walkpets.test/api',
  API_TIMEOUT_MS: 5000,
}));

const PASEADOR_API = {
  id: '665f1b2c3d4e5f60718293a4',
  usuarioId: '665f1b2c3d4e5f6071829300',
  nombre: 'Lucía',
  apellido: 'Fernández',
  fotoUrl: 'https://ejemplo.com/lucia.jpg',
  ciudad: 'Cipolletti',
  barrio: 'Cipolletti Centro',
  descripcion: 'Paseos diarios con experiencia y mucho cariño.',
  precioHora: 1800,
  telefono: '+5492994123456',
  disponible: true,
  razasAceptadas: ['Todas las razas'],
  calificacionPromedio: 4.5,
  cantidadResenas: 2,
};

const RESENA_API = {
  id: '665f1b2c3d4e5f60718293b0',
  autorNombre: 'Martina Gómez',
  mascota: 'Rocky',
  texto: 'Paseo puntual, con fotos y mucha paciencia.',
  calificacion: 5,
  fecha: '2026-10-20T12:00:00.000Z',
};

const sesionCliente = {
  token: 'token-cliente',
  usuario: {
    id: '665f1b2c3d4e5f6071829301',
    nombre: 'Martina',
    apellido: 'Gómez',
    email: 'cliente@walkpets.demo',
    rol: 'cliente' as const,
  },
};

function respuestaJson(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  } as unknown as Response;
}

describe('Integración del frontend con la API (fetch simulado)', () => {
  const fetchMock = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
    await guardarSesion(sesionCliente);
  });

  it('mapea el listado del backend al modelo del frontend', async () => {
    fetchMock.mockResolvedValue(respuestaJson([PASEADOR_API]));

    const paseadores = await getPaseadores();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.walkpets.test/api/paseadores',
      expect.objectContaining({ method: 'GET' })
    );
    expect(paseadores).toHaveLength(1);
    expect(paseadores[0]).toMatchObject({
      id: PASEADOR_API.id,
      foto: PASEADOR_API.fotoUrl,
      calificacion: 4.5,
      telefono: '+5492994123456',
      ciudad: 'Cipolletti',
      resenas: [],
    });
  });

  it('envía el token al pedir el perfil y mapea las reseñas', async () => {
    fetchMock.mockResolvedValue(
      respuestaJson({
        ...PASEADOR_API,
        resenas: [RESENA_API],
        esPropietario: false,
      })
    );

    const paseador = await getPaseadorById(PASEADOR_API.id);

    expect(fetchMock).toHaveBeenCalledWith(
      `http://api.walkpets.test/api/paseadores/${PASEADOR_API.id}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-cliente',
        }),
      })
    );
    expect(paseador?.resenas[0]).toMatchObject({
      autor: 'Martina Gómez',
      fecha: '2026-10-20',
      calificacion: 5,
    });
  });

  it('devuelve null cuando el perfil no existe (404)', async () => {
    fetchMock.mockResolvedValue(
      respuestaJson({ statusCode: 404, message: 'No encontramos ese paseador.' }, 404)
    );

    await expect(getPaseadorById('inexistente')).resolves.toBeNull();
  });

  it('publica una reseña con el token del cliente y mapea la respuesta', async () => {
    fetchMock.mockResolvedValue(respuestaJson(RESENA_API, 201));

    const resena = await crearResena(PASEADOR_API.id, {
      mascota: 'Rocky',
      texto: 'Paseo puntual, con fotos y mucha paciencia.',
      calificacion: 5,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `http://api.walkpets.test/api/paseadores/${PASEADOR_API.id}/resenas`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-cliente',
        }),
      })
    );
    expect(resena.autor).toBe('Martina Gómez');
  });

  it('propaga los errores de validación del backend con sus detalles', async () => {
    fetchMock.mockResolvedValue(
      respuestaJson(
        {
          statusCode: 400,
          message: ['texto debe tener al menos 10 caracteres'],
          error: 'Bad Request',
        },
        400
      )
    );

    await expect(
      crearResena(PASEADOR_API.id, {
        mascota: 'Rocky',
        texto: 'corto',
        calificacion: 5,
      })
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      detalles: ['texto debe tener al menos 10 caracteres'],
    } satisfies Partial<ApiError>);
  });

  it('avisa y pide reingresar cuando el servidor rechaza el token (401)', async () => {
    const alRechazar = jest.fn();
    const darDeBaja = registrarSesionRechazada(alRechazar);
    fetchMock.mockResolvedValue(
      respuestaJson({ statusCode: 401, message: 'Unauthorized' }, 401)
    );

    await expect(
      crearResena(PASEADOR_API.id, {
        mascota: 'Rocky',
        texto: 'Paseo puntual, con fotos y mucha paciencia.',
        calificacion: 5,
      })
    ).rejects.toMatchObject({ status: 401, message: MENSAJE_SESION_VENCIDA });
    expect(alRechazar).toHaveBeenCalledTimes(1);
    expect(alRechazar).toHaveBeenCalledWith('token-cliente');

    darDeBaja();
  });

  it('un 401 sin token (login fallido) no se trata como sesión vencida', async () => {
    const alRechazar = jest.fn();
    const darDeBaja = registrarSesionRechazada(alRechazar);
    fetchMock.mockResolvedValue(
      respuestaJson({ statusCode: 401, message: 'Correo o contraseña incorrectos.' }, 401)
    );

    await expect(
      apiFetch('/auth/login', { method: 'POST', body: { email: 'a@b.com', password: 'x' } })
    ).rejects.toMatchObject({ status: 401, message: 'Correo o contraseña incorrectos.' });
    expect(alRechazar).not.toHaveBeenCalled();

    darDeBaja();
  });

  describe('administración', () => {
    const USUARIO_ADMIN_API = {
      id: '665f1b2c3d4e5f6071829300',
      nombre: 'Lucía',
      apellido: 'Fernández',
      email: 'paseador@walkpets.test',
      telefono: null,
      rol: 'paseador',
      activo: true,
      creadoEn: '2026-11-01T15:30:00.000Z',
      paseadorId: PASEADOR_API.id,
    };

    beforeEach(async () => {
      await guardarSesion({
        token: 'token-admin',
        usuario: { ...sesionCliente.usuario, id: 'admin-1', rol: 'admin' },
      });
    });

    it('lista cuentas con filtros en la query y mapea la respuesta', async () => {
      fetchMock.mockResolvedValue(
        respuestaJson({ items: [USUARIO_ADMIN_API], total: 1, pagina: 2, porPagina: 20 })
      );

      const pagina = await listarUsuariosAdmin({ rol: 'paseador', q: ' lucía ', pagina: 2 });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://api.walkpets.test/api/admin/usuarios?pagina=2&rol=paseador&q=luc%C3%ADa',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token-admin' }),
        })
      );
      expect(pagina.items[0]).toMatchObject({ telefono: undefined, creadoEn: '2026-11-01' });
      expect(pagina.pagina).toBe(2);
    });

    it('suspende con PATCH y elimina con DELETE (204)', async () => {
      fetchMock.mockResolvedValueOnce(respuestaJson({ ...USUARIO_ADMIN_API, activo: false }));
      const suspendido = await cambiarEstadoUsuario(USUARIO_ADMIN_API.id, false);
      expect(suspendido.activo).toBe(false);
      expect(fetchMock).toHaveBeenLastCalledWith(
        `http://api.walkpets.test/api/admin/usuarios/${USUARIO_ADMIN_API.id}/estado`,
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ activo: false }) })
      );

      fetchMock.mockResolvedValueOnce({ ok: true, status: 204, text: async () => '' });
      await expect(eliminarUsuarioAdmin(USUARIO_ADMIN_API.id)).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenLastCalledWith(
        `http://api.walkpets.test/api/admin/usuarios/${USUARIO_ADMIN_API.id}`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('informa un error de conexión cuando fetch falla', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(getPaseadores()).rejects.toThrow(
      'No se pudo conectar con el servidor.'
    );
  });
});

import { ApiError } from '../../src/services/api/client';
import { getPaseadorById, getPaseadores } from '../../src/services/paseadores.service';
import { crearResena } from '../../src/services/resenas.service';
import { guardarSesion } from '../../src/services/sesion.service';

// Forzamos el modo API y simulamos las respuestas del backend NestJS con la
// misma forma que devuelve el contrato documentado en docs/.
jest.mock('../../src/config/api', () => ({
  API_URL: 'http://api.walkpets.test/api',
  API_TIMEOUT_MS: 5000,
  FUENTE_DATOS: 'api',
  usarApi: () => true,
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

  it('informa un error de conexión cuando fetch falla', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    await expect(getPaseadores()).rejects.toThrow(
      'No se pudo conectar con el servidor.'
    );
  });
});

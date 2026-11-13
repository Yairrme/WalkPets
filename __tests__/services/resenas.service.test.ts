import { crearResena, getMisResenas } from '../../src/services/resenas.service';
import { borrarSesionGuardada, guardarSesion } from '../../src/services/sesion.service';
import { API_URL_PRUEBA, respuestaJson, sesionDe, simularFetch } from '../fixtures/api';

// El servicio de reseñas controla sesión y rol antes de llamar al backend.
// Las reglas del servidor (una reseña por cliente, sin auto-reseña, promedio)
// se prueban en backend/test.
jest.mock('../../src/config/api', () => ({
  API_URL: 'http://api.walkpets.test/api',
  API_TIMEOUT_MS: 5000,
}));

const RESENA = { mascota: 'Rocky', texto: 'Muy buen paseo.', calificacion: 5 };

describe('resenas.service', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = simularFetch();
  });

  afterEach(async () => {
    await borrarSesionGuardada();
  });

  it('rechaza publicar sin sesión o con sesión de paseador', async () => {
    await expect(crearResena('1', RESENA)).rejects.toThrow('Iniciá sesión para publicar una reseña.');

    await guardarSesion(sesionDe('paseador'));
    await expect(crearResena('2', RESENA)).rejects.toThrow('Solo los clientes pueden publicar reseñas.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del servidor si el cliente ya dejó una reseña', async () => {
    await guardarSesion(sesionDe('cliente'));
    fetchMock.mockResolvedValue(
      respuestaJson({ message: 'Ya dejaste una reseña para este paseador.' }, 409)
    );

    await expect(crearResena('2', RESENA)).rejects.toThrow('Ya dejaste una reseña para este paseador.');
  });

  it('devuelve las reseñas del paseador autenticado', async () => {
    await guardarSesion(sesionDe('paseador'));
    fetchMock.mockResolvedValue(
      respuestaJson([
        { id: 'r1', autorNombre: 'Martina G.', mascota: 'Toby', texto: 'Genial', calificacion: 5, fecha: '2026-10-20T12:00:00.000Z' },
      ])
    );

    const resenas = await getMisResenas();

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL_PRUEBA}/resenas/mias`);
    expect(resenas[0]).toMatchObject({ autor: 'Martina G.', fecha: '2026-10-20' });
  });

  it('rechaza consultar reseñas propias sin sesión o como cliente', async () => {
    await expect(getMisResenas()).rejects.toThrow('Iniciá sesión para consultar tus reseñas.');

    await guardarSesion(sesionDe('cliente'));
    await expect(getMisResenas()).rejects.toThrow('Solo los paseadores pueden consultar sus reseñas.');
  });
});

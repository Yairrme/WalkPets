import AsyncStorage from '@react-native-async-storage/async-storage';
import { PASEADORES_MOCK } from '../../src/data/paseadores.mock';
import { getPaseadorById } from '../../src/services/paseadores.service';
import { crearResena, getMisResenas } from '../../src/services/resenas.service';
import { guardarSesion } from '../../src/services/sesion.service';
import { paseadores } from '../fixtures/paseadores';

const sesionCliente = {
  token: 'token-cliente',
  usuario: {
    id: 'cliente-1',
    nombre: 'Martina',
    apellido: 'Gómez',
    email: 'cliente@walkpets.demo',
    rol: 'cliente' as const,
  },
};

const sesionPaseador = {
  token: 'token-paseador',
  usuario: {
    id: 'paseador-1',
    nombre: 'Lucía',
    apellido: 'Fernández',
    email: 'paseador@walkpets.demo',
    rol: 'paseador' as const,
  },
};

describe('resenas.service (modo mock)', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    await AsyncStorage.clear();
    // El mock empieza vacío: cargamos los perfiles de ejemplo de las pruebas.
    // Lucía (id 1) pertenece a la sesión de paseador.
    PASEADORES_MOCK.splice(
      0,
      PASEADORES_MOCK.length,
      ...paseadores.map((p) => ({
        ...structuredClone(p),
        usuarioId: p.id === '1' ? 'paseador-1' : `otro-${p.id}`,
      }))
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('rechaza publicar sin sesión', async () => {
    await expect(
      crearResena('1', { mascota: 'Rocky', texto: 'Muy buen paseo.', calificacion: 5 })
    ).rejects.toThrow('Iniciá sesión para publicar una reseña.');
  });

  it('rechaza publicar cuando la sesión es de paseador', async () => {
    await guardarSesion(sesionPaseador);

    await expect(
      crearResena('2', { mascota: 'Rocky', texto: 'Muy buen paseo.', calificacion: 5 })
    ).rejects.toThrow('Solo los clientes pueden publicar reseñas.');
  });

  it('publica una reseña como cliente y actualiza el promedio', async () => {
    await guardarSesion(sesionCliente);

    const resena = await crearResena('1', {
      mascota: 'Toby',
      texto: 'Paseo puntual y con fotos.',
      calificacion: 5,
    });

    expect(resena.autor).toBe('Martina Gómez');
    expect(resena.mascota).toBe('Toby');

    const promesa = getPaseadorById('1');
    await jest.advanceTimersByTimeAsync(500);
    const paseador = await promesa;

    expect(paseador?.resenas[0].texto).toBe('Paseo puntual y con fotos.');
    expect(paseador?.cantidadResenas).toBe(paseador?.resenas.length);
    expect(paseador?.calificacion).toBeGreaterThan(0);
  });

  it('rechaza una segunda reseña del mismo cliente al mismo paseador', async () => {
    await guardarSesion(sesionCliente);
    const datos = { mascota: 'Toby', texto: 'Paseo puntual y con fotos.', calificacion: 5 };

    await crearResena('2', datos);

    await expect(crearResena('2', { ...datos, calificacion: 1 })).rejects.toThrow(
      'Ya dejaste una reseña para este paseador.'
    );
  });

  it('devuelve las reseñas del paseador autenticado', async () => {
    await guardarSesion(sesionPaseador);

    const resenas = await getMisResenas();

    expect(resenas.length).toBeGreaterThan(0);
    expect(resenas[0]).toHaveProperty('autor');
  });

  it('rechaza consultar reseñas propias cuando la sesión es de cliente', async () => {
    await guardarSesion(sesionCliente);

    await expect(getMisResenas()).rejects.toThrow(
      'Solo los paseadores pueden consultar sus reseñas.'
    );
  });

  it('rechaza consultar reseñas propias sin sesión', async () => {
    await expect(getMisResenas()).rejects.toThrow(
      'Iniciá sesión para consultar tus reseñas.'
    );
  });
});

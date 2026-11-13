import { actualizarMiCuenta } from '../../src/services/cuenta.service';
import {
  actualizarMiPerfilPaseador,
  getMiPerfilPaseador,
  registrarPaseador,
} from '../../src/services/paseadores.service';
import { borrarSesionGuardada, guardarSesion, obtenerSesionGuardada } from '../../src/services/sesion.service';
import type { NuevoPaseadorInput } from '../../src/types/paseador';
import {
  API_URL_PRUEBA,
  cuerpoEnviado,
  PASEADOR_API,
  respuestaJson,
  sesionDe,
  simularFetch,
} from '../fixtures/api';

// Reglas de negocio de los servicios de paseadores y cuenta. El backend se
// simula con un fetch falso: interesa qué se valida antes de llamar y qué se envía.
jest.mock('../../src/config/api', () => ({
  API_URL: 'http://api.walkpets.test/api',
  API_TIMEOUT_MS: 5000,
}));

const DATOS: NuevoPaseadorInput = {
  nombre: 'Nuevo',
  apellido: 'Paseador',
  foto: 'avatar:hombre',
  barrio: 'Neuquén Centro',
  ciudad: 'Neuquén',
  descripcion: 'Paseos diarios con experiencia.',
  precioHora: 2000,
  telefono: '299 4000000',
  disponible: true,
  razasAceptadas: ['Todas las razas'],
  redes: { instagram: '@nuevo.paseos', facebook: '', tiktok: '', web: '' },
  certificaciones: ['Habilitación municipal', ' Habilitación municipal '],
  email: 'nuevo@walkpets.test',
  password: 'secreto123',
};

describe('paseadores.service', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = simularFetch();
  });

  afterEach(async () => {
    await borrarSesionGuardada();
  });

  it('registra un paseador enviando teléfono, redes y certificaciones normalizados', async () => {
    fetchMock.mockResolvedValue(
      respuestaJson(
        { accessToken: 'jwt-nuevo', usuario: sesionDe('paseador').usuario, paseador: PASEADOR_API },
        201
      )
    );

    const nuevo = await registrarPaseador(DATOS);

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL_PRUEBA}/auth/registro`);
    const cuerpo = cuerpoEnviado(fetchMock);
    expect(cuerpo).toMatchObject({ rol: 'paseador', telefono: '+5492994000000' });
    expect(cuerpo.paseador).toMatchObject({
      fotoUrl: 'avatar:hombre',
      redes: { instagram: 'nuevo.paseos' },
      certificaciones: ['Habilitación municipal'],
    });
    expect(nuevo.nombre).toBe('Nuevo');
    // Queda la sesión iniciada con el token que devolvió el servidor.
    await expect(obtenerSesionGuardada()).resolves.toMatchObject({ token: 'jwt-nuevo' });
  });

  it('rechaza un teléfono inválido, otra ciudad o una red mal escrita sin llamar al servidor', async () => {
    await expect(registrarPaseador({ ...DATOS, telefono: '123' })).rejects.toThrow(
      'El teléfono no es válido'
    );
    await expect(registrarPaseador({ ...DATOS, ciudad: 'Buenos Aires' as never })).rejects.toThrow(
      'La ciudad debe ser Cipolletti o Neuquén'
    );
    await expect(
      registrarPaseador({ ...DATOS, redes: { ...DATOS.redes, web: 'mi-sitio.com' } })
    ).rejects.toThrow('La web debe empezar con http:// o https://.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del servidor si el correo ya existe', async () => {
    fetchMock.mockResolvedValue(respuestaJson({ message: 'Ya existe una cuenta con ese correo.' }, 409));

    await expect(registrarPaseador(DATOS)).rejects.toThrow('Ya existe una cuenta con ese correo.');
  });

  it('el panel exige una sesión de paseador', async () => {
    await expect(getMiPerfilPaseador()).rejects.toThrow('Iniciá sesión para editar tu perfil.');

    await guardarSesion(sesionDe('cliente'));
    await expect(getMiPerfilPaseador()).rejects.toThrow('Solo los paseadores');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('el paseador edita su perfil con PATCH /paseadores/mio', async () => {
    await guardarSesion(sesionDe('paseador'));
    fetchMock.mockResolvedValue(respuestaJson({ ...PASEADOR_API, precioHora: 2600 }));

    const editado = await actualizarMiPerfilPaseador({
      precioHora: 2600,
      foto: 'avatar:mujer',
      redes: { ...DATOS.redes, tiktok: '@paseos.nqn' },
    });

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL_PRUEBA}/paseadores/mio`);
    expect(fetchMock.mock.calls[0][1].method).toBe('PATCH');
    // "foto" del frontend viaja como "fotoUrl" y los handles sin "@".
    expect(cuerpoEnviado(fetchMock)).toMatchObject({
      precioHora: 2600,
      fotoUrl: 'avatar:mujer',
      redes: { tiktok: 'paseos.nqn' },
    });
    expect(editado.precioHora).toBe(2600);
  });

  it('la cuenta valida el nombre y actualiza la sesión con la respuesta', async () => {
    await guardarSesion(sesionDe('paseador'));

    await expect(actualizarMiCuenta({ nombre: 'T' })).rejects.toThrow('al menos 2 letras');
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValue(respuestaJson({ ...sesionDe('paseador').usuario, nombre: 'Tomás' }));
    await actualizarMiCuenta({ nombre: ' Tomás ' });

    expect(cuerpoEnviado(fetchMock)).toMatchObject({ nombre: 'Tomás' });
    await expect(obtenerSesionGuardada()).resolves.toMatchObject({ usuario: { nombre: 'Tomás' } });
  });
});

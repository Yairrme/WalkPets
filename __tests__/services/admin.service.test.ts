import { listarUsuariosAdmin } from '../../src/services/admin.service';
import { borrarSesionGuardada, guardarSesion } from '../../src/services/sesion.service';
import { respuestaJson, sesionDe, simularFetch } from '../fixtures/api';

// El servicio corta antes de llamar al backend si la sesión no es de admin
// (el servidor vuelve a controlarlo con el rol del JWT).
jest.mock('../../src/config/api', () => ({
  API_URL: 'http://api.walkpets.test/api',
  API_TIMEOUT_MS: 5000,
}));

describe('admin.service', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = simularFetch();
  });

  afterEach(async () => {
    await borrarSesionGuardada();
  });

  it('pide iniciar sesión si no hay sesión', async () => {
    await expect(listarUsuariosAdmin()).rejects.toThrow('Iniciá sesión como administrador');
  });

  it('rechaza a clientes y paseadores sin llamar al servidor', async () => {
    await guardarSesion(sesionDe('cliente'));
    await expect(listarUsuariosAdmin()).rejects.toThrow('solo para administradores');

    await guardarSesion(sesionDe('paseador'));
    await expect(listarUsuariosAdmin()).rejects.toThrow('solo para administradores');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('un admin consulta las cuentas con su token', async () => {
    await guardarSesion(sesionDe('admin'));
    fetchMock.mockResolvedValue(respuestaJson({ items: [], total: 0, pagina: 1, porPagina: 20 }));

    await expect(listarUsuariosAdmin()).resolves.toMatchObject({ total: 0 });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer token-admin');
  });
});

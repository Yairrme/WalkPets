import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { SesionProvider, useSesion } from '../../src/context/SesionContext';
import { apiFetch } from '../../src/services/api/client';
import { guardarSesion, obtenerSesionGuardada } from '../../src/services/sesion.service';

// Modo API con fetch simulado: interesa cómo reacciona la sesión ante un 401.
jest.mock('../../src/config/api', () => ({
  API_URL: 'http://api.walkpets.test/api',
  API_TIMEOUT_MS: 5000,
}));

const sesionCliente = {
  token: 'token-vencido',
  usuario: {
    id: '665f1b2c3d4e5f6071829301',
    nombre: 'Martina',
    apellido: 'Gómez',
    email: 'cliente@walkpets.test',
    rol: 'cliente' as const,
  },
};

function EstadoSesion() {
  const { sesion, cargando } = useSesion();
  if (cargando) return <Text>Cargando sesión</Text>;
  return <Text>{sesion ? `Sesión de ${sesion.usuario.nombre}` : 'Sin sesión'}</Text>;
}

describe('SesionProvider', () => {
  beforeEach(async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ statusCode: 401, message: 'Unauthorized' }),
    } as unknown as Response) as unknown as typeof fetch;
    await guardarSesion(sesionCliente);
  });

  it('cierra la sesión cuando la API rechaza el token guardado', async () => {
    render(
      <SesionProvider>
        <EstadoSesion />
      </SesionProvider>
    );

    expect(await screen.findByText('Sesión de Martina')).toBeTruthy();

    await expect(apiFetch('/cuenta', { token: sesionCliente.token })).rejects.toMatchObject({
      status: 401,
    });

    expect(await screen.findByText('Sin sesión')).toBeTruthy();
    await waitFor(async () => expect(await obtenerSesionGuardada()).toBeNull());
  });

  it('ignora un 401 tardío de un token anterior y conserva la sesión vigente', async () => {
    render(
      <SesionProvider>
        <EstadoSesion />
      </SesionProvider>
    );

    expect(await screen.findByText('Sesión de Martina')).toBeTruthy();

    await expect(apiFetch('/cuenta', { token: 'token-de-una-sesion-anterior' })).rejects.toMatchObject(
      { status: 401 }
    );

    expect(screen.getByText('Sesión de Martina')).toBeTruthy();
    expect(await obtenerSesionGuardada()).toMatchObject({ token: sesionCliente.token });
  });
});

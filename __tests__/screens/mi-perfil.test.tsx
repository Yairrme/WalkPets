import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import MiPerfil from '../../app/mi-perfil';
import { useSesion } from '../../src/context/SesionContext';
import { actualizarMiCuenta, getMiCuenta } from '../../src/services/cuenta.service';
import {
  actualizarMiPerfilPaseador,
  getMiPerfilPaseador,
} from '../../src/services/paseadores.service';
import { Sesion, Usuario } from '../../src/types/paseador';
import { paseadorCipolletti } from '../fixtures/paseadores';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../src/context/SesionContext', () => ({
  useSesion: jest.fn(),
}));

jest.mock('../../src/services/cuenta.service', () => ({
  getMiCuenta: jest.fn(),
  actualizarMiCuenta: jest.fn(),
}));

jest.mock('../../src/services/paseadores.service', () => ({
  getMiPerfilPaseador: jest.fn(),
  actualizarMiPerfilPaseador: jest.fn(),
}));

jest.mock('../../src/services/foto.service', () => ({
  elegirFotoDePerfil: jest.fn(),
}));

const mockUseSesion = useSesion as jest.Mock;
const mockGetMiCuenta = getMiCuenta as jest.Mock;
const mockActualizarCuenta = actualizarMiCuenta as jest.Mock;
const mockGetPerfil = getMiPerfilPaseador as jest.Mock;
const mockActualizarPerfil = actualizarMiPerfilPaseador as jest.Mock;

const cliente: Usuario = {
  id: 'cliente-1',
  nombre: 'Martina',
  apellido: 'Gómez',
  email: 'martina@correo.com',
  rol: 'cliente',
};

const paseadora: Usuario = {
  id: 'paseador-1',
  nombre: 'Lucía',
  apellido: 'Fernández',
  email: 'lucia@correo.com',
  telefono: '+5492994123456',
  rol: 'paseador',
};

function conSesion(usuario: Usuario | null) {
  const sesion: Sesion | null = usuario ? { token: 't', usuario } : null;
  mockUseSesion.mockReturnValue({
    sesion,
    cargando: false,
    recargar: jest.fn(),
    iniciar: jest.fn(),
    cerrar: jest.fn(),
  });
}

describe('MiPerfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pide iniciar sesión si no hay sesión', async () => {
    conSesion(null);

    render(<MiPerfil />);

    expect(await screen.findByText('Iniciá sesión para ver y editar tu perfil.')).toBeTruthy();
  });

  it('el cliente ve sus datos y guarda sus mascotas', async () => {
    conSesion(cliente);
    mockGetMiCuenta.mockResolvedValue(cliente);
    mockActualizarCuenta.mockResolvedValue({ ...cliente, mascotas: 'Rocky' });

    render(<MiPerfil />);

    expect(await screen.findByText('Martina Gómez')).toBeTruthy();
    expect(screen.getByText('🐕 Cliente')).toBeTruthy();
    expect(screen.queryByText('Mi perfil público')).toBeNull();

    fireEvent.changeText(screen.getByLabelText('Tus mascotas'), 'Rocky');
    fireEvent.press(screen.getByLabelText('Guardar mis datos'));

    expect(await screen.findByText(/Tus datos se guardaron/)).toBeTruthy();
    expect(mockActualizarCuenta).toHaveBeenCalledWith(
      expect.objectContaining({ mascotas: 'Rocky', nombre: 'Martina' })
    );
  });

  it('el paseador ve su panel y actualiza el perfil público', async () => {
    conSesion(paseadora);
    mockGetMiCuenta.mockResolvedValue(paseadora);
    mockGetPerfil.mockResolvedValue({ ...paseadorCipolletti, usuarioId: 'paseador-1' });
    mockActualizarPerfil.mockImplementation(async (cambios) => ({
      ...paseadorCipolletti,
      ...cambios,
    }));

    render(<MiPerfil />);

    expect(await screen.findByText('Mi perfil público')).toBeTruthy();
    expect(screen.getByText('Mis reseñas (38) →')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Precio por hora'), '2500');
    fireEvent.press(screen.getByLabelText('Agregar Habilitación municipal'));
    fireEvent.press(screen.getByLabelText('Guardar mi perfil público'));

    await waitFor(() =>
      expect(mockActualizarPerfil).toHaveBeenCalledWith(
        expect.objectContaining({ precioHora: 2500, certificaciones: ['Habilitación municipal'] })
      )
    );
    expect(await screen.findByText(/Tu perfil público se actualizó/)).toBeTruthy();
  });

  it('el paseador no puede dejar el teléfono vacío', async () => {
    conSesion(paseadora);
    mockGetMiCuenta.mockResolvedValue(paseadora);
    mockGetPerfil.mockResolvedValue(paseadorCipolletti);

    render(<MiPerfil />);

    fireEvent.changeText(await screen.findByLabelText('Teléfono'), '');
    fireEvent.press(screen.getByLabelText('Guardar mis datos'));

    expect(await screen.findByText('Los paseadores necesitan un teléfono de contacto.')).toBeTruthy();
    expect(mockActualizarCuenta).not.toHaveBeenCalled();
  });
});

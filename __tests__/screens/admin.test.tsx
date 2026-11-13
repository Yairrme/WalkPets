import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Admin from '../../app/admin';
import { useSesion } from '../../src/context/SesionContext';
import {
  cambiarEstadoUsuario,
  eliminarResenaAdmin,
  eliminarUsuarioAdmin,
  listarResenasAdmin,
  listarUsuariosAdmin,
} from '../../src/services/admin.service';
import { ResenaAdmin, UsuarioAdmin } from '../../src/types/admin';
import { Rol } from '../../src/types/paseador';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../src/context/SesionContext', () => ({
  useSesion: jest.fn(),
}));

jest.mock('../../src/services/admin.service', () => ({
  listarUsuariosAdmin: jest.fn(),
  cambiarEstadoUsuario: jest.fn(),
  eliminarUsuarioAdmin: jest.fn(),
  listarResenasAdmin: jest.fn(),
  eliminarResenaAdmin: jest.fn(),
}));

const mockUseSesion = useSesion as jest.Mock;
const mockListarUsuarios = listarUsuariosAdmin as jest.Mock;
const mockCambiarEstado = cambiarEstadoUsuario as jest.Mock;
const mockEliminarUsuario = eliminarUsuarioAdmin as jest.Mock;
const mockListarResenas = listarResenasAdmin as jest.Mock;
const mockEliminarResena = eliminarResenaAdmin as jest.Mock;

function conSesion(rol: Rol | null) {
  mockUseSesion.mockReturnValue({
    sesion: rol
      ? {
          token: 't',
          usuario: { id: 'u-admin', nombre: 'Ana', apellido: 'Admin', email: 'admin@x.com', rol },
        }
      : null,
    cargando: false,
  });
}

const paseadora: UsuarioAdmin = {
  id: 'u-1',
  nombre: 'Lucía',
  apellido: 'Fernández',
  email: 'lucia@x.com',
  telefono: '+5492994123456',
  rol: 'paseador',
  activo: true,
  creadoEn: '2026-11-01',
  paseadorId: 'p-1',
};

const administradora: UsuarioAdmin = {
  id: 'u-admin',
  nombre: 'Ana',
  apellido: 'Admin',
  email: 'admin@x.com',
  rol: 'admin',
  activo: true,
  creadoEn: '2026-10-30',
  paseadorId: null,
};

const resena: ResenaAdmin = {
  id: 'r-1',
  paseadorId: 'p-1',
  paseadorNombre: 'Lucía Fernández',
  autorId: 'u-2',
  autorNombre: 'Martina Gómez',
  mascota: 'Rocky',
  texto: 'Paseo puntual, con fotos y mucha paciencia.',
  calificacion: 1,
  fecha: '2026-11-05',
};

const pagina = <T,>(items: T[]) => ({ items, total: items.length, pagina: 1, porPagina: 20 });

describe('Admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    conSesion('admin');
    mockListarUsuarios.mockResolvedValue(pagina([paseadora, administradora]));
    mockListarResenas.mockResolvedValue(pagina([resena]));
  });

  it('bloquea la sección a quien no es admin', () => {
    conSesion('cliente');
    render(<Admin />);

    expect(screen.getByText('Esta sección es solo para administradores.')).toBeTruthy();
    expect(mockListarUsuarios).not.toHaveBeenCalled();
  });

  it('lista las cuentas con correo, rol y estado', async () => {
    render(<Admin />);

    expect(await screen.findByText('2 cuentas')).toBeTruthy();
    expect(screen.getByText('lucia@x.com')).toBeTruthy();
    expect(screen.getAllByText('Activa')).toHaveLength(2);
    expect(mockListarUsuarios).toHaveBeenCalledWith({ rol: null, q: '', pagina: 1 });
    // La cuenta de admin no tiene acciones.
    expect(
      screen.getByText('Las cuentas de administrador no se gestionan desde acá.')
    ).toBeTruthy();
    expect(screen.queryByLabelText('Suspender a Ana Admin')).toBeNull();
  });

  it('suspende y muestra la cuenta como suspendida', async () => {
    mockCambiarEstado.mockResolvedValue({ ...paseadora, activo: false });
    render(<Admin />);

    fireEvent.press(await screen.findByLabelText('Suspender a Lucía Fernández'));

    expect(await screen.findByText('Suspendida')).toBeTruthy();
    expect(mockCambiarEstado).toHaveBeenCalledWith('u-1', false);
    expect(screen.getByLabelText('Reactivar a Lucía Fernández')).toBeTruthy();
  });

  it('pide confirmación antes de eliminar una cuenta', async () => {
    mockEliminarUsuario.mockResolvedValue(undefined);
    render(<Admin />);

    fireEvent.press(await screen.findByLabelText('Eliminar a Lucía Fernández'));
    expect(mockEliminarUsuario).not.toHaveBeenCalled();
    expect(screen.getByText(/No se puede deshacer/)).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Eliminar definitivamente'));

    await waitFor(() => expect(mockEliminarUsuario).toHaveBeenCalledWith('u-1'));
    await waitFor(() => expect(screen.queryByText('lucia@x.com')).toBeNull());
    expect(screen.getByText('1 cuenta')).toBeTruthy();
  });

  it('cancelar la confirmación no elimina', async () => {
    render(<Admin />);

    fireEvent.press(await screen.findByLabelText('Eliminar a Lucía Fernández'));
    fireEvent.press(screen.getByLabelText('Cancelar'));

    expect(mockEliminarUsuario).not.toHaveBeenCalled();
    expect(screen.getByText('lucia@x.com')).toBeTruthy();
  });

  it('filtra por rol y busca por texto', async () => {
    render(<Admin />);
    await screen.findByText('2 cuentas');

    fireEvent.press(screen.getByLabelText('Filtrar: Paseadores'));
    await waitFor(() =>
      expect(mockListarUsuarios).toHaveBeenLastCalledWith({ rol: 'paseador', q: '', pagina: 1 })
    );

    fireEvent.changeText(screen.getByPlaceholderText('Ej. lucia o @gmail.com'), '  lucia ');
    fireEvent.press(screen.getByText('Buscar'));
    await waitFor(() =>
      expect(mockListarUsuarios).toHaveBeenLastCalledWith({ rol: 'paseador', q: 'lucia', pagina: 1 })
    );
  });

  it('muestra el error del servidor si falla una acción', async () => {
    mockCambiarEstado.mockRejectedValue(new Error('No se pueden modificar otras cuentas de administrador.'));
    render(<Admin />);

    fireEvent.press(await screen.findByLabelText('Suspender a Lucía Fernández'));

    expect(
      await screen.findByText('No se pueden modificar otras cuentas de administrador.')
    ).toBeTruthy();
  });

  it('muestra el error de carga con reintento', async () => {
    mockListarUsuarios.mockRejectedValueOnce(new Error('La administración necesita el backend.'));
    render(<Admin />);

    expect(await screen.findByText('La administración necesita el backend.')).toBeTruthy();
  });

  it('modera reseñas desde la pestaña Reseñas', async () => {
    mockEliminarResena.mockResolvedValue(undefined);
    render(<Admin />);
    await screen.findByText('2 cuentas');

    fireEvent.press(screen.getByLabelText('Reseñas'));
    expect(await screen.findByText('1 reseña')).toBeTruthy();
    expect(screen.getByText('Para Lucía Fernández')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Eliminar la reseña de Martina Gómez'));
    fireEvent.press(screen.getByLabelText('Eliminar definitivamente'));

    expect(await screen.findByText('Todavía no hay reseñas publicadas.')).toBeTruthy();
    expect(mockEliminarResena).toHaveBeenCalledWith('r-1');
  });
});

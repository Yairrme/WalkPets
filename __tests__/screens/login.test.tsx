import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import LoginScreen from '../../app/login';
import {
  iniciarSesion,
  registrarCuentaCliente,
} from '../../src/services/auth.service';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('../../src/services/auth.service', () => ({
  iniciarSesion: jest.fn(),
  registrarCuentaCliente: jest.fn(),
  obtenerSesionActual: jest.fn(async () => null),
  cerrarSesion: jest.fn(async () => undefined),
  esModoDemo: () => true,
  CREDENCIALES_DEMO: {
    cliente: { email: 'cliente@walkpets.demo', password: 'demo1234' },
    paseador: { email: 'paseador@walkpets.demo', password: 'demo1234' },
  },
}));

const mockIniciarSesion = iniciarSesion as jest.MockedFunction<typeof iniciarSesion>;
const mockRegistrar = registrarCuentaCliente as jest.MockedFunction<
  typeof registrarCuentaCliente
>;
const mockPush = router.push as jest.Mock;

const sesionCliente = {
  token: 'token-demo',
  usuario: {
    id: 'u1',
    nombre: 'Martina',
    apellido: 'Gómez',
    email: 'cliente@walkpets.demo',
    rol: 'cliente' as const,
  },
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pide correo y contraseña antes de llamar al servicio', () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getAllByText('Ingresar').at(-1)!);

    expect(
      screen.getByText('Ingresá tu correo electrónico y contraseña.')
    ).toBeTruthy();
    expect(mockIniciarSesion).not.toHaveBeenCalled();
  });

  it('inicia sesión con credenciales válidas y navega al listado', async () => {
    mockIniciarSesion.mockResolvedValue(sesionCliente);

    render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText('ejemplo@correo.com'),
      'cliente@walkpets.demo'
    );
    fireEvent.changeText(screen.getByPlaceholderText('••••••••••••'), 'demo1234');
    fireEvent.press(screen.getAllByText('Ingresar').at(-1)!);

    await waitFor(() => {
      expect(mockIniciarSesion).toHaveBeenCalledWith({
        email: 'cliente@walkpets.demo',
        password: 'demo1234',
      });
    });
    expect(mockPush).toHaveBeenCalledWith('/paseadores');
  });

  it('muestra el error del servicio cuando las credenciales son incorrectas', async () => {
    mockIniciarSesion.mockRejectedValue(new Error('Correo o contraseña incorrectos.'));

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('ejemplo@correo.com'), 'x@y.com');
    fireEvent.changeText(screen.getByPlaceholderText('••••••••••••'), 'incorrecta');
    fireEvent.press(screen.getAllByText('Ingresar').at(-1)!);

    expect(
      await screen.findByText('Correo o contraseña incorrectos.')
    ).toBeTruthy();
  });

  it('valida la contraseña corta al crear una cuenta', () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByLabelText('Crear cuenta de cliente'));
    fireEvent.changeText(screen.getByPlaceholderText('Ej: Martina'), 'Martina');
    fireEvent.changeText(screen.getByPlaceholderText('Ej: Gómez'), 'Gómez');
    fireEvent.changeText(
      screen.getByPlaceholderText('ejemplo@correo.com'),
      'martina@correo.com'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Mínimo 8 caracteres'),
      'corta'
    );
    fireEvent.press(screen.getByText('Crear mi cuenta'));

    expect(
      screen.getByText('La contraseña debe tener al menos 8 caracteres.')
    ).toBeTruthy();
    expect(mockRegistrar).not.toHaveBeenCalled();
  });

  it('registra un cliente, normaliza el teléfono y navega', async () => {
    mockRegistrar.mockResolvedValue(sesionCliente);

    render(<LoginScreen />);

    fireEvent.press(screen.getByLabelText('Crear cuenta de cliente'));
    fireEvent.changeText(screen.getByPlaceholderText('Ej: Martina'), 'Martina');
    fireEvent.changeText(screen.getByPlaceholderText('Ej: Gómez'), 'Gómez');
    fireEvent.changeText(
      screen.getByPlaceholderText('ejemplo@correo.com'),
      'martina@correo.com'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Mínimo 8 caracteres'),
      'secreto123'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Ej: +54 299 4123456'),
      '+54 299 4123456'
    );
    fireEvent.press(screen.getByText('Crear mi cuenta'));

    await waitFor(() => {
      expect(mockRegistrar).toHaveBeenCalledWith({
        nombre: 'Martina',
        apellido: 'Gómez',
        email: 'martina@correo.com',
        password: 'secreto123',
        telefono: '+5492994123456',
      });
    });
    expect(mockPush).toHaveBeenCalledWith('/paseadores');
  });

  it('rechaza un teléfono opcional con formato inválido', () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByLabelText('Crear cuenta de cliente'));
    fireEvent.changeText(screen.getByPlaceholderText('Ej: Martina'), 'Martina');
    fireEvent.changeText(screen.getByPlaceholderText('Ej: Gómez'), 'Gómez');
    fireEvent.changeText(
      screen.getByPlaceholderText('ejemplo@correo.com'),
      'martina@correo.com'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Mínimo 8 caracteres'),
      'secreto123'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Ej: +54 299 4123456'),
      '123'
    );
    fireEvent.press(screen.getByText('Crear mi cuenta'));

    expect(
      screen.getByText('Ingresá un teléfono válido (ej. +54 299 4123456) o dejalo vacío.')
    ).toBeTruthy();
    expect(mockRegistrar).not.toHaveBeenCalled();
  });

  it('ofrece credenciales de demostración en modo mock', () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByLabelText('Completar credenciales de paseador de demostración'));

    expect(screen.getByDisplayValue('paseador@walkpets.demo')).toBeTruthy();
    expect(screen.getByDisplayValue('demo1234')).toBeTruthy();
  });
});

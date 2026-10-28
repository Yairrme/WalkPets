import { fireEvent, render, screen } from '@testing-library/react-native';
import RegistroPaseador from '../../app/paseadores/registro';
import { registrarPaseador } from '../../src/services/paseadores.service';
import { paseadorCipolletti } from '../fixtures/paseadores';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../src/services/paseadores.service', () => ({
  registrarPaseador: jest.fn(),
}));

const mockRegistrarPaseador = registrarPaseador as jest.MockedFunction<
  typeof registrarPaseador
>;

function enviarFormulario() {
  fireEvent.press(screen.getByText('Crear mi Perfil de Paseador 🐾'));
}

function completarDatosValidos() {
  fireEvent.changeText(screen.getByPlaceholderText('Ej: Lucía'), 'Nuevo');
  fireEvent.changeText(screen.getByPlaceholderText('Ej: Fernández'), 'Paseador');
  fireEvent.changeText(
    screen.getByPlaceholderText('Ej: lucia@correo.com'),
    'nuevo@walkpets.com'
  );
  fireEvent.changeText(
    screen.getByPlaceholderText('Mínimo 8 caracteres'),
    'secreto123'
  );
  fireEvent.changeText(
    screen.getByPlaceholderText('Ej: +54 299 4123456'),
    '+54 299 4000000'
  );
  fireEvent.press(screen.getByLabelText('Seleccionar ciudad Neuquén'));
  fireEvent.changeText(
    screen.getByPlaceholderText('Ej: Cipolletti Centro o Brentana'),
    'Neuquén Centro'
  );
  fireEvent.changeText(screen.getByPlaceholderText('Ej: 1800'), '2000');
  fireEvent.changeText(
    screen.getByPlaceholderText(/Tengo 4 años de experiencia/),
    'Paseos diarios con experiencia.'
  );
}

describe('RegistroPaseador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra los errores de los campos obligatorios', () => {
    render(<RegistroPaseador />);

    enviarFormulario();

    expect(screen.getByText('El nombre es obligatorio')).toBeTruthy();
    expect(screen.getByText('El apellido es obligatorio')).toBeTruthy();
    expect(screen.getByText('El correo electrónico es obligatorio')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria')).toBeTruthy();
    expect(screen.getByText('Seleccioná una ciudad')).toBeTruthy();
    expect(screen.getByText('El barrio es obligatorio')).toBeTruthy();
    expect(screen.getByText('El teléfono es obligatorio')).toBeTruthy();
    expect(screen.getByText('El precio es obligatorio')).toBeTruthy();
    expect(
      screen.getByText('Escribe una descripción de al menos 15 caracteres')
    ).toBeTruthy();
  });

  it('trata un teléfono con solo espacios como vacío', () => {
    render(<RegistroPaseador />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Ej: +54 299 4123456'),
      '   '
    );
    enviarFormulario();

    expect(screen.getByText('El teléfono es obligatorio')).toBeTruthy();
  });

  it('rechaza un teléfono con formato inválido', () => {
    render(<RegistroPaseador />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Ej: +54 299 4123456'),
      '123'
    );
    enviarFormulario();

    expect(
      screen.getByText('Ingresá un teléfono válido (ej. +54 299 4123456)')
    ).toBeTruthy();
  });

  it('rechaza una contraseña corta y un correo inválido', () => {
    render(<RegistroPaseador />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Ej: lucia@correo.com'),
      'no-es-email'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Mínimo 8 caracteres'),
      'corta'
    );
    enviarFormulario();

    expect(screen.getByText('Ingresá un correo electrónico válido')).toBeTruthy();
    expect(
      screen.getByText('La contraseña debe tener al menos 8 caracteres')
    ).toBeTruthy();
  });

  it('rechaza un precio que no es numérico', () => {
    render(<RegistroPaseador />);

    fireEvent.changeText(screen.getByPlaceholderText('Ej: 1800'), 'abc');
    enviarFormulario();

    expect(
      screen.getByText('El precio debe ser un número mayor a 0')
    ).toBeTruthy();
  });

  it('registra un paseador válido, normaliza el teléfono y muestra la vista de éxito', async () => {
    mockRegistrarPaseador.mockResolvedValue({
      ...paseadorCipolletti,
      id: '5',
      nombre: 'Nuevo',
      apellido: 'Paseador',
      barrio: 'Neuquén Centro',
      ciudad: 'Neuquén',
      precioHora: 2000,
      telefono: '+5492994000000',
      resenas: [],
      cantidadResenas: 0,
      calificacion: 0,
    });

    render(<RegistroPaseador />);
    completarDatosValidos();

    enviarFormulario();

    expect(await screen.findByText('¡Registro Exitoso!')).toBeTruthy();
    expect(screen.getByText('Nuevo Paseador')).toBeTruthy();
    expect(
      screen.getByText(/Ya formas parte de la red de WalkPets en Neuquén/)
    ).toBeTruthy();
    expect(mockRegistrarPaseador).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Nuevo',
        apellido: 'Paseador',
        ciudad: 'Neuquén',
        barrio: 'Neuquén Centro',
        precioHora: 2000,
        telefono: '+5492994000000',
        email: 'nuevo@walkpets.com',
        password: 'secreto123',
      })
    );
  });
});

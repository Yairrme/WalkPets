import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ActivityIndicator, Linking } from 'react-native';
import DetallePaseador from '../../app/paseadores/[id]';
import { getPaseadorById } from '../../src/services/paseadores.service';
import { Paseador } from '../../src/types/paseador';
import {
  paseadorCipolletti,
  paseadorNeuquen,
  paseadorSinResenas,
  paseadorSinTelefono,
} from '../fixtures/paseadores';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '1' }),
}));

jest.mock('../../src/services/paseadores.service', () => ({
  getPaseadorById: jest.fn(),
}));

const mockGetPaseadorById = getPaseadorById as jest.MockedFunction<typeof getPaseadorById>;

describe('DetallePaseador', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  it('muestra el indicador de carga antes de resolver el servicio', () => {
    mockGetPaseadorById.mockImplementation(
      () => new Promise<Paseador | null>(() => {})
    );

    const { UNSAFE_getByType } = render(<DetallePaseador />);

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('muestra los datos del perfil, la ciudad y las reseñas', async () => {
    mockGetPaseadorById.mockResolvedValue(paseadorCipolletti);

    render(<DetallePaseador />);

    expect(await screen.findByText('Lucía Fernández')).toBeTruthy();
    expect(screen.getByText('📍 Cipolletti Centro, Cipolletti')).toBeTruthy();
    expect(screen.getByText('4.9')).toBeTruthy();
    expect(screen.getByText('38 reseñas')).toBeTruthy();
    expect(screen.getByText('Sobre mí')).toBeTruthy();
    expect(screen.getByText(paseadorCipolletti.descripcion)).toBeTruthy();
    expect(screen.getByText('Razas aceptadas')).toBeTruthy();
    expect(screen.getByText('Todas las razas')).toBeTruthy();
    expect(screen.getByText('Reseñas (1)')).toBeTruthy();
    expect(screen.getByText('Martina G.')).toBeTruthy();
    expect(screen.getByText('🐶 Rocky')).toBeTruthy();
    expect(screen.getByText(paseadorCipolletti.resenas[0].texto)).toBeTruthy();
    expect(screen.getByText('2024-11-10')).toBeTruthy();
  });

  it('muestra la ciudad de Neuquén en el perfil', async () => {
    mockGetPaseadorById.mockResolvedValue(paseadorNeuquen);

    render(<DetallePaseador />);

    expect(await screen.findByText('Santiago Morales')).toBeTruthy();
    expect(screen.getByText('📍 Neuquén Centro, Neuquén')).toBeTruthy();
  });

  it('muestra el teléfono formateado y abre llamada y WhatsApp', async () => {
    mockGetPaseadorById.mockResolvedValue(paseadorCipolletti);

    render(<DetallePaseador />);

    expect(await screen.findByText('+54 9 299 4123-456')).toBeTruthy();

    fireEvent.press(screen.getByText('📞 Llamar'));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:+5492994123456');

    fireEvent.press(screen.getByText('💬 WhatsApp'));
    expect(Linking.openURL).toHaveBeenCalledWith(
      `https://wa.me/5492994123456?text=${encodeURIComponent(
        'Hola Lucía, te contacto desde WalkPets para consultar por el servicio de paseo.'
      )}`
    );
  });

  it('expone etiquetas de accesibilidad en las acciones de contacto', async () => {
    mockGetPaseadorById.mockResolvedValue(paseadorCipolletti);

    render(<DetallePaseador />);

    expect(await screen.findByLabelText('Llamar a Lucía Fernández')).toBeTruthy();
    expect(
      screen.getByLabelText('Contactar a Lucía Fernández por WhatsApp')
    ).toBeTruthy();
  });

  it('oculta las acciones cuando el teléfono no es válido', async () => {
    mockGetPaseadorById.mockResolvedValue(paseadorSinTelefono);

    render(<DetallePaseador />);

    expect(await screen.findByText('Bruno Sosa')).toBeTruthy();
    expect(
      screen.getByText('Este paseador todavía no tiene un teléfono de contacto válido.')
    ).toBeTruthy();
    expect(screen.queryByText('📞 Llamar')).toBeNull();
    expect(screen.queryByText('💬 WhatsApp')).toBeNull();
  });

  it('muestra una lista de reseñas vacía sin romper el perfil', async () => {
    mockGetPaseadorById.mockResolvedValue(paseadorSinResenas);

    render(<DetallePaseador />);

    expect(await screen.findByText('Ana Paz')).toBeTruthy();
    expect(screen.getByText('Reseñas (0)')).toBeTruthy();
    expect(
      screen.getByText('Todavía no hay reseñas de este paseador.')
    ).toBeTruthy();
    expect(screen.queryByText('Martina G.')).toBeNull();
  });

  it('no muestra el flujo de reservas en el perfil activo', async () => {
    mockGetPaseadorById.mockResolvedValue(paseadorCipolletti);

    render(<DetallePaseador />);

    await screen.findByText('Lucía Fernández');
    expect(screen.queryByText('Turnos disponibles')).toBeNull();
    expect(screen.queryByText('Reservar un turno')).toBeNull();
    expect(screen.queryByText('Libre')).toBeNull();
  });

  it('distingue un paseador inexistente de un error de conexión', async () => {
    mockGetPaseadorById.mockResolvedValue(null);

    render(<DetallePaseador />);

    expect(await screen.findByText('No encontramos este paseador')).toBeTruthy();
    expect(screen.queryByText('Algo salió mal')).toBeNull();
  });

  it('muestra las iniciales cuando el paseador no tiene foto', async () => {
    mockGetPaseadorById.mockResolvedValue({ ...paseadorCipolletti, foto: '' });

    render(<DetallePaseador />);

    expect(await screen.findByLabelText('Sin foto de Lucía Fernández')).toBeTruthy();
    expect(screen.getByText('LF')).toBeTruthy();
  });

  it('muestra permisos declarados y abre las redes del paseador', async () => {
    mockGetPaseadorById.mockResolvedValue({
      ...paseadorCipolletti,
      certificaciones: ['Habilitación municipal'],
      redes: { instagram: 'lucia.paseos', facebook: '', tiktok: '', web: '' },
    });

    render(<DetallePaseador />);

    expect(await screen.findByText('✓ Habilitación municipal')).toBeTruthy();
    expect(screen.getByText(/Declarado por el paseador/)).toBeTruthy();
    expect(screen.queryByText('Facebook ↗')).toBeNull();

    fireEvent.press(screen.getByLabelText('Abrir Instagram de Lucía Fernández'));
    await waitFor(() =>
      expect(Linking.openURL).toHaveBeenCalledWith('https://instagram.com/lucia.paseos')
    );
  });

  it('oculta las secciones de redes y permisos si están vacías', async () => {
    mockGetPaseadorById.mockResolvedValue(paseadorCipolletti);

    render(<DetallePaseador />);

    await screen.findByText('Lucía Fernández');
    expect(screen.queryByText('Permisos y certificaciones')).toBeNull();
    expect(screen.queryByText('Redes')).toBeNull();
  });

  it('muestra el estado de error cuando el servicio falla', async () => {
    mockGetPaseadorById.mockRejectedValue(new Error('falló la carga'));

    render(<DetallePaseador />);

    expect(await screen.findByText('Algo salió mal')).toBeTruthy();
  });

  it('permite reintentar después de un error', async () => {
    mockGetPaseadorById.mockRejectedValueOnce(new Error('falló la carga'));
    mockGetPaseadorById.mockResolvedValueOnce(paseadorCipolletti);

    render(<DetallePaseador />);

    expect(await screen.findByText('Algo salió mal')).toBeTruthy();
    fireEvent.press(screen.getByText('Reintentar'));

    await waitFor(() => {
      expect(screen.getByText('Lucía Fernández')).toBeTruthy();
    });
    expect(mockGetPaseadorById).toHaveBeenCalledTimes(2);
  });
});

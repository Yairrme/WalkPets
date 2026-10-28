import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import ListaPaseadores from '../../app/paseadores/index';
import { getPaseadores } from '../../src/services/paseadores.service';
import { Paseador } from '../../src/types/paseador';
import { paseadores } from '../fixtures/paseadores';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('../../src/services/paseadores.service', () => ({
  getPaseadores: jest.fn(),
}));

const mockGetPaseadores = getPaseadores as jest.MockedFunction<typeof getPaseadores>;
const mockPush = router.push as jest.Mock;

describe('ListaPaseadores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el estado de carga antes de resolver el servicio', () => {
    mockGetPaseadores.mockReturnValue(new Promise<Paseador[]>(() => {}));

    render(<ListaPaseadores />);

    expect(screen.getByText('Buscando paseadores...')).toBeTruthy();
  });

  it('muestra el listado de paseadores y el contador general', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);

    expect(await screen.findByText('Paseador Lucía Fernández')).toBeTruthy();
    expect(screen.getByText('Paseador Mateo Torres')).toBeTruthy();
    expect(screen.getByText('Paseador Santiago Morales')).toBeTruthy();
    expect(screen.getByText('3 de 3 paseadores')).toBeTruthy();
  });

  it('filtra por Cipolletti y muestra el encabezado con la ciudad', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    fireEvent.press(screen.getByText('🏙️ Cipolletti'));

    await waitFor(() => {
      expect(screen.getByText('Paseador Lucía Fernández')).toBeTruthy();
      expect(screen.getByText('Paseador Mateo Torres')).toBeTruthy();
      expect(screen.queryByText('Paseador Santiago Morales')).toBeNull();
      expect(
        screen.getByText('2 de 3 paseadores en Cipolletti (filtrado)')
      ).toBeTruthy();
    });
  });

  it('filtra por Neuquén y muestra el encabezado con la ciudad', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    fireEvent.press(screen.getByText('🏙️ Neuquén'));

    await waitFor(() => {
      expect(screen.getByText('Paseador Santiago Morales')).toBeTruthy();
      expect(screen.queryByText('Paseador Lucía Fernández')).toBeNull();
      expect(
        screen.getByText('1 de 3 paseadores en Neuquén (filtrado)')
      ).toBeTruthy();
    });
  });

  it('vuelve a mostrar todas las ciudades con el chip Todas', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    fireEvent.press(screen.getByText('🏙️ Neuquén'));
    await waitFor(() => {
      expect(screen.queryByText('Paseador Lucía Fernández')).toBeNull();
    });

    fireEvent.press(screen.getByText('Todas'));

    await waitFor(() => {
      expect(screen.getByText('Paseador Lucía Fernández')).toBeTruthy();
      expect(screen.getByText('Paseador Santiago Morales')).toBeTruthy();
      expect(screen.getByText('3 de 3 paseadores')).toBeTruthy();
    });
  });

  it('no muestra barrios de otra ciudad al filtrar', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    fireEvent.press(screen.getByText('🏙️ Cipolletti'));

    await waitFor(() => {
      expect(screen.getByText('📍 Villa Alberdi')).toBeTruthy();
      expect(screen.queryByText('📍 Neuquén Centro')).toBeNull();
    });

    fireEvent.press(screen.getByText('🏙️ Neuquén'));

    await waitFor(() => {
      expect(screen.getByText('📍 Neuquén Centro')).toBeTruthy();
      expect(screen.queryByText('📍 Villa Alberdi')).toBeNull();
    });
  });

  it('limpia el barrio seleccionado si no existe en la nueva ciudad', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    fireEvent.press(screen.getByText('📍 Villa Alberdi'));
    await waitFor(() => {
      expect(screen.getByText('1 de 3 paseadores (filtrado)')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('🏙️ Neuquén'));

    await waitFor(() => {
      expect(screen.getByText('Paseador Santiago Morales')).toBeTruthy();
      expect(screen.getByText('1 de 3 paseadores en Neuquén (filtrado)')).toBeTruthy();
    });
  });

  it('filtra por barrio y permite limpiar el filtro', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    fireEvent.press(screen.getByText('📍 Villa Alberdi'));

    await waitFor(() => {
      expect(screen.getByText('Paseador Mateo Torres')).toBeTruthy();
      expect(screen.queryByText('Paseador Lucía Fernández')).toBeNull();
      expect(screen.getByText('1 de 3 paseadores (filtrado)')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('✕ Limpiar'));

    await waitFor(() => {
      expect(screen.getByText('Paseador Lucía Fernández')).toBeTruthy();
      expect(screen.getByText('3 de 3 paseadores')).toBeTruthy();
    });
  });

  it('filtra solo los paseadores disponibles', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    fireEvent.press(screen.getByText('✓ Disponibles'));

    await waitFor(() => {
      expect(screen.getByText('Paseador Lucía Fernández')).toBeTruthy();
      expect(screen.getByText('Paseador Mateo Torres')).toBeTruthy();
      expect(screen.queryByText('Paseador Santiago Morales')).toBeNull();
      expect(screen.getByText('2 de 3 paseadores (filtrado)')).toBeTruthy();
    });
  });

  it('combina ciudad y disponibilidad', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    fireEvent.press(screen.getByText('🏙️ Neuquén'));
    fireEvent.press(screen.getByText('✓ Disponibles'));

    await waitFor(() => {
      expect(screen.getByText('Sin resultados')).toBeTruthy();
      expect(
        screen.getByText('0 de 3 paseadores en Neuquén (filtrado)')
      ).toBeTruthy();
    });
  });

  it('expone el estado seleccionado de los filtros de ciudad', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);
    await screen.findByText('Paseador Lucía Fernández');

    const chipTodas = screen.getByLabelText(
      'Mostrar paseadores de todas las ciudades'
    );
    expect(chipTodas.props.accessibilityState).toEqual({ selected: true });

    fireEvent.press(screen.getByLabelText('Filtrar por ciudad Neuquén'));

    await waitFor(() => {
      expect(
        screen.getByLabelText('Filtrar por ciudad Neuquén').props.accessibilityState
      ).toEqual({ selected: true });
    });
  });

  it('muestra el estado vacío cuando el servicio no devuelve datos', async () => {
    mockGetPaseadores.mockResolvedValue([]);

    render(<ListaPaseadores />);

    expect(await screen.findByText('Sin paseadores disponibles')).toBeTruthy();
  });

  it('muestra el estado de error y permite reintentar', async () => {
    mockGetPaseadores.mockRejectedValueOnce(new Error('falló la carga'));
    mockGetPaseadores.mockResolvedValueOnce(paseadores);

    render(<ListaPaseadores />);

    expect(await screen.findByText('Algo salió mal')).toBeTruthy();
    expect(screen.getByText('Reintentar')).toBeTruthy();

    fireEvent.press(screen.getByText('Reintentar'));

    expect(await screen.findByText('Paseador Lucía Fernández')).toBeTruthy();
    expect(mockGetPaseadores).toHaveBeenCalledTimes(2);
  });

  it('navega al perfil al tocar una tarjeta', async () => {
    mockGetPaseadores.mockResolvedValue(paseadores);

    render(<ListaPaseadores />);

    fireEvent.press(await screen.findByText('Paseador Lucía Fernández'));

    expect(mockPush).toHaveBeenCalledWith('/paseadores/1');
  });
});

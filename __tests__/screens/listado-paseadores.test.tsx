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

// Abre la píldora de un filtro y elige una opción del menú.
function elegir(filtro: string, opcion: string) {
  fireEvent.press(screen.getByLabelText(new RegExp(`^${filtro}:`)));
  fireEvent.press(screen.getByLabelText(`${filtro} ${opcion}`));
}

async function renderizarListado(datos: Paseador[] = paseadores) {
  mockGetPaseadores.mockResolvedValue(datos);
  render(<ListaPaseadores />);
  await screen.findByText('Paseador Lucía Fernández');
}

describe('ListaPaseadores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el estado de carga antes de resolver el servicio', () => {
    mockGetPaseadores.mockReturnValue(new Promise(() => undefined));

    render(<ListaPaseadores />);

    expect(screen.getByText('Buscando paseadores...')).toBeTruthy();
  });

  it('muestra el listado de paseadores y el contador general', async () => {
    await renderizarListado();

    expect(screen.getByText('Paseador Mateo Torres')).toBeTruthy();
    expect(screen.getByText('Paseador Santiago Morales')).toBeTruthy();
    expect(screen.getByText('3 de 3 paseadores')).toBeTruthy();
  });

  it('los filtros ocupan una sola línea de píldoras', async () => {
    await renderizarListado();

    expect(screen.getByLabelText(/^Ciudad:/)).toBeTruthy();
    expect(screen.getByLabelText(/^Barrio:/)).toBeTruthy();
    expect(screen.getByLabelText('Solo paseadores disponibles')).toBeTruthy();
    expect(screen.getByLabelText(/^Ordenar:/)).toBeTruthy();
    // Sin filtros aplicados no hay "Limpiar".
    expect(screen.queryByText('Limpiar filtros')).toBeNull();
  });

  it('filtra por Cipolletti y muestra el encabezado con la ciudad', async () => {
    await renderizarListado();

    elegir('Ciudad', 'Cipolletti');

    await waitFor(() => {
      expect(screen.getByText('Paseador Mateo Torres')).toBeTruthy();
      expect(screen.queryByText('Paseador Santiago Morales')).toBeNull();
      expect(screen.getByText('2 de 3 paseadores en Cipolletti (filtrado)')).toBeTruthy();
    });
  });

  it('vuelve a todas las ciudades', async () => {
    await renderizarListado();

    elegir('Ciudad', 'Neuquén');
    await waitFor(() => expect(screen.queryByText('Paseador Lucía Fernández')).toBeNull());

    elegir('Ciudad', 'Todas las ciudades');
    await waitFor(() => expect(screen.getByText('3 de 3 paseadores')).toBeTruthy());
  });

  it('el menú de barrios solo ofrece barrios de la ciudad elegida', async () => {
    await renderizarListado();

    elegir('Ciudad', 'Cipolletti');
    fireEvent.press(screen.getByLabelText(/^Barrio:/));

    expect(screen.getByLabelText('Barrio Villa Alberdi')).toBeTruthy();
    expect(screen.queryByLabelText('Barrio Neuquén Centro')).toBeNull();
  });

  it('limpia el barrio si no existe en la nueva ciudad', async () => {
    await renderizarListado();

    elegir('Barrio', 'Villa Alberdi');
    await waitFor(() => expect(screen.getByText('1 de 3 paseadores (filtrado)')).toBeTruthy());

    elegir('Ciudad', 'Neuquén');
    await waitFor(() => {
      expect(screen.getByText('Paseador Santiago Morales')).toBeTruthy();
      expect(screen.getByText('1 de 3 paseadores en Neuquén (filtrado)')).toBeTruthy();
    });
  });

  it('filtra por barrio y permite limpiar todos los filtros', async () => {
    await renderizarListado();

    elegir('Barrio', 'Villa Alberdi');
    await waitFor(() => {
      expect(screen.queryByText('Paseador Lucía Fernández')).toBeNull();
      expect(screen.getByText('1 de 3 paseadores (filtrado)')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Limpiar filtros'));
    await waitFor(() => expect(screen.getByText('3 de 3 paseadores')).toBeTruthy());
  });

  it('filtra solo los paseadores disponibles', async () => {
    await renderizarListado();

    fireEvent.press(screen.getByLabelText('Solo paseadores disponibles'));

    await waitFor(() => {
      expect(screen.queryByText('Paseador Santiago Morales')).toBeNull();
      expect(screen.getByText('2 de 3 paseadores (filtrado)')).toBeTruthy();
    });
    expect(
      screen.getByLabelText('Solo paseadores disponibles').props.accessibilityState
    ).toEqual(expect.objectContaining({ selected: true }));
  });

  it('muestra "Sin resultados" si los filtros no coinciden', async () => {
    await renderizarListado();

    elegir('Ciudad', 'Neuquén');
    fireEvent.press(screen.getByLabelText('Solo paseadores disponibles'));

    await waitFor(() => {
      expect(screen.getByText('Sin resultados')).toBeTruthy();
      expect(screen.getByText('0 de 3 paseadores en Neuquén (filtrado)')).toBeTruthy();
    });
  });

  it('ordena por menor precio', async () => {
    await renderizarListado();

    elegir('Ordenar', 'Menor precio');

    await waitFor(() => {
      const nombres = screen
        .getAllByText(/^Paseador /)
        .map((nodo) => nodo.props.children.flat().join(''));
      const precios = nombres.map(
        (nombre) => paseadores.find((p) => nombre.includes(p.nombre))!.precioHora
      );
      expect(precios).toEqual([...precios].sort((a, b) => a - b));
    });
  });

  it('muestra el estado vacío cuando no hay paseadores registrados', async () => {
    mockGetPaseadores.mockResolvedValue([]);

    render(<ListaPaseadores />);

    expect(await screen.findByText('Sin paseadores disponibles')).toBeTruthy();
  });

  it('muestra el estado de error y permite reintentar', async () => {
    mockGetPaseadores.mockRejectedValueOnce(new Error('falló la carga'));
    mockGetPaseadores.mockResolvedValueOnce(paseadores);

    render(<ListaPaseadores />);

    expect(await screen.findByText('Algo salió mal')).toBeTruthy();
    fireEvent.press(screen.getByText('Reintentar'));

    expect(await screen.findByText('Paseador Lucía Fernández')).toBeTruthy();
    expect(mockGetPaseadores).toHaveBeenCalledTimes(2);
  });

  it('navega al perfil al tocar una tarjeta', async () => {
    await renderizarListado();

    fireEvent.press(screen.getByText('Paseador Lucía Fernández'));

    expect(mockPush).toHaveBeenCalledWith('/paseadores/1');
  });
});

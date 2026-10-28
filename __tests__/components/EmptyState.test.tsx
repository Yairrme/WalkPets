import { fireEvent, render, screen } from '@testing-library/react-native';
import { EmptyState } from '../../components/EmptyState';

describe('EmptyState', () => {
  it('muestra el estado vacío', () => {
    render(<EmptyState tipo="vacio" />);

    expect(screen.getByText('Sin paseadores disponibles')).toBeTruthy();
    expect(
      screen.getByText('No encontramos paseadores en tu zona por el momento.')
    ).toBeTruthy();
  });

  it('muestra el estado de error y ejecuta el reintento', () => {
    const onReintentar = jest.fn();
    render(<EmptyState tipo="error" onReintentar={onReintentar} />);

    expect(screen.getByText('Algo salió mal')).toBeTruthy();
    fireEvent.press(screen.getByText('Reintentar'));

    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it('permite sobrescribir el mensaje por defecto', () => {
    render(<EmptyState tipo="vacio" mensaje="Mensaje personalizado" />);

    expect(screen.getByText('Mensaje personalizado')).toBeTruthy();
  });

  it('permite sobrescribir el título por defecto', () => {
    render(<EmptyState tipo="vacio" titulo="Todavía no tenés reseñas" />);

    expect(screen.getByText('Todavía no tenés reseñas')).toBeTruthy();
    expect(screen.queryByText('Sin paseadores disponibles')).toBeNull();
  });
});

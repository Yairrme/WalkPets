import { fireEvent, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { PaseadorCard } from '../../components/PaseadorCard';
import { paseadorCipolletti } from '../fixtures/paseadores';

describe('PaseadorCard', () => {
  it('muestra nombre, precio, calificación, reseñas, barrio, ciudad y disponibilidad', () => {
    render(<PaseadorCard paseador={paseadorCipolletti} onPress={jest.fn()} />);

    expect(screen.getByText('Paseador Lucía Fernández')).toBeTruthy();
    expect(screen.getByText(/\$\s?1[.,]?800/)).toBeTruthy();
    expect(screen.getByText('★ 4.9')).toBeTruthy();
    expect(screen.getByText('(38)')).toBeTruthy();
    expect(screen.getByText('📍 Cipolletti Centro, Cipolletti')).toBeTruthy();
    expect(screen.getByText('Disponible hoy')).toBeTruthy();
  });

  it('ejecuta onPress al tocar la tarjeta', () => {
    const onPress = jest.fn();
    render(<PaseadorCard paseador={paseadorCipolletti} onPress={onPress} />);

    fireEvent.press(screen.getByText('Paseador Lucía Fernández'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('muestra las iniciales cuando no hay foto', () => {
    render(<PaseadorCard paseador={{ ...paseadorCipolletti, foto: '' }} onPress={jest.fn()} />);

    expect(screen.getByLabelText('Sin foto de Lucía Fernández')).toBeTruthy();
    expect(screen.getByText('LF')).toBeTruthy();
  });

  it('muestra el ícono genérico elegido en el registro', () => {
    const { UNSAFE_queryByType } = render(
      <PaseadorCard paseador={{ ...paseadorCipolletti, foto: 'avatar:hombre' }} onPress={jest.fn()} />
    );

    expect(screen.getByLabelText('Avatar genérico de Lucía Fernández')).toBeTruthy();
    expect(UNSAFE_queryByType(Image)).toBeNull();
  });
});

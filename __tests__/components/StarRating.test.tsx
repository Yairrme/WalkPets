import { render, screen } from '@testing-library/react-native';
import { StarRating } from '../../components/StarRating';

describe('StarRating', () => {
  it('renderiza 5 estrellas y el valor numérico con un decimal', () => {
    render(<StarRating calificacion={4.7} />);

    expect(screen.getAllByText('★')).toHaveLength(5);
    expect(screen.getByText('4.7')).toBeTruthy();
  });

  it('oculta el valor numérico cuando mostrarNumero es false', () => {
    render(<StarRating calificacion={4.7} mostrarNumero={false} />);

    expect(screen.getAllByText('★')).toHaveLength(5);
    expect(screen.queryByText('4.7')).toBeNull();
  });

  it('muestra el valor con un decimal aunque reciba un entero', () => {
    render(<StarRating calificacion={5} />);

    expect(screen.getByText('5.0')).toBeTruthy();
  });
});

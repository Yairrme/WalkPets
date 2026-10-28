import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppButton } from '../../components/AppButton';

describe('AppButton', () => {
  it('muestra la etiqueta y ejecuta onPress', () => {
    const onPress = jest.fn();
    render(<AppButton label="Guardar" onPress={onPress} />);

    fireEvent.press(screen.getByText('Guardar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('expone el estado deshabilitado y no dispara onPress', () => {
    const onPress = jest.fn();
    render(<AppButton label="Enviar" onPress={onPress} deshabilitado />);

    const boton = screen.getByRole('button', { name: 'Enviar' });
    expect(boton.props.accessibilityState).toEqual({
      disabled: true,
      busy: false,
    });

    fireEvent.press(boton);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('permite personalizar la etiqueta de accesibilidad', () => {
    render(
      <AppButton
        label="Llamar"
        onPress={jest.fn()}
        accessibilityLabel="Llamar a Lucía"
      />
    );

    expect(screen.getByLabelText('Llamar a Lucía')).toBeTruthy();
  });
});

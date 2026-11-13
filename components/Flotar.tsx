import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleProp, ViewStyle } from 'react-native';
import { useMovimientoReducido } from '../src/hooks/useMovimientoReducido';

// Flotación suave y continua (sube y baja unos píxeles). Pensado para el logo.
// Es decorativa: con "reducir movimiento" activo queda quieta.

type Props = {
  children: ReactNode;
  amplitud?: number;
  duracion?: number;
  style?: StyleProp<ViewStyle>;
};

export function Flotar({ children, amplitud = 6, duracion = 2600, style }: Props) {
  const fase = useRef(new Animated.Value(0)).current;
  const reducido = useMovimientoReducido();

  useEffect(() => {
    if (reducido) {
      fase.setValue(0);
      return;
    }
    const paso = (valor: number) =>
      Animated.timing(fase, {
        toValue: valor,
        duration: duracion / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: Platform.OS !== 'web',
      });
    const bucle = Animated.loop(Animated.sequence([paso(1), paso(0)]));
    bucle.start();
    return () => bucle.stop();
  }, [fase, duracion, reducido]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateY: fase.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitud] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

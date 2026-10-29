import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleProp, ViewStyle } from 'react-native';

// Entrada suave: el contenido sube unos píxeles mientras aparece.
// `retraso` permite escalonar listas (ej. índice * 60 ms).

type Props = {
  children: ReactNode;
  retraso?: number;
  distancia?: number;
  style?: StyleProp<ViewStyle>;
};

const usarDriverNativo = Platform.OS !== 'web';

export function Aparecer({ children, retraso = 0, distancia = 14, style }: Props) {
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacion = Animated.timing(progreso, {
      toValue: 1,
      duration: 420,
      delay: retraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: usarDriverNativo,
    });
    animacion.start();
    return () => animacion.stop();
  }, [progreso, retraso]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progreso,
          transform: [
            {
              translateY: progreso.interpolate({
                inputRange: [0, 1],
                outputRange: [distancia, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

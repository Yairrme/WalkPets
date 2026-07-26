import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
  label?: string;
};

// ============================================================================
// [CAMBIO REALIZADO 1 - REDUCCIÓN DE TAMAÑO GENERAL]:
// Reducimos el tamaño constante del botón (ancho y alto) de 46px a 36px. 
// Al ser una constante global (SIZE), todos los contenedores y desplazamientos
// (translateX) se recalculan automáticamente a esta nueva escala más compacta.
// ============================================================================
const SIZE = 36;

export function BackButton({ onPress }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  // Valores animados para anillos y desplazamiento del ícono
  const ring1Opacity = useRef(new Animated.Value(1)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(1.3)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.timing(ring1Opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(ring1Scale, {
        toValue: 0.7,
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(ring2Opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(ring2Scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(translateX, {
        toValue: -SIZE, // Al ser SIZE = 36, se desplazará exactamente -36px
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.timing(ring1Opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(ring1Scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(ring2Opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(ring2Scale, {
        toValue: 1.3,
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.9}
      onPressIn={Platform.OS !== "web" ? handleHoverIn : undefined}
      onPressOut={Platform.OS !== "web" ? handleHoverOut : undefined}
      {...({
        onMouseEnter: handleHoverIn,
        onMouseLeave: handleHoverOut,
      } as any)}
    >
      {/* Anillo 1 (:before) - Blanco/claro que desaparece y se encoge */}
      <Animated.View
        style={[
          styles.ring,
          styles.ringBefore,
          {
            opacity: ring1Opacity,
            transform: [{ scale: ring1Scale }],
          },
        ]}
      />

      {/* Anillo 2 (:after) - Cyan que aparece y se ajusta a escala 1 */}
      <Animated.View
        style={[
          styles.ring,
          styles.ringAfter,
          {
            opacity: ring2Opacity,
            transform: [{ scale: ring2Scale }],
          },
        ]}
      />

      {/* Caja de íconos deslizantes (.button-box) */}
      <Animated.View
        style={[
          styles.buttonBox,
          {
            transform: [{ translateX: translateX }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          {/* ====================================================================
              [CAMBIO REALIZADO 2 - REDUCCIÓN DE ÍCONOS]:
              Reducimos la propiedad size del FontAwesome de 16 a 13 px para que
              las flechas queden en perfecta armonía con el botón más pequeño.
              ==================================================================== */}
          <FontAwesome name="arrow-left" size={13} color="#f0eeef" />
        </View>
        <View style={styles.iconContainer}>
          <FontAwesome name="arrow-left" size={13} color="#f0eeef" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: "transparent",
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    // ========================================================================
    // [CAMBIO REALIZADO 3 - AJUSTE DE PROPORCIONES DE LOS ANILLOS]:
    // Al reducir el botón de 46px a 36px, ajustamos los márgenes internos (inset)
    // de 5px a 4px (top/left/right/bottom) para ganar área útil interior, 
    // y bajamos el grosor del borde (borderWidth) de 3px a 2.5px para mantener la finura.
    // ========================================================================
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: (SIZE - 8) / 2,
    borderWidth: 2.5,
  },
  ringBefore: {
    borderColor: "#f0eeef",
  },
  ringAfter: {
    borderColor: "#96daf0",
  },
  buttonBox: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SIZE * 2,
    height: SIZE,
    flexDirection: "row",
  },
  iconContainer: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
});

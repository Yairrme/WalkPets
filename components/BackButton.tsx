import React, { useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../src/constants/theme";

type Props = {
  onPress: () => void;
  label?: string;
};

// ============================================================================
// COMPONENTE: BackButton
// Propósito: Botón de volver animado para el header global. Al hacer hover o
// presionar, dos anillos se alternan y la flecha se desliza hacia la izquierda.
// ============================================================================
const SIZE = 36;

export function BackButton({ onPress, label = "Volver" }: Props) {
  // Valores animados para anillos y desplazamiento del ícono
  const ring1Opacity = useRef(new Animated.Value(1)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(1.3)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
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
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={Platform.OS !== "web" ? handleHoverIn : undefined}
      onPressOut={Platform.OS !== "web" ? handleHoverOut : undefined}
      {...({
        onMouseEnter: handleHoverIn,
        onMouseLeave: handleHoverOut,
      } as Record<string, unknown>)}
    >
      {/* Anillo 1 (:before) - Blanco que desaparece y se encoge */}
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

      {/* Anillo 2 (:after) - Verde menta que aparece y se ajusta a escala 1 */}
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
          <FontAwesome name="arrow-left" size={13} color={colors.blanco} />
        </View>
        <View style={styles.iconContainer}>
          <FontAwesome name="arrow-left" size={13} color={colors.blanco} />
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
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: (SIZE - 8) / 2,
    borderWidth: 2.5,
  },
  ringBefore: {
    borderColor: colors.blanco,
  },
  ringAfter: {
    borderColor: colors.verdeMenta,
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

import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { colors, fonts, radius } from "../src/constants/theme";

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
};

// ============================================================================
// ARCHIVO: UiverseSearchButton.tsx
// Propósito: Botón animado basado en el diseño de Uiverse.io (adamgiebl),
// adaptado a la paleta oficial de WalkPets. Implementa resplandor (box-shadow)
// y el haz de luz deslizante (:before) al hacer hover o tocar en móviles.
// ============================================================================

export function UiverseSearchButton({
  onPress,
  style,
  label = "Buscar paseadores",
}: Props) {
  const [isHovered, setIsHovered] = useState(false);

  // Valor animado para el haz de luz estilo :before (desplazamiento horizontal)
  const translateX = useRef(new Animated.Value(-120)).current;
  const glowOpacity = useRef(new Animated.Value(0.15)).current;
  // El haz permanece invisible en reposo para que el botón se vea limpio
  const beamOpacity = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.timing(glowOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(beamOpacity, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(translateX, {
        toValue: 350, // Desliza el haz de luz a lo largo de todo el botón
        duration: 450,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.timing(glowOpacity, {
        toValue: 0.15,
        duration: 300,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(beamOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(translateX, {
        toValue: -120, // Vuelve a la posición oculta a la izquierda
        duration: 300,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  // Al hacer hover el texto pasa al verde pastel de la marca
  const colorTexto = isHovered ? colors.verdePastel : colors.blanco;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.88}
      onPressIn={Platform.OS !== "web" ? handleHoverIn : undefined}
      onPressOut={Platform.OS !== "web" ? handleHoverOut : undefined}
      {...({
        onMouseEnter: handleHoverIn,
        onMouseLeave: handleHoverOut,
      } as Record<string, unknown>)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre la lista de paseadores"
    >
      {/* Capa de resplandor interior/exterior con verde WalkPets */}
      <Animated.View
        style={[
          styles.glowLayer,
          {
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Haz de luz (:before) que cruza el botón al hacer hover/press */}
      <Animated.View
        style={[
          styles.lightBeam,
          {
            opacity: beamOpacity,
            transform: [{ translateX: translateX }, { skewX: "-20deg" }],
          },
        ]}
      />

      {/* Contenido principal del botón (ícono + texto) */}
      <View style={styles.contentRow}>
        <Entypo
          name="magnifying-glass"
          size={18}
          color={colorTexto}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: colorTexto }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.verdeOscuro,
    borderWidth: 2,
    borderColor: "rgba(168, 192, 122, 0.8)", // Borde verde menta en armonía
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: 28,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    // Sombra exterior en el tono verde de la marca
    shadowColor: colors.verdeOscuro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.verdeMenta,
    borderRadius: radius.full,
  },
  lightBeam: {
    position: "absolute",
    top: -10,
    bottom: -10,
    width: 55,
    backgroundColor: "rgba(255, 255, 255, 0.24)", // Haz de luz claro
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: fonts.sizes.md,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});

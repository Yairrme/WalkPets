import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Entypo } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
  style?: any;
};

// ============================================================================
// ARCHIVO: UiverseSearchButton.tsx
// Propósito: Componente de botón animado basado en el diseño de Uiverse.io
// (adamgiebl), adaptado a la paleta oficial de WalkPets con el verde oliva
// característico: rgba(86, 90, 33, 1). Implementa resplandor (box-shadow) 
// y el haz de luz deslizante (:before) al hacer hover o tocar en móviles.
// ============================================================================

export function UiverseSearchButton({ onPress, style }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  // Valor animado para el haz de luz estilo :before (desplazamiento horizontal)
  const translateX = useRef(new Animated.Value(-80)).current;
  const glowOpacity = useRef(new Animated.Value(0.15)).current;

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.timing(glowOpacity, {
        toValue: 0.5,
        duration: 300,
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
      Animated.timing(translateX, {
        toValue: -80, // Vuelve a la posición oculta a la izquierda
        duration: 300,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  // Al hacer hover el texto resplandece en blanco o verde pastel
  const colorTexto = isHovered ? "#FFFFFF" : "#E8F0D8";

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
      } as any)}
      accessibilityRole="button"
      accessibilityLabel="Buscar paseadores"
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
        <Text style={[styles.text, { color: colorTexto }]}>
          Buscar paseadores
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // Color principal de WalkPets solicitado por el usuario: rgba(86, 90, 33, 1)
    backgroundColor: "rgba(86, 90, 33, 0.96)",
    borderWidth: 2,
    borderColor: "rgba(168, 192, 122, 0.8)", // Borde verde menta en armonía
    borderRadius: 12, // 0.6em aprox
    paddingVertical: 14, // 0.7em aprox
    paddingHorizontal: 28, // 2.7em aprox
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    // Sombra exterior en el tono verde de la marca
    shadowColor: "rgba(86, 90, 33, 1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(168, 192, 122, 1)",
    borderRadius: 10,
  },
  lightBeam: {
    position: "absolute",
    top: -10,
    bottom: -10,
    width: 55, // 4em aprox
    backgroundColor: "rgba(255, 255, 255, 0.28)", // Haz de luz claro
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
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.8, // 0.06em aprox
    textTransform: "none",
  },
});

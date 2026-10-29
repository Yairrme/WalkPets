import { useState } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import {
  colors,
  fonts,
  radius,
  spacing,
} from "../src/constants/theme";

// ============================================================================
// COMPONENTE: AppButton
// Propósito: Botón de uso general en toda la aplicación.
// Soporta diferentes variantes visuales (primario, secundario, outline),
// estados de carga (cargando con spinner) y deshabilitado.
// Incluye estados de hover para web y etiquetas de accesibilidad.
// ============================================================================

type Props = {
  label: string; // Texto que se mostrará en el botón
  onPress: () => void; // Función a ejecutar al presionar el botón
  variante?: "primario" | "secundario" | "outline"; // Estilo visual del botón
  cargando?: boolean; // Si es true, muestra un spinner en lugar del texto
  deshabilitado?: boolean; // Si es true, reduce opacidad y deshabilita clics
  style?: StyleProp<ViewStyle>; // Estilos adicionales personalizados
  accessibilityLabel?: string; // Etiqueta para lectores de pantalla
  accessibilityHint?: string; // Descripción de lo que hace el botón
};

export function AppButton({
  label,
  onPress,
  variante = "primario",
  cargando = false,
  deshabilitado = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const inactivo = deshabilitado || cargando;

  // Construcción dinámica de estilos para el contenedor del botón
  const estiloBoton = [
    styles.base,
    variante === "primario" && styles.primario,
    variante === "secundario" && styles.secundario,
    variante === "outline" && styles.outline,
    isHovered && !inactivo && variante === "primario" && styles.primarioHover,
    isHovered &&
      !inactivo &&
      variante === "secundario" &&
      styles.secundarioHover,
    isHovered && !inactivo && variante === "outline" && styles.outlineHover,
    inactivo && styles.deshabilitado,
    style,
  ];

  // Construcción dinámica de estilos para el texto según la variante
  const estiloTexto = [
    styles.texto,
    variante === "outline" && styles.textoOutline,
    variante === "secundario" && styles.textoSecundario,
  ];

  return (
    <TouchableOpacity
      style={estiloBoton}
      onPress={onPress}
      disabled={inactivo} // Bloquea interacción si carga o está inactivo
      activeOpacity={0.85}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      {...({
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as Record<string, unknown>)}
    >
      {/* Si está en modo cargando, renderiza el indicador de progreso (spinner) */}
      {cargando ? (
        <ActivityIndicator
          color={variante === "outline" ? colors.verde : colors.blanco}
          size="small"
        />
      ) : (
        /* Caso contrario, muestra la etiqueta de texto normal */
        <Text style={estiloTexto} numberOfLines={1}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderWidth: 2,
    borderColor: "transparent",
  },
  // Variante 1: Fondo verde principal
  primario: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
  },
  primarioHover: {
    backgroundColor: colors.verdeOscuro,
    borderColor: colors.verdeOscuro,
  },
  // Variante 2: Fondo verde claro secundario
  secundario: {
    backgroundColor: colors.verdePastel,
    borderColor: colors.verdePastel,
  },
  secundarioHover: {
    backgroundColor: colors.verdeMenta,
    borderColor: colors.verdeMenta,
  },
  // Variante 3: Sin fondo, con borde verde
  outline: {
    backgroundColor: "transparent",
    borderColor: colors.verde,
  },
  outlineHover: {
    backgroundColor: colors.verdePastel,
  },
  deshabilitado: { opacity: 0.5 },
  texto: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  textoOutline: { color: colors.verde },
  textoSecundario: { color: colors.verdeOscuro },
});

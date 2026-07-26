import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors, fonts, radius, spacing } from "../constants/theme";

// ============================================================================
// COMPONENTE: AppButton
// Propósito: Botón de uso general en toda la aplicación.
// Soporta diferentes variantes visuales (primario, secundario, outline),
// estados de carga (cargando con spinner) y deshabilitado.
// ============================================================================

type Props = {
  label: string; // Texto que se mostrará en el botón
  onPress: () => void; // Función a ejecutar al presionar el botón
  variante?: "primario" | "secundario" | "outline"; // Estilo visual del botón
  cargando?: boolean; // Si es true, muestra un spinner en lugar del texto
  deshabilitado?: boolean; // Si es true, reduce opacidad y deshabilita clics
  style?: ViewStyle; // Estilos adicionales personalizados
};

export function AppButton({
  label,
  onPress,
  variante = "primario",
  cargando = false,
  deshabilitado = false,
  style,
}: Props) {
  // Construcción dinámica de estilos para el contenedor del botón
  const estiloBoton = [
    styles.base,
    variante === "primario" && styles.primario,
    variante === "secundario" && styles.secundario,
    variante === "outline" && styles.outline,
    (deshabilitado || cargando) && styles.deshabilitado,
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
      disabled={deshabilitado || cargando} // Bloquea interacción si carga o está inactivo
      activeOpacity={0.8}
    >
      {/* Si está en modo cargando, renderiza el indicador de progreso (spinner) */}
      {cargando ? (
        <ActivityIndicator
          color={variante === "outline" ? colors.verde : colors.blanco}
          size="small"
        />
      ) : (
        /* Caso contrario, muestra la etiqueta de texto normal */
        <Text style={estiloTexto}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  // Variante 1: Fondo verde principal
  primario: { backgroundColor: colors.verde },
  // Variante 2: Fondo verde claro secundario
  secundario: { backgroundColor: colors.verdeClaro },
  // Variante 3: Sin fondo, con borde verde
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.verde,
  },
  deshabilitado: { opacity: 0.5 },
  texto: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  textoOutline: { color: colors.verde },
  textoSecundario: { color: colors.verde },
});

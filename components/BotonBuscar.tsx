import { Entypo } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, fonts, radius, spacing } from "../src/constants/theme";

type Props = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
};

// ============================================================================
// COMPONENTE: BotonBuscar
// Propósito: CTA principal de búsqueda ("Buscar paseadores").
// Botón sólido en verde oscuro con ícono de lupa. Sin resplandores ni haces de
// luz: la jerarquía la dan el color y el tamaño, y el hover/press responden con
// un cambio de tono claro.
// ============================================================================

export function BotonBuscar({
  onPress,
  style,
  label = "Buscar paseadores",
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre la lista de paseadores"
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.container,
        hovered && styles.hover,
        pressed && styles.presionado,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        <Entypo name="magnifying-glass" size={18} color={colors.blanco} />
        <Text style={styles.text}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.verdeOscuro,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg + 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    // Sombra corta con desplazamiento: levanta el CTA sin halo de color.
    shadowColor: colors.verdeOscuro,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  hover: {
    backgroundColor: colors.verde,
  },
  presionado: {
    backgroundColor: colors.verde,
    transform: [{ scale: 0.98 }],
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  text: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
  },
});

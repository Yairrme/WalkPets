import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors, fonts, radius, spacing } from "../constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "outline";
  cargando?: boolean;
  deshabilitado?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  variante = "primario",
  cargando = false,
  deshabilitado = false,
  style,
}: Props) {
  const estiloBoton = [
    styles.base,
    variante === "primario" && styles.primario,
    variante === "secundario" && styles.secundario,
    variante === "outline" && styles.outline,
    (deshabilitado || cargando) && styles.deshabilitado,
    style,
  ];

  const estiloTexto = [
    styles.texto,
    variante === "outline" && styles.textoOutline,
    variante === "secundario" && styles.textoSecundario,
  ];

  return (
    <TouchableOpacity
      style={estiloBoton}
      onPress={onPress}
      disabled={deshabilitado || cargando}
      activeOpacity={0.8}
    >
      {cargando ? (
        <ActivityIndicator
          color={variante === "outline" ? colors.verde : colors.blanco}
          size="small"
        />
      ) : (
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
  primario: { backgroundColor: colors.verde },
  secundario: { backgroundColor: colors.verdeClaro },
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

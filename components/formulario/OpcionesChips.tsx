import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';

// Grupo de chips para elegir una opción (ciudad) o varias (razas).

type Props = {
  opciones: readonly string[];
  seleccionadas: string[];
  onAlternar: (opcion: string) => void;
  etiquetaAccesible?: (opcion: string) => string;
};

export function OpcionesChips({ opciones, seleccionadas, onAlternar, etiquetaAccesible }: Props) {
  return (
    <View style={styles.chips}>
      {opciones.map((opcion) => {
        const activa = seleccionadas.includes(opcion);
        return (
          <TouchableOpacity
            key={opcion}
            style={[styles.chip, activa && styles.chipActivo]}
            onPress={() => onAlternar(opcion)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={etiquetaAccesible?.(opcion) ?? opcion}
            accessibilityState={{ selected: activa }}
          >
            <Text style={[styles.texto, activa && styles.textoActivo]}>
              {activa ? '✓ ' : ''}
              {opcion}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.grisMedio,
    backgroundColor: colors.blanco,
  },
  chipActivo: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
  },
  texto: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.grisOscuro,
  },
  textoActivo: {
    color: colors.blanco,
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { usarApi } from '../src/config/api';
import { colors, fonts, spacing } from '../src/constants/theme';

// Franja fija que avisa cuando la app NO está guardando en la base de datos
// (EXPO_PUBLIC_DATA_SOURCE=mock). Así nadie registra paseadores creyendo que
// quedan guardados.
export function AvisoModoPrueba() {
  if (usarApi()) return null;

  return (
    <View style={styles.franja} accessibilityRole="alert">
      <Text style={styles.texto}>
        Modo prueba: los datos no se guardan en la base y se pierden al recargar. Para la
        versión real usá EXPO_PUBLIC_DATA_SOURCE=api.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  franja: {
    backgroundColor: colors.advertencia,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  texto: {
    color: colors.negro,
    fontSize: fonts.sizes.xs + 1,
    fontWeight: fonts.pesos.semi,
    textAlign: 'center',
  },
});

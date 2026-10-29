import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { Aparecer } from '../Aparecer';

// Botón de guardar con estado de carga y el resultado (éxito o error) debajo.

type Props = {
  etiqueta: string;
  onPress: () => void;
  guardando: boolean;
  mensaje?: { tipo: 'exito' | 'error'; texto: string } | null;
};

export function BotonGuardar({ etiqueta, onPress, guardando, mensaje }: Props) {
  return (
    <View style={styles.contenedor}>
      {mensaje && (
        <Aparecer
          key={mensaje.texto}
          style={[styles.mensaje, mensaje.tipo === 'exito' ? styles.exito : styles.error]}
        >
          <Text style={mensaje.tipo === 'exito' ? styles.exitoTexto : styles.errorTexto}>
            {mensaje.tipo === 'exito' ? '✓ ' : ''}
            {mensaje.texto}
          </Text>
        </Aparecer>
      )}
      <TouchableOpacity
        style={[styles.boton, guardando && styles.deshabilitado]}
        onPress={onPress}
        disabled={guardando}
        accessibilityRole="button"
        accessibilityLabel={etiqueta}
        accessibilityState={{ disabled: guardando, busy: guardando }}
      >
        {guardando ? (
          <ActivityIndicator color={colors.blanco} />
        ) : (
          <Text style={styles.texto}>{etiqueta}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: spacing.sm,
  },
  boton: {
    backgroundColor: colors.verde,
    borderRadius: radius.full,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deshabilitado: {
    opacity: 0.7,
  },
  texto: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
  },
  mensaje: {
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  exito: {
    backgroundColor: colors.exitoClaro,
    borderColor: colors.verdeMenta,
  },
  error: {
    backgroundColor: colors.errorClaro,
    borderColor: colors.error,
  },
  exitoTexto: {
    color: colors.verde,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
  },
  errorTexto: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
  },
});

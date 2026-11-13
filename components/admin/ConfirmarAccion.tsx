import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';

// Botón de acción destructiva con confirmación en línea (sin diálogos del
// sistema, que no funcionan igual en web).

type Props = {
  etiqueta: string;
  pregunta: string;
  confirmar: string;
  onConfirmar: () => void;
  cargando?: boolean;
  accessibilityLabel?: string;
};

export function ConfirmarAccion({
  etiqueta,
  pregunta,
  confirmar,
  onConfirmar,
  cargando = false,
  accessibilityLabel,
}: Props) {
  const [preguntando, setPreguntando] = useState(false);

  if (cargando) {
    return <ActivityIndicator size="small" color={colors.error} />;
  }

  if (!preguntando) {
    return (
      <TouchableOpacity
        style={styles.boton}
        onPress={() => setPreguntando(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? etiqueta}
      >
        <Text style={styles.botonTexto}>{etiqueta}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.confirmacion}>
      <Text style={styles.pregunta}>{pregunta}</Text>
      <View style={styles.fila}>
        <TouchableOpacity
          style={styles.botonConfirmar}
          onPress={() => {
            setPreguntando(false);
            onConfirmar();
          }}
          accessibilityRole="button"
          accessibilityLabel={confirmar}
        >
          <Text style={styles.botonConfirmarTexto}>{confirmar}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonCancelar}
          onPress={() => setPreguntando(false)}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
        >
          <Text style={styles.botonCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.error,
  },
  botonTexto: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.medio,
  },
  confirmacion: {
    width: '100%',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.errorClaro,
  },
  pregunta: {
    color: colors.negro,
    fontSize: fonts.sizes.sm,
  },
  fila: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  botonConfirmar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
  botonConfirmarTexto: {
    color: colors.blanco,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
  },
  botonCancelar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.grisMedio,
  },
  botonCancelarTexto: {
    color: colors.grisOscuro,
    fontSize: fonts.sizes.sm,
  },
});

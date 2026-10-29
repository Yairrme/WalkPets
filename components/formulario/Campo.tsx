import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';

// Campo de texto con etiqueta, ayuda opcional, prefijo y mensaje de error.

type Props = TextInputProps & {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  prefijo?: string;
  obligatorio?: boolean;
  enFila?: boolean; // comparte la fila con otro campo (pantallas anchas)
};

export function Campo({
  etiqueta,
  ayuda,
  error,
  prefijo,
  obligatorio = true,
  enFila = false,
  multiline,
  ...input
}: Props) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={[styles.campo, enFila && styles.campoEnFila]}>
      <Text style={styles.label}>
        {etiqueta}
        {obligatorio ? ' *' : ''}
      </Text>
      <View
        style={[
          styles.caja,
          multiline && styles.cajaMultilinea,
          enfocado && styles.cajaEnfocada,
          error ? styles.cajaError : null,
        ]}
      >
        {prefijo && <Text style={styles.prefijo}>{prefijo}</Text>}
        <TextInput
          {...input}
          multiline={multiline}
          style={[styles.input, multiline && styles.inputMultilinea]}
          placeholderTextColor={colors.grisMedio}
          onFocus={(e) => {
            setEnfocado(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            input.onBlur?.(e);
          }}
        />
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : ayuda ? (
        <Text style={styles.ayuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    gap: spacing.xs + 2,
  },
  campoEnFila: {
    flex: 1,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grisClaro,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.grisClaro,
    paddingHorizontal: spacing.md - 2,
  },
  cajaMultilinea: {
    alignItems: 'flex-start',
  },
  cajaEnfocada: {
    borderColor: colors.verde,
    backgroundColor: colors.blanco,
  },
  cajaError: {
    borderColor: colors.error,
    backgroundColor: colors.errorClaro,
  },
  prefijo: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
    color: colors.grisOscuro,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: fonts.sizes.md,
    color: colors.negro,
    // En web el foco ya se marca con el borde verde de la caja.
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
  } as TextStyle,
  inputMultilinea: {
    height: 120,
  },
  error: {
    color: colors.error,
    fontSize: fonts.sizes.xs + 1,
    fontWeight: fonts.pesos.medio,
  },
  ayuda: {
    color: colors.grisOscuro,
    fontSize: fonts.sizes.xs + 1,
  },
});

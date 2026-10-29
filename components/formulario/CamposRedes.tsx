import { FontAwesome } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { RedesSociales } from '../../src/types/paseador';
import { esRedValida, Red } from '../../src/utils/redes';

// Campos de redes sociales (todos opcionales). Controlado por el formulario.

const REDES: {
  red: Red;
  etiqueta: string;
  icono: ComponentProps<typeof FontAwesome>['name'];
  placeholder: string;
}[] = [
  { red: 'instagram', etiqueta: 'Instagram', icono: 'instagram', placeholder: 'tu.usuario' },
  { red: 'facebook', etiqueta: 'Facebook', icono: 'facebook-square', placeholder: 'tu.pagina' },
  { red: 'tiktok', etiqueta: 'TikTok', icono: 'music', placeholder: 'tu.usuario' },
  { red: 'web', etiqueta: 'Sitio web', icono: 'globe', placeholder: 'https://...' },
];

type Props = {
  redes: RedesSociales;
  onCambiar: (redes: RedesSociales) => void;
};

export function CamposRedes({ redes, onCambiar }: Props) {
  return (
    <View style={styles.lista}>
      {REDES.map(({ red, etiqueta, icono, placeholder }) => {
        const valida = esRedValida(red, redes[red]);
        return (
          <View key={red} style={styles.fila}>
            <View style={[styles.caja, !valida && styles.cajaError]}>
              <FontAwesome name={icono} size={18} color={colors.verde} style={styles.icono} />
              {red !== 'web' && <Text style={styles.arroba}>@</Text>}
              <TextInput
                value={redes[red]}
                onChangeText={(valor) => onCambiar({ ...redes, [red]: valor })}
                placeholder={placeholder}
                placeholderTextColor={colors.grisMedio}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={red === 'web' ? 'url' : 'default'}
                style={styles.input}
                accessibilityLabel={etiqueta}
              />
            </View>
            {!valida && (
              <Text style={styles.error}>
                {red === 'web'
                  ? 'Debe empezar con http:// o https://'
                  : 'Solo letras, números, puntos y guiones bajos.'}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: spacing.sm,
  },
  fila: {
    gap: 4,
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
  cajaError: {
    borderColor: colors.error,
    backgroundColor: colors.errorClaro,
  },
  icono: {
    width: 24,
  },
  arroba: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: fonts.sizes.md,
    color: colors.negro,
  },
  error: {
    color: colors.error,
    fontSize: fonts.sizes.xs + 1,
  },
});

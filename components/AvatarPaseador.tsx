import { FontAwesome } from '@expo/vector-icons';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../src/constants/theme';
import { tipoAvatar } from '../src/utils/fotoPerfil';

// Foto de perfil de un paseador: ícono genérico (mujer/hombre), foto propia
// o iniciales si no eligió nada. Un único lugar decide cómo se dibuja.

type Props = {
  foto: string;
  nombre: string;
  apellido: string;
  tamano: number; // ancho y alto en px (con `relleno`, solo escala el ícono)
  redondo?: boolean;
  // Ocupa el área que define `style` (ej. foto rectangular de una tarjeta).
  relleno?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AvatarPaseador({
  foto,
  nombre,
  apellido,
  tamano,
  redondo = false,
  relleno = false,
  style,
}: Props) {
  const forma = relleno
    ? null
    : { width: tamano, height: tamano, borderRadius: redondo ? tamano / 2 : 0 };
  const tipo = tipoAvatar(foto);

  if (tipo) {
    return (
      <View
        style={[styles.base, styles.icono, forma, style]}
        accessibilityLabel={`Avatar genérico de ${nombre} ${apellido}`}
      >
        <FontAwesome
          name={tipo === 'mujer' ? 'female' : 'male'}
          size={tamano * 0.5}
          color={colors.verde}
        />
      </View>
    );
  }

  if (foto) {
    return (
      <Image
        source={{ uri: foto }}
        style={[styles.base, forma, style as never]}
        accessibilityLabel={`Foto de ${nombre} ${apellido}`}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={[styles.base, styles.icono, forma, style]}
      accessibilityLabel={`Sin foto de ${nombre} ${apellido}`}
    >
      <Text style={[styles.iniciales, { fontSize: tamano * 0.3 }]}>
        {nombre.charAt(0)}
        {apellido.charAt(0)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: colors.grisClaro,
  },
  icono: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.verdePastel,
  },
  iniciales: {
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
  },
});

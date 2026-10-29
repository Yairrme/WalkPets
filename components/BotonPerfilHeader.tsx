import { FontAwesome } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { useSesion } from '../src/context/SesionContext';

// Acceso a "Mi perfil" en la barra superior de las pantallas internas.
// Con sesión muestra las iniciales; sin sesión, "Entrar".
export function BotonPerfilHeader() {
  const { sesion } = useSesion();
  const ruta = usePathname();

  if (ruta === '/mi-perfil' || ruta === '/login') return null;

  if (!sesion) {
    return (
      <Pressable
        onPress={() => router.push('/login')}
        style={styles.entrar}
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión"
      >
        <Text style={styles.entrarTexto}>Entrar</Text>
      </Pressable>
    );
  }

  const { nombre, apellido, rol } = sesion.usuario;
  return (
    <Pressable
      onPress={() => router.push('/mi-perfil')}
      style={({ pressed }) => [styles.avatar, pressed && styles.presionado]}
      accessibilityRole="button"
      accessibilityLabel={rol === 'paseador' ? 'Abrir mi panel' : 'Ver mi perfil'}
    >
      {nombre ? (
        <Text style={styles.iniciales}>
          {nombre.charAt(0)}
          {apellido.charAt(0)}
        </Text>
      ) : (
        <FontAwesome name="user" size={16} color={colors.verdeOscuro} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.verdeMenta,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  presionado: {
    opacity: 0.75,
  },
  iniciales: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  entrar: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.blancoSuave,
    marginRight: spacing.sm,
  },
  entrarTexto: {
    color: colors.blanco,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
  },
});

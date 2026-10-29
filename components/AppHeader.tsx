import { Entypo, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ComponentProps, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { useSesion } from '../src/context/SesionContext';

// ============================================================================
// COMPONENTE: AppHeader
// Barra superior de la página de inicio. Sabe si hay sesión: a un visitante le
// ofrece sumarse como paseador o entrar (buscar ya está en el inicio); a un usuario lo saluda y le
// muestra sus accesos (Mis reseñas para paseadores) y Salir.
// En pantallas chicas colapsa en un menú desplegable animado.
// ============================================================================

const BREAKPOINT = 760;
const usarDriverNativo = Platform.OS !== 'web';

type Props = {
  onQuienesSomos: () => void;
  quienesActivo?: boolean;
};

type Ruta = '/paseadores/registro' | '/login' | '/mi-perfil';

type Accion = {
  clave: string;
  etiqueta: string;
  icono: ComponentProps<typeof FontAwesome>['name'];
  onPress: () => void | Promise<void>;
  variante?: 'link' | 'contorno' | 'lleno';
};

export function AppHeader({ onQuienesSomos, quienesActivo = false }: Props) {
  const { sesion, cerrar } = useSesion();
  const { width } = useWindowDimensions();
  const esAncho = width >= BREAKPOINT;
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Entrada del header (baja y aparece) y apertura del menú móvil.
  const entrada = useRef(new Animated.Value(0)).current;
  const menu = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: usarDriverNativo,
    }).start();
  }, [entrada]);

  useEffect(() => {
    Animated.timing(menu, {
      toValue: menuAbierto ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: usarDriverNativo,
    }).start();
  }, [menu, menuAbierto]);

  // En pantallas anchas el menú móvil no existe.
  useEffect(() => {
    if (esAncho) setMenuAbierto(false);
  }, [esAncho]);

  const ir = (ruta: Ruta) => () => router.push(ruta);

  const acciones: Accion[] = [
    { clave: 'quienes', etiqueta: 'Quiénes somos', icono: 'info-circle', onPress: onQuienesSomos },
  ];

  if (sesion) {
    acciones.push({
      clave: 'perfil',
      etiqueta: sesion.usuario.rol === 'paseador' ? 'Mi panel' : 'Mi perfil',
      icono: 'user-circle',
      onPress: ir('/mi-perfil'),
      variante: 'lleno',
    });
    acciones.push({ clave: 'salir', etiqueta: 'Salir', icono: 'sign-out', onPress: cerrar });
  } else {
    acciones.push(
      { clave: 'ofrecer', etiqueta: 'Ofrecé tus paseos', icono: 'paw', onPress: ir('/paseadores/registro'), variante: 'contorno' },
      { clave: 'entrar', etiqueta: 'Iniciar sesión', icono: 'user', onPress: ir('/login'), variante: 'lleno' }
    );
  }

  const ejecutar = (accion: Accion) => {
    setMenuAbierto(false);
    void accion.onPress();
  };

  return (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: entrada,
          transform: [
            { translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.fila}>
        <Pressable
          onPress={() => router.navigate('/')}
          accessibilityRole="link"
          accessibilityLabel="WalkPets, ir al inicio"
          style={styles.marca}
        >
          <View style={styles.marcaIcono}>
            <FontAwesome name="paw" size={16} color={colors.verdeOscuro} />
          </View>
          <View>
            <Text style={styles.marcaTitulo}>WalkPets</Text>
            <Text style={styles.marcaSubtitulo}>CIPOLLETTI · NEUQUÉN</Text>
          </View>
        </Pressable>

        {esAncho ? (
          <View style={styles.acciones}>
            {sesion && (
              <Text style={styles.saludo} numberOfLines={1}>
                Hola, {sesion.usuario.nombre}
              </Text>
            )}
            {acciones.map((accion) => (
              <BotonHeader
                key={accion.clave}
                accion={accion}
                activo={accion.clave === 'quienes' && quienesActivo}
                onPress={() => ejecutar(accion)}
              />
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => setMenuAbierto((abierto) => !abierto)}
            style={styles.hamburguesa}
            accessibilityRole="button"
            accessibilityLabel={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            accessibilityState={{ expanded: menuAbierto }}
          >
            <Entypo name={menuAbierto ? 'cross' : 'menu'} size={26} color={colors.blanco} />
          </Pressable>
        )}
      </View>

      {!esAncho && menuAbierto && (
        <Animated.View
          style={[
            styles.menuMovil,
            {
              opacity: menu,
              transform: [
                { translateY: menu.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
              ],
            },
          ]}
        >
          {sesion && <Text style={styles.saludoMovil}>Hola, {sesion.usuario.nombre} 👋</Text>}
          {acciones.map((accion) => (
            <Pressable
              key={accion.clave}
              onPress={() => ejecutar(accion)}
              style={({ pressed }) => [styles.itemMovil, pressed && styles.itemMovilPresionado]}
              accessibilityRole="button"
              accessibilityLabel={accion.etiqueta}
            >
              <FontAwesome name={accion.icono} size={15} color={colors.verdeMenta} style={styles.itemIcono} />
              <Text style={styles.itemMovilTexto}>{accion.etiqueta}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

// Botón del header ancho: subrayado animado al pasar el mouse (web) o activo.
function BotonHeader({
  accion,
  activo,
  onPress,
}: {
  accion: Accion;
  activo: boolean;
  onPress: () => void;
}) {
  const [hover, setHover] = useState(false);
  const subrayado = useRef(new Animated.Value(0)).current;
  const variante = accion.variante ?? 'link';

  useEffect(() => {
    Animated.timing(subrayado, {
      toValue: hover || activo ? 1 : 0,
      duration: 180,
      useNativeDriver: usarDriverNativo,
    }).start();
  }, [subrayado, hover, activo]);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityRole="button"
      accessibilityLabel={accion.etiqueta}
      accessibilityState={{ selected: activo }}
      style={({ pressed }) => [
        styles.boton,
        variante === 'contorno' && styles.botonContorno,
        variante === 'lleno' && styles.botonLleno,
        variante !== 'link' && hover && styles.botonHover,
        pressed && styles.botonPresionado,
      ]}
    >
      <Text style={[styles.botonTexto, variante === 'lleno' && styles.botonTextoLleno]}>
        {accion.etiqueta}
      </Text>
      {variante === 'link' && (
        <Animated.View style={[styles.subrayado, { transform: [{ scaleX: subrayado }] }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.verdeOscuro,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : Platform.OS === 'android' ? 38 : spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.blancoLinea,
    zIndex: 10,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  marcaIcono: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.verdeMenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaTitulo: {
    fontSize: fonts.sizes.lg + 2,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.subtitulo,
    color: colors.blanco,
  },
  marcaSubtitulo: {
    fontSize: 9,
    fontWeight: fonts.pesos.semi,
    letterSpacing: 2,
    color: colors.blancoSuave,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  saludo: {
    color: colors.verdeMenta,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.medio,
    marginRight: spacing.sm,
    maxWidth: 160,
  },
  boton: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  botonContorno: {
    borderColor: colors.blancoSuave,
  },
  botonLleno: {
    backgroundColor: colors.blanco,
    borderColor: colors.blanco,
  },
  botonHover: {
    transform: [{ translateY: -1 }],
  },
  botonPresionado: {
    opacity: 0.75,
  },
  botonTexto: {
    color: colors.blanco,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
  },
  botonTextoLleno: {
    color: colors.verdeOscuro,
  },
  subrayado: {
    position: 'absolute',
    left: spacing.md - 2,
    right: spacing.md - 2,
    bottom: 4,
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.verdeMenta,
  },
  hamburguesa: {
    padding: spacing.xs,
  },
  menuMovil: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.blancoLinea,
  },
  saludoMovil: {
    color: colors.verdeMenta,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.medio,
    paddingVertical: spacing.xs,
  },
  itemMovil: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  itemMovilPresionado: {
    backgroundColor: colors.blancoVelo,
  },
  itemIcono: {
    width: 22,
  },
  itemMovilTexto: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.medio,
  },
});

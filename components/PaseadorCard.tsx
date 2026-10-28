import { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '../src/constants/theme';
import { Paseador } from '../src/types/paseador';

// ============================================================================
// COMPONENTE: PaseadorCard
// Propósito: Tarjeta individual para mostrar el resumen de un paseador en las
// listas de búsqueda. Jerarquiza nombre, ubicación, calificación y precio, y
// muestra la disponibilidad como badge sobre la foto. Incorpora una elevación
// suave al hacer hover en web.
// ============================================================================

const FOTO_FALLBACK =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

type Props = {
  paseador: Paseador; // Objeto con todos los datos del paseador
  onPress: () => void; // Función al tocar o hacer clic en la tarjeta (navegación)
};

export function PaseadorCard({ paseador, onPress }: Props) {
  // Estado local para rastrear si el cursor (ratón) está sobre la tarjeta (solo web)
  const [isHovered, setIsHovered] = useState(false);
  const nombreCompleto = `${paseador.nombre} ${paseador.apellido}`;

  return (
    <TouchableOpacity
      style={[styles.card, isHovered && styles.cardHovered]}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`${nombreCompleto}, ${paseador.barrio}, ${paseador.ciudad}. ${
        paseador.disponible ? 'Disponible hoy' : 'No disponible'
      }. ${paseador.calificacion.toFixed(1)} estrellas, ${
        paseador.cantidadResenas
      } reseñas. $${paseador.precioHora} por hora.`}
      accessibilityHint="Abre el perfil del paseador"
      // Eventos de ratón inyectados para detectar hover en plataformas web
      {...({
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as Record<string, unknown>)}
    >
      {/* 1. FOTO CON BADGE DE DISPONIBILIDAD */}
      <View style={styles.fotoWrapper}>
        <Image
          source={{ uri: paseador.foto || FOTO_FALLBACK }}
          style={styles.foto}
          accessibilityIgnoresInvertColors
        />
        <View
          style={[
            styles.estadoBadge,
            paseador.disponible ? styles.badgeDisponible : styles.badgeNoDisponible,
          ]}
        >
          <View
            style={[
              styles.estadoDot,
              paseador.disponible ? styles.dotDisponible : styles.dotNoDisponible,
            ]}
          />
          <Text
            style={[
              styles.estadoTexto,
              paseador.disponible ? styles.estadoDisp : styles.estadoNoDis,
            ]}
          >
            {paseador.disponible ? 'Disponible hoy' : 'No disponible'}
          </Text>
        </View>
      </View>

      {/* 2. INFORMACIÓN */}
      <View style={styles.info}>
        {/* Nombre completo del paseador (máximo 2 líneas) */}
        <Text style={styles.nombre} numberOfLines={2}>
          <Text style={styles.nombrePrefijo}>Paseador </Text>
          {paseador.nombre} {paseador.apellido}
        </Text>

        {/* Barrio y ciudad del paseador (hasta 2 líneas para no truncar la ciudad) */}
        <Text style={styles.barrio} numberOfLines={2}>
          📍 {paseador.barrio}, {paseador.ciudad}
        </Text>

        {/* Calificación en estrellas y cantidad total de reseñas */}
        <View style={styles.calificacionFila}>
          <Text style={styles.estrellas}>
            ★ {paseador.calificacion.toFixed(1)}
          </Text>
          <Text style={styles.calificacionTexto}>({paseador.cantidadResenas})</Text>
        </View>

        {/* Precio por hora, formato moneda Argentina */}
        <View style={styles.precioFila}>
          <Text style={styles.precio}>
            $ {paseador.precioHora.toLocaleString('es-AR')}
          </Text>
          <Text style={styles.precioUnidad}>/ hora</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.grisClaro,
    ...shadows.card,
    // Transición CSS suave al hacer hover (solo web)
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } : null),
  } as any,
  // Estilo aplicado dinámicamente cuando isHovered es true
  cardHovered: {
    ...shadows.elevada,
    borderColor: colors.verdeMenta,
    transform: [{ translateY: -3 }],
  },
  fotoWrapper: {
    position: 'relative',
  },
  foto: {
    width: '100%',
    aspectRatio: 4 / 3,
    resizeMode: 'cover',
    backgroundColor: colors.grisClaro,
  },
  estadoBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    ...shadows.card,
  },
  badgeDisponible: {
    backgroundColor: colors.blanco,
  },
  badgeNoDisponible: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  estadoDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  dotDisponible: {
    backgroundColor: colors.verde,
  },
  dotNoDisponible: {
    backgroundColor: colors.grisMedio,
  },
  info: {
    padding: spacing.md - 2,
    gap: 5,
  },
  nombre: {
    fontSize: fonts.sizes.md,
    color: colors.negro,
    fontWeight: '700',
    lineHeight: 20,
  },
  nombrePrefijo: {
    color: colors.grisOscuro,
    fontWeight: '600',
  },
  barrio: {
    fontSize: fonts.sizes.xs + 1,
    color: colors.grisOscuro,
  },
  calificacionFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estrellas: {
    fontSize: fonts.sizes.sm,
    color: colors.naranja,
    fontWeight: '700',
  },
  calificacionTexto: {
    fontSize: fonts.sizes.xs,
    color: colors.grisOscuro,
  },
  precioFila: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.grisClaro,
  },
  precio: {
    fontSize: fonts.sizes.lg,
    fontWeight: '800',
    color: colors.verdeOscuro,
  },
  precioUnidad: {
    fontSize: fonts.sizes.xs,
    color: colors.grisOscuro,
    fontWeight: '600',
  },
  estadoTexto: {
    fontSize: fonts.sizes.xs,
    fontWeight: '700',
  },
  estadoDisp: {
    color: colors.verde,
  },
  estadoNoDis: {
    color: colors.grisOscuro,
  },
});

import { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { Paseador } from '../types/paseador';

// ============================================================================
// COMPONENTE: PaseadorCard
// Propósito: Tarjeta individual para mostrar el resumen de un paseador en las
// listas de búsqueda. Su diseño está fuertemente inspirado en las tarjetas de
// productos de MercadoLibre (foto cuadrada arriba, precio grande y badge verde).
// Además, incorpora animación de elevación (sombra/transform) al hacer hover en web.
// ============================================================================

type Props = {
  paseador: Paseador; // Objeto con todos los datos del paseador
  onPress: () => void; // Función al tocar o hacer clic en la tarjeta (navegación)
};

export function PaseadorCard({ paseador, onPress }: Props) {
  // Estado local para rastrear si el cursor (ratón) está sobre la tarjeta (solo web/escritorio)
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, isHovered && styles.cardHovered]}
      onPress={onPress}
      activeOpacity={0.95}
      // Eventos de ratón inyectados para detectar hover en plataformas web
      {...({
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as any)}
    >
      {/* 1. FOTO ARRIBA (Relación de aspecto 1:1 para ser completamente cuadrada) */}
      <Image
        source={{ uri: paseador.foto || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
        style={styles.foto}
      />

      {/* 2. INFORMACIÓN DEBAJO */}
      <View style={styles.info}>
        {/* Precio por hora grande y destacado, formato moneda Argentina */}
        <Text style={styles.precio}>
          $ {paseador.precioHora.toLocaleString('es-AR')}
        </Text>

        {/* Indicador de disponibilidad: verde si está disponible, gris si no */}
        <Text style={[styles.estadoTexto, paseador.disponible ? styles.estadoDisp : styles.estadoNoDis]}>
          {paseador.disponible ? 'Disponible hoy' : 'No disponible'}
        </Text>

        {/* Nombre completo del paseador (máximo 2 líneas antes de poner puntos suspensivos) */}
        <Text style={styles.nombre} numberOfLines={2}>
          Paseador {paseador.nombre} {paseador.apellido}
        </Text>

        {/* Calificación en estrellas y cantidad total de reseñas */}
        <View style={styles.calificacionFila}>
          <Text style={styles.estrellas}>★ {paseador.calificacion.toFixed(1)}</Text>
          <Text style={styles.calificacionTexto}>({paseador.cantidadResenas})</Text>
        </View>

        {/* Barrio del paseador */}
        <Text style={styles.barrio}>📍 {paseador.barrio}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderRadius: radius.md,
    flexDirection: 'column', // Orientación vertical estilo MercadoLibre
    flex: 1, // Permite que se distribuya equitativamente en la grilla
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Sombra suave en Android
    transition: 'all 0.2s ease', // Transición CSS suave al hacer hover en web
  } as any,
  // Estilo aplicado dinámicamente cuando isHovered es true
  cardHovered: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: -2 }], // Se eleva ligeramente hacia arriba
  },
  foto: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover'
  },
  info: {
    padding: spacing.md,
    gap: 4
  },
  precio: {
    fontSize: fonts.sizes.xl,
    fontWeight: '400',
    color: colors.negro
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: '600'
  },
  estadoDisp: {
    color: '#00a650' // Verde exacto característico de MercadoLibre
  },
  estadoNoDis: {
    color: colors.grisOscuro
  },
  nombre: {
    fontSize: 13,
    color: colors.grisOscuro,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 18,
  },
  calificacionFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  estrellas: {
    fontSize: 12,
    color: '#00a650',
    fontWeight: '600',
  },
  calificacionTexto: {
    fontSize: 11,
    color: colors.grisMedio
  },
  barrio: {
    fontSize: 11,
    color: colors.grisMedio,
    marginTop: 2,
  },
});

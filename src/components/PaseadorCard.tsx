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

type Props = {
  paseador: Paseador;
  onPress: () => void;
};

export function PaseadorCard({ paseador, onPress }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, isHovered && styles.cardHovered]}
      onPress={onPress}
      activeOpacity={0.95}
      {...({
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } as any)}
    >
      {/* 1. FOTO ARRIBA (Ancho completo) */}
      <Image
        source={{ uri: paseador.foto || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
        style={styles.foto}
      />

      {/* 2. INFORMACIÓN DEBAJO */}
      <View style={styles.info}>
        {/* Precio grande como en ML */}
        <Text style={styles.precio}>
          $ {paseador.precioHora.toLocaleString('es-AR')}
        </Text>

        {/* Texto destacado verde estilo "Llega gratis" de ML */}
        <Text style={[styles.estadoTexto, paseador.disponible ? styles.estadoDisp : styles.estadoNoDis]}>
          {paseador.disponible ? 'Disponible hoy' : 'No disponible'}
        </Text>

        {/* Nombre del paseador como título del producto */}
        <Text style={styles.nombre} numberOfLines={2}>
          Paseador {paseador.nombre} {paseador.apellido}
        </Text>

        {/* Estrellas y reseñas */}
        <View style={styles.calificacionFila}>
          <Text style={styles.estrellas}>★ {paseador.calificacion.toFixed(1)}</Text>
          <Text style={styles.calificacionTexto}>({paseador.cantidadResenas})</Text>
        </View>

        {/* Ubicación chiquita */}
        <Text style={styles.barrio}>📍 {paseador.barrio}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderRadius: radius.md,
    flexDirection: 'column', // Orientación vertical ML
    flex: 1, // Para que ocupe la mitad en el grid (numColumns={2})
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Sombra suave de ML
    transition: 'all 0.2s ease', // Transición suave en web
  } as any,
  cardHovered: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: -2 }],
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
    color: '#00a650' // Verde exacto de MercadoLibre
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
    color: '#00a650', // A veces ML usa verde para reseñas, o dejamos el color default
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

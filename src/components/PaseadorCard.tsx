import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '../constants/theme';
import { Paseador } from '../types/paseador';

type Props = {
  paseador: Paseador;
  onPress: () => void;
};

export function PaseadorCard({ paseador, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <Image source={{ uri: paseador.foto }} style={styles.foto} />

      <View style={styles.info}>
        <View style={styles.encabezado}>
          <Text style={styles.nombre}>
            {paseador.nombre} {paseador.apellido}
          </Text>
          <View style={[styles.badge, paseador.disponible ? styles.badgeDisp : styles.badgeNoDis]}>
            <Text style={[styles.badgeTexto, paseador.disponible ? styles.badgeTextoDisp : styles.badgeTextoNoDis]}>
              {paseador.disponible ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
        </View>

        <Text style={styles.barrio}>📍 {paseador.barrio}</Text>

        <View style={styles.calificacionFila}>
          <Text style={styles.estrellas}>
            {'★'.repeat(Math.round(paseador.calificacion))}
            {'☆'.repeat(5 - Math.round(paseador.calificacion))}
          </Text>
          <Text style={styles.calificacionTexto}>
            {paseador.calificacion.toFixed(1)} · {paseador.cantidadResenas} reseñas
          </Text>
        </View>

        <View style={styles.pie}>
          <Text style={styles.precio}>
            ${paseador.precioHora.toLocaleString('es-AR')}
            <Text style={styles.precioSufijo}>/hora</Text>
          </Text>
          <Text style={styles.verMas}>Ver perfil →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  foto: { width: 100, height: 110, resizeMode: 'cover' },
  info: { flex: 1, padding: spacing.md, gap: spacing.xs },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nombre: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.negro, flex: 1, marginRight: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeDisp: { backgroundColor: colors.verdePastel },
  badgeNoDis: { backgroundColor: colors.grisClaro },
  badgeTexto: { fontSize: fonts.sizes.xs, fontWeight: '600' },
  badgeTextoDisp: { color: colors.verde },
  badgeTextoNoDis: { color: colors.grisOscuro },
  barrio: { fontSize: fonts.sizes.sm, color: colors.grisOscuro },
  calificacionFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  estrellas: { fontSize: fonts.sizes.sm, color: colors.naranja },
  calificacionTexto: { fontSize: fonts.sizes.xs, color: colors.grisOscuro },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  precio: { fontSize: fonts.sizes.md, fontWeight: '700', color: colors.verde },
  precioSufijo: { fontSize: fonts.sizes.xs, fontWeight: '400', color: colors.grisOscuro },
  verMas: { fontSize: fonts.sizes.sm, color: colors.verdeClaro, fontWeight: '600' },
});

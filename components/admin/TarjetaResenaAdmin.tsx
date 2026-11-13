import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '../../src/constants/theme';
import { ResenaAdmin } from '../../src/types/admin';
import { StarRating } from '../StarRating';
import { ConfirmarAccion } from './ConfirmarAccion';

type Props = {
  resena: ResenaAdmin;
  enCurso: boolean;
  onEliminar: () => void;
};

export function TarjetaResenaAdmin({ resena, enCurso, onEliminar }: Props) {
  return (
    <View style={styles.tarjeta} accessibilityLabel={`Reseña de ${resena.autorNombre}`}>
      <View style={styles.encabezado}>
        <Text style={styles.paseador}>Para {resena.paseadorNombre || 'paseador eliminado'}</Text>
        <Text style={styles.fecha}>{resena.fecha}</Text>
      </View>
      <StarRating calificacion={resena.calificacion} />
      <Text style={styles.texto}>“{resena.texto}”</Text>
      <Text style={styles.autor}>
        {resena.autorNombre} · {resena.mascota}
      </Text>
      <View style={styles.acciones}>
        <ConfirmarAccion
          etiqueta="Eliminar reseña"
          accessibilityLabel={`Eliminar la reseña de ${resena.autorNombre}`}
          pregunta="La reseña se borra y se recalcula el promedio del paseador. No se puede deshacer."
          confirmar="Eliminar definitivamente"
          onConfirmar={onEliminar}
          cargando={enCurso}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    ...shadows.card,
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  paseador: {
    flexShrink: 1,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  fecha: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  texto: {
    fontSize: fonts.sizes.md,
    color: colors.negro,
  },
  autor: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  acciones: {
    flexDirection: 'row',
  },
});

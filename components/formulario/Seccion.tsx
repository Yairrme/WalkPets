import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { Aparecer } from '../Aparecer';

// Tarjeta de una sección de formulario, con número opcional y animación de entrada.

type Props = {
  titulo: string;
  numero?: number;
  descripcion?: string;
  retraso?: number;
  children: ReactNode;
};

export function Seccion({ titulo, numero, descripcion, retraso = 0, children }: Props) {
  return (
    <Aparecer retraso={retraso} style={styles.tarjeta}>
      <View style={styles.encabezado}>
        {numero !== undefined && (
          <View style={styles.numero}>
            <Text style={styles.numeroTexto}>{numero}</Text>
          </View>
        )}
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
      {descripcion && <Text style={styles.descripcion}>{descripcion}</Text>}
      {children}
    </Aparecer>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.blanco,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.linea,
    padding: spacing.lg,
    gap: spacing.md,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  numero: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.verdePastel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
  },
  titulo: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.subtitulo,
    color: colors.negro,
  },
  descripcion: {
    marginTop: -spacing.sm,
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    lineHeight: 19,
  },
});

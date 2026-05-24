import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import { AppButton } from './AppButton';

type Props = {
  tipo: 'vacio' | 'error' | 'cargando';
  mensaje?: string;
  onReintentar?: () => void;
};

const CONFIG = {
  vacio: {
    icono: '🐾',
    titulo: 'Sin paseadores disponibles',
    mensajePredeterminado: 'No encontramos paseadores en tu zona por el momento.',
  },
  error: {
    icono: '⚠️',
    titulo: 'Algo salió mal',
    mensajePredeterminado: 'No pudimos cargar los paseadores. Revisá tu conexión.',
  },
  cargando: {
    icono: '🐕',
    titulo: 'Buscando paseadores...',
    mensajePredeterminado: 'Estamos encontrando los mejores paseadores para vos.',
  },
};

export function EmptyState({ tipo, mensaje, onReintentar }: Props) {
  const config = CONFIG[tipo];
  return (
    <View style={styles.contenedor}>
      <Text style={styles.icono}>{config.icono}</Text>
      <Text style={styles.titulo}>{config.titulo}</Text>
      <Text style={styles.mensaje}>{mensaje ?? config.mensajePredeterminado}</Text>
      {tipo === 'error' && onReintentar && (
        <AppButton label="Reintentar" onPress={onReintentar} variante="outline" style={styles.boton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.crema,
  },
  icono: { fontSize: 64, marginBottom: spacing.sm },
  titulo: { fontSize: fonts.sizes.lg, fontWeight: '700', color: colors.negro, textAlign: 'center' },
  mensaje: { fontSize: fonts.sizes.md, color: colors.grisOscuro, textAlign: 'center', lineHeight: 22 },
  boton: { marginTop: spacing.md, paddingHorizontal: spacing.xl },
});

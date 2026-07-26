import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import { AppButton } from './AppButton';

// ============================================================================
// COMPONENTE: EmptyState
// Propósito: Mostrar pantallas de estado informativo cuando no hay datos (vacio),
// cuando ocurre un fallo en la red/servidor (error) o cuando se está buscando
// información (cargando).
// ============================================================================

type Props = {
  tipo: 'vacio' | 'error' | 'cargando'; // Tipo de estado a representar
  mensaje?: string; // Mensaje opcional para sobrescribir el texto por defecto
  onReintentar?: () => void; // Acción para volver a intentar (usado en 'error')
};

// Diccionario de configuración con íconos y textos por defecto para cada estado
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
  // Extraemos la configuración correspondiente al tipo solicitado
  const config = CONFIG[tipo];

  return (
    <View style={styles.contenedor}>
      {/* Ícono gigante (emoji) representativo del estado */}
      <Text style={styles.icono}>{config.icono}</Text>

      {/* Título principal del estado */}
      <Text style={styles.titulo}>{config.titulo}</Text>

      {/* Mensaje descriptivo (usa el personalizado si existe, o el por defecto) */}
      <Text style={styles.mensaje}>{mensaje ?? config.mensajePredeterminado}</Text>

      {/* Si el estado es de error y se proporcionó una función onReintentar, muestra un botón */}
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

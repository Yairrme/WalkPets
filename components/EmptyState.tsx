import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { AppButton } from './AppButton';

// ============================================================================
// COMPONENTE: EmptyState
// Propósito: Mostrar pantallas de estado informativo cuando no hay datos (vacio),
// cuando ocurre un fallo en la red/servidor (error) o cuando se está buscando
// información (cargando).
// ============================================================================

type Props = {
  tipo: 'vacio' | 'error' | 'cargando'; // Tipo de estado a representar
  titulo?: string; // Título opcional para sobrescribir el texto por defecto
  mensaje?: string; // Mensaje opcional para sobrescribir el texto por defecto
  onReintentar?: () => void; // Acción para volver a intentar (usado en 'error')
};

// Diccionario de configuración con íconos, textos y colores por estado
const CONFIG = {
  vacio: {
    icono: '🐾',
    titulo: 'Sin paseadores disponibles',
    mensajePredeterminado: 'No encontramos paseadores en tu zona por el momento.',
    fondoIcono: colors.verdePastel,
    bordeIcono: colors.verdeMenta,
  },
  error: {
    icono: '⚠️',
    titulo: 'Algo salió mal',
    mensajePredeterminado: 'No pudimos cargar los paseadores. Revisá tu conexión.',
    fondoIcono: colors.errorClaro,
    bordeIcono: colors.naranjaClaro,
  },
  cargando: {
    icono: '🐕',
    titulo: 'Buscando paseadores...',
    mensajePredeterminado: 'Estamos encontrando los mejores paseadores para vos.',
    fondoIcono: colors.verdePastel,
    bordeIcono: colors.verdeMenta,
  },
};

export function EmptyState({ tipo, titulo, mensaje, onReintentar }: Props) {
  // Extraemos la configuración correspondiente al tipo solicitado
  const config = CONFIG[tipo];

  return (
    <View style={styles.contenedor}>
      {/* Ícono en un círculo con el color del estado */}
      <View
        style={[
          styles.iconoCirculo,
          { backgroundColor: config.fondoIcono, borderColor: config.bordeIcono },
        ]}
      >
        <Text style={styles.icono}>{config.icono}</Text>
      </View>

      {/* Título principal del estado */}
      <Text style={styles.titulo}>{titulo ?? config.titulo}</Text>

      {/* Mensaje descriptivo (usa el personalizado si existe, o el por defecto) */}
      <Text style={styles.mensaje}>{mensaje ?? config.mensajePredeterminado}</Text>

      {/* Si el estado es de error y se proporcionó una función onReintentar, muestra un botón */}
      {tipo === 'error' && onReintentar && (
        <AppButton
          label="Reintentar"
          onPress={onReintentar}
          variante="outline"
          style={styles.boton}
          accessibilityHint="Vuelve a intentar cargar la información"
        />
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
    gap: spacing.sm,
    backgroundColor: colors.crema,
  },
  iconoCirculo: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icono: { fontSize: 38 },
  titulo: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.subtitulo,
    color: colors.negro,
    textAlign: 'center',
  },
  mensaje: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
  boton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 200,
  },
});

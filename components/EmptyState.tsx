import { FontAwesome } from '@expo/vector-icons';
import React, { ComponentProps } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
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

type Config = {
  icono: ComponentProps<typeof FontAwesome>['name'] | null; // null = spinner
  colorIcono: string;
  titulo: string;
  mensajePredeterminado: string;
  fondoIcono: string;
  bordeIcono: string;
};

// Diccionario de configuración con íconos, textos y colores por estado
const CONFIG: Record<Props['tipo'], Config> = {
  vacio: {
    icono: 'paw',
    colorIcono: colors.verde,
    titulo: 'Sin paseadores disponibles',
    mensajePredeterminado: 'No encontramos paseadores en tu zona por el momento.',
    fondoIcono: colors.verdePastel,
    bordeIcono: colors.verdeMenta,
  },
  error: {
    icono: 'exclamation-triangle',
    colorIcono: colors.naranjaTexto,
    titulo: 'Algo salió mal',
    mensajePredeterminado: 'No pudimos cargar los paseadores. Revisá tu conexión.',
    fondoIcono: colors.errorClaro,
    bordeIcono: colors.naranjaClaro,
  },
  cargando: {
    icono: null,
    colorIcono: colors.verde,
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
        {config.icono ? (
          <FontAwesome name={config.icono} size={32} color={config.colorIcono} />
        ) : (
          <ActivityIndicator size="large" color={config.colorIcono} />
        )}
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
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

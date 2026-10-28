import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../src/constants/theme';

// ============================================================================
// COMPONENTE: StarRating
// Propósito: Renderizar una fila de 5 estrellas visuales en función de una
// calificación numérica (por ejemplo, 4.8), con soporte para 3 tamaños distintos
// ('sm', 'md', 'lg') y mostrar u ocultar el valor numérico al lado.
// ============================================================================

type Props = {
  calificacion: number; // Valor numérico del rating (ej. 4.5)
  mostrarNumero?: boolean; // Si es true, imprime el texto "4.5" junto a las estrellas
  tamano?: 'sm' | 'md' | 'lg'; // Tamaño del ícono y del texto
};

// Mapeo de tamaños en píxeles (fuente y alto de línea) según la prop 'tamano'
const TAMANOS = {
  sm: { fuente: 12, linea: 16 },
  md: { fuente: 16, linea: 20 },
  lg: { fuente: 22, linea: 28 },
};

export function StarRating({ calificacion, mostrarNumero = true, tamano = 'md' }: Props) {
  // Normalizamos el valor al rango 0–5 para evitar estrellas de más o de menos
  const valor = Math.max(0, Math.min(5, calificacion));
  // Redondeamos para saber cuántas estrellas encender (ej: 4.7 -> 5 estrellas activas)
  const redondeado = Math.round(valor);
  const medida = TAMANOS[tamano];

  return (
    <View
      style={styles.fila}
      accessibilityRole="text"
      accessibilityLabel={`Calificación ${valor.toFixed(1)} de 5`}
    >
      {/* Generamos un arreglo del 1 al 5 y mapeamos cada estrella */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[
            styles.estrella,
            { fontSize: medida.fuente, lineHeight: medida.linea },
            // Si el índice de la estrella es menor o igual al redondeo, se tiñe de naranja
            i <= redondeado ? styles.activa : styles.inactiva,
          ]}
        >
          ★
        </Text>
      ))}

      {/* Si se solicita, mostramos el número exacto con 1 decimal (ej. "4.8") */}
      {mostrarNumero && (
        <Text
          style={[
            styles.numero,
            { fontSize: medida.fuente - 2, lineHeight: medida.linea },
          ]}
        >
          {valor.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  estrella: {
    fontWeight: '600',
  },
  activa: {
    color: colors.naranja, // Color de estrella encendida
  },
  inactiva: {
    color: colors.grisMedio, // Color de estrella apagada / vacía
  },
  numero: {
    color: colors.grisOscuro,
    fontWeight: '700',
    marginLeft: 4,
  },
});

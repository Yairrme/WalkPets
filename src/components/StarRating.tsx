import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../constants/theme';

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

export function StarRating({ calificacion, mostrarNumero = true, tamano = 'md' }: Props) {
  // Redondeamos para saber cuántas estrellas encender (ej: 4.8 -> 5 estrellas activas)
  const redondeado = Math.round(calificacion);
  
  // Mapeo de tamaños en píxeles para las estrellas según la prop 'tamano'
  const tamanos = { sm: 12, md: 16, lg: 22 };

  return (
    <View style={styles.fila}>
      {/* Generamos un arreglo del 1 al 5 y mapeamos cada estrella */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[
            styles.estrella,
            { fontSize: tamanos[tamano] },
            // Si el índice de la estrella es menor o igual al redondeo, se tiñe de naranja
            i <= redondeado ? styles.activa : styles.inactiva,
          ]}
        >
          ★
        </Text>
      ))}

      {/* Si se solicita, mostramos el número exacto con 1 decimal (ej. "4.8") */}
      {mostrarNumero && (
        <Text style={[styles.numero, { fontSize: tamanos[tamano] - 2 }]}>
          {calificacion.toFixed(1)}
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
    lineHeight: 24,
  },
  activa: {
    color: colors.naranja, // Color de estrella encendida
  },
  inactiva: {
    color: colors.grisMedio, // Color de estrella apagada / vacía
  },
  numero: {
    color: colors.grisOscuro,
    fontWeight: '600',
    marginLeft: 4,
  },
});

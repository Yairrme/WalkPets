import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../constants/theme';

type Props = {
  calificacion: number;
  mostrarNumero?: boolean;
  tamano?: 'sm' | 'md' | 'lg';
};

export function StarRating({ calificacion, mostrarNumero = true, tamano = 'md' }: Props) {
  const redondeado = Math.round(calificacion);
  const tamanos = { sm: 12, md: 16, lg: 22 };

  return (
    <View style={styles.fila}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          style={[
            styles.estrella,
            { fontSize: tamanos[tamano] },
            i <= redondeado ? styles.activa : styles.inactiva,
          ]}
        >
          ★
        </Text>
      ))}
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
    color: colors.naranja,
  },
  inactiva: {
    color: colors.grisMedio,
  },
  numero: {
    color: colors.grisOscuro,
    fontWeight: '600',
    marginLeft: 4,
  },
});

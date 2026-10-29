import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { Aparecer } from './Aparecer';

// Filtro compacto: una píldora que muestra el valor actual y, al tocarla,
// abre un menú con las opciones. Ocupa una sola línea en la barra de filtros.

export type OpcionFiltro<T> = { valor: T; etiqueta: string };

type Props<T> = {
  titulo: string; // "Ciudad", "Barrio", "Ordenar"
  valor: T;
  opciones: OpcionFiltro<T>[];
  onCambiar: (valor: T) => void;
  activo?: boolean; // resalta la píldora cuando el filtro está aplicado
  deshabilitado?: boolean;
};

export function FiltroDesplegable<T extends string | null>({
  titulo,
  valor,
  opciones,
  onCambiar,
  activo = false,
  deshabilitado = false,
}: Props<T>) {
  const [abierto, setAbierto] = useState(false);
  const actual = opciones.find((o) => o.valor === valor);

  const elegir = (nuevo: T) => {
    setAbierto(false);
    onCambiar(nuevo);
  };

  return (
    <>
      <Pressable
        onPress={() => setAbierto(true)}
        disabled={deshabilitado}
        style={({ pressed }) => [
          styles.pildora,
          activo && styles.pildoraActiva,
          deshabilitado && styles.pildoraDeshabilitada,
          pressed && styles.presionada,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${titulo}: ${actual?.etiqueta ?? ''}`}
        accessibilityHint="Abre las opciones del filtro"
        accessibilityState={{ disabled: deshabilitado, expanded: abierto }}
      >
        <Text style={[styles.pildoraTexto, activo && styles.pildoraTextoActiva]} numberOfLines={1}>
          {activo ? actual?.etiqueta : titulo}
        </Text>
        <FontAwesome name="angle-down" size={14} color={activo ? colors.blanco : colors.grisOscuro} />
      </Pressable>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.fondo} onPress={() => setAbierto(false)} accessibilityLabel="Cerrar">
          <Aparecer distancia={24} style={styles.hojaContenedor}>
            <Pressable style={styles.hoja} onPress={() => undefined}>
              <Text style={styles.hojaTitulo}>{titulo}</Text>
              {opciones.map((opcion) => {
                const elegida = opcion.valor === valor;
                return (
                  <Pressable
                    key={String(opcion.valor)}
                    onPress={() => elegir(opcion.valor)}
                    style={({ pressed }) => [styles.opcion, pressed && styles.opcionPresionada]}
                    accessibilityRole="button"
                    accessibilityLabel={`${titulo} ${opcion.etiqueta}`}
                    accessibilityState={{ selected: elegida }}
                  >
                    <Text style={[styles.opcionTexto, elegida && styles.opcionTextoElegida]}>
                      {opcion.etiqueta}
                    </Text>
                    {elegida && <FontAwesome name="check" size={14} color={colors.verde} />}
                  </Pressable>
                );
              })}
            </Pressable>
          </Aparecer>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pildora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    maxWidth: 190,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.lineaFuerte,
    backgroundColor: colors.blanco,
  },
  pildoraActiva: {
    backgroundColor: colors.verdeOscuro,
    borderColor: colors.verdeOscuro,
  },
  pildoraDeshabilitada: {
    opacity: 0.45,
  },
  presionada: {
    opacity: 0.75,
  },
  pildoraTexto: {
    flexShrink: 1,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.medio,
    color: colors.negro,
  },
  pildoraTextoActiva: {
    color: colors.blanco,
  },
  fondo: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.lineaFuerte,
  },
  hojaContenedor: {
    width: '100%',
    maxWidth: 480,
  },
  hoja: {
    backgroundColor: colors.blanco,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: 2,
  },
  hojaTitulo: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.subtitulo,
    color: colors.verdeOscuro,
    marginBottom: spacing.sm,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  opcionPresionada: {
    backgroundColor: colors.grisClaro,
  },
  opcionTexto: {
    fontSize: fonts.sizes.md,
    color: colors.negro,
  },
  opcionTextoElegida: {
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
  },
});

// Contenedor horizontal para alinear varias píldoras en una línea.
export function FilaFiltrosCompacta({ children }: { children: React.ReactNode }) {
  return <View style={filaEstilos.fila}>{children}</View>;
}

const filaEstilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

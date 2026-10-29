import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { Aparecer } from '../../components/Aparecer';
import { EmptyState } from '../../components/EmptyState';
import { FiltroDesplegable } from '../../components/FiltroDesplegable';
import { PaseadorCard } from '../../components/PaseadorCard';
import { CIUDADES } from '../../src/constants/ciudades';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { useListadoPaseadores } from '../../src/hooks/useListadoPaseadores';
import { Paseador } from '../../src/types/paseador';
import { ORDENES } from '../../src/utils/filtrosPaseadores';

// Celda vacía que completa la última fila de la grilla. Sin ella, una tarjeta
// sola en la última fila se estiraba a todo el ancho.
type Celda = Paseador | { id: string; relleno: true };

function completarGrilla(items: Paseador[], columnas: number): Celda[] {
  const faltan = (columnas - (items.length % columnas)) % columnas;
  const relleno = Array.from({ length: faltan }, (_, i) => ({ id: `relleno-${i}`, relleno: true as const }));
  return [...items, ...relleno];
}

export default function ListaPaseadores() {
  const { width } = useWindowDimensions();
  // Diseño responsivo: 4 columnas en PC grandes, 3 en tablets, 2 en móviles
  const columnas = width >= 1100 ? 4 : width >= 768 ? 3 : 2;

  const {
    estado,
    paseadores,
    filtrados,
    barrios,
    filtros,
    filtrosActivos,
    cargar,
    seleccionarCiudad,
    elegirBarrio,
    alternarDisponibles,
    ordenar,
    limpiar,
  } = useListadoPaseadores();

  const resumenFiltros = () => {
    const ciudad = filtros.ciudad ? ` en ${filtros.ciudad}` : '';
    const filtrado = filtrosActivos ? ' (filtrado)' : '';
    return `${filtrados.length} de ${paseadores.length} paseadores${ciudad}${filtrado}`;
  };

  if (estado === 'cargando') {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={colors.verde} />
        <Text style={styles.cargandoTexto}>Buscando paseadores...</Text>
        <Text style={styles.cargandoSubtexto}>
          Estamos buscando los mejores paseadores para vos.
        </Text>
      </View>
    );
  }
  if (estado === 'error') return <EmptyState tipo="error" onReintentar={cargar} />;
  if (estado === 'vacio') return <EmptyState tipo="vacio" />;

  return (
    <View style={styles.contenedor}>

      {/* Filtros compactos: una sola línea; cada píldora abre sus opciones */}
      <View style={styles.filtrosWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosFila}
        >
          <FiltroDesplegable
            titulo="Ciudad"
            valor={filtros.ciudad}
            activo={filtros.ciudad !== null}
            opciones={[
              { valor: null, etiqueta: 'Todas las ciudades' },
              ...CIUDADES.map((ciudad) => ({ valor: ciudad, etiqueta: ciudad })),
            ]}
            onCambiar={seleccionarCiudad}
          />
          <FiltroDesplegable
            titulo="Barrio"
            valor={filtros.barrio}
            activo={filtros.barrio !== null}
            deshabilitado={barrios.length === 0}
            opciones={[
              { valor: null, etiqueta: 'Todos los barrios' },
              ...barrios.map((barrio) => ({ valor: barrio, etiqueta: barrio })),
            ]}
            onCambiar={elegirBarrio}
          />
          <Pressable
            onPress={alternarDisponibles}
            style={({ pressed }) => [
              styles.pildora,
              filtros.soloDisponibles && styles.pildoraActiva,
              pressed && styles.pildoraPresionada,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Solo paseadores disponibles"
            accessibilityState={{ selected: filtros.soloDisponibles }}
          >
            <Text
              style={[styles.pildoraTexto, filtros.soloDisponibles && styles.pildoraTextoActiva]}
            >
              {filtros.soloDisponibles ? '✓ ' : ''}Disponibles
            </Text>
          </Pressable>
          <FiltroDesplegable
            titulo="Ordenar"
            valor={filtros.orden}
            activo={filtros.orden !== 'relevancia'}
            opciones={ORDENES.map(({ valor, etiqueta }) => ({ valor, etiqueta }))}
            onCambiar={ordenar}
          />
        </ScrollView>
      </View>

      {/* Lista */}
      <FlatList<Celda>
        data={filtrados.length > 0 ? completarGrilla(filtrados, columnas) : []}
        keyExtractor={(item) => item.id}
        numColumns={columnas}
        key={`grid-${columnas}`} // Requerido por FlatList al cambiar columnas
        columnWrapperStyle={columnas > 1 ? { gap: spacing.md } : undefined}
        contentContainerStyle={[styles.lista, { gap: spacing.md }]}
        ListHeaderComponent={
          <View style={styles.encabezadoFila}>
            <Text style={styles.encabezado}>{resumenFiltros()}</Text>
            {filtrosActivos && (
              <Pressable
                onPress={limpiar}
                accessibilityRole="button"
                accessibilityLabel="Limpiar todos los filtros"
                hitSlop={8}
              >
                <Text style={styles.limpiarLink}>Limpiar filtros</Text>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.sinResultados}>
            <Text style={styles.sinResultadosIcono}>🔍</Text>
            <Text style={styles.sinResultadosTitulo}>Sin resultados</Text>
            <Text style={styles.sinResultadosTexto}>
              No hay paseadores con los filtros seleccionados.
            </Text>
            <TouchableOpacity
              onPress={limpiar}
              style={styles.limpiarBtnInline}
              accessibilityRole="button"
              accessibilityLabel="Limpiar todos los filtros"
            >
              <Text style={styles.limpiarBtnInlineTexto}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) =>
          'relleno' in item ? (
            <View style={styles.celda} />
          ) : (
            <Aparecer style={styles.celda} retraso={Math.min(index, 8) * 60}>
              <PaseadorCard
                paseador={item}
                onPress={() => router.push(`/paseadores/${item.id}`)}
              />
            </Aparecer>
          )
        }
        ListFooterComponent={
          filtrados.length > 0 ? (
            <View style={styles.footerSimple}>
              <Text style={styles.footerTexto}>
                WalkPets © 2026 - Todos los derechos reservados
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.crema,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.crema,
  },
  cargandoTexto: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    color: colors.negro,
  },
  cargandoSubtexto: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    textAlign: 'center',
  },

  // Filtros
  filtrosWrap: {
    backgroundColor: colors.blanco,
    borderBottomWidth: 1,
    borderBottomColor: colors.linea,
  },
  filtrosFila: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  pildora: {
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
  pildoraPresionada: {
    opacity: 0.75,
  },
  pildoraTexto: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.medio,
    color: colors.negro,
  },
  pildoraTextoActiva: {
    color: colors.blanco,
  },
  encabezadoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  limpiarLink: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
    textDecorationLine: 'underline',
  },

  // Lista
  lista: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 1200, // Aumentado para 4 columnas
    width: '100%',
    alignSelf: 'center',
  },
  encabezado: {
    flexShrink: 1,
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    fontWeight: '600',
  },

  celda: { flex: 1 },

  // Sin resultados
  sinResultados: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.grisClaro,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  sinResultadosIcono: { fontSize: 48 },
  sinResultadosTitulo: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    color: colors.negro,
  },
  sinResultadosTexto: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  limpiarBtnInline: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.verde,
    borderRadius: radius.full,
  },
  limpiarBtnInlineTexto: {
    color: colors.blanco,
    fontWeight: '700',
    fontSize: fonts.sizes.sm,
  },

  // Footer Simple
  footerSimple: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.grisClaro,
  },
  footerTexto: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
});

import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { PaseadorCard } from '../../components/PaseadorCard';
import { CIUDADES, Ciudad } from '../../src/constants/ciudades';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { getPaseadores } from '../../src/services/paseadores.service';
import { Paseador } from '../../src/types/paseador';

type Estado = 'cargando' | 'exito' | 'error' | 'vacio';

export default function ListaPaseadores() {
  const { width } = useWindowDimensions();
  // Diseño responsivo: 4 columnas en PC grandes, 3 en tablets, 2 en móviles
  const columnas = width >= 1100 ? 4 : width >= 768 ? 3 : 2;

  const [paseadores, setPaseadores] = useState<Paseador[]>([]);
  const [estado, setEstado] = useState<Estado>('cargando');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<Ciudad | null>(null);
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<string | null>(null);

  const cargar = async () => {
    setEstado('cargando');
    try {
      const datos = await getPaseadores();
      setPaseadores(datos);
      setEstado(datos.length === 0 ? 'vacio' : 'exito');
    } catch {
      setEstado('error');
    }
  };

  useEffect(() => { cargar(); }, []);

  // Lista de barrios únicos de la ciudad seleccionada (o de todas las ciudades).
  const barrios = useMemo(() => {
    const base = ciudadSeleccionada
      ? paseadores.filter((p) => p.ciudad === ciudadSeleccionada)
      : paseadores;
    const todos = base.map((p) => p.barrio);
    return [...new Set(todos)];
  }, [paseadores, ciudadSeleccionada]);

  // Paseadores filtrados según los filtros activos
  const paseadoresFiltrados = useMemo(() => {
    return paseadores.filter((p) => {
      if (ciudadSeleccionada && p.ciudad !== ciudadSeleccionada) return false;
      if (soloDisponibles && !p.disponible) return false;
      if (barrioSeleccionado && p.barrio !== barrioSeleccionado) return false;
      return true;
    });
  }, [paseadores, ciudadSeleccionada, soloDisponibles, barrioSeleccionado]);

  const hayFiltrosActivos =
    soloDisponibles || ciudadSeleccionada !== null || barrioSeleccionado !== null;

  const limpiarFiltros = () => {
    setSoloDisponibles(false);
    setCiudadSeleccionada(null);
    setBarrioSeleccionado(null);
  };

  const seleccionarCiudad = (ciudad: Ciudad | null) => {
    setCiudadSeleccionada(ciudad);
    // Si el barrio elegido no pertenece a la nueva ciudad, se limpia.
    if (barrioSeleccionado) {
      const barriosDisponibles = paseadores
        .filter((p) => (ciudad ? p.ciudad === ciudad : true))
        .map((p) => p.barrio);
      if (!barriosDisponibles.includes(barrioSeleccionado)) {
        setBarrioSeleccionado(null);
      }
    }
  };

  const resumenFiltros = () => {
    const ciudad = ciudadSeleccionada ? ` en ${ciudadSeleccionada}` : '';
    const filtrado = hayFiltrosActivos ? ' (filtrado)' : '';
    return `${paseadoresFiltrados.length} de ${paseadores.length} paseadores${ciudad}${filtrado}`;
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

      {/* Barra de filtros */}
      <View style={styles.filtrosWrap}>
        <View style={styles.filtrosInner}>
          <View style={styles.filtrosHeader}>
            <Text style={styles.filtrosTitulo}>Filtrá tu búsqueda</Text>
            {hayFiltrosActivos && (
              <TouchableOpacity
                style={styles.limpiarBtn}
                onPress={limpiarFiltros}
                accessibilityRole="button"
                accessibilityLabel="Limpiar todos los filtros"
                hitSlop={8}
              >
                <Text style={styles.limpiarTexto}>✕ Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filtrosScroll}>
            <Text style={styles.filtroGrupoLabel}>Ciudad</Text>

            {/* Chips de ciudad: Todas, Cipolletti y Neuquén */}
            <TouchableOpacity
              style={[styles.chip, ciudadSeleccionada === null && styles.chipActivo]}
              onPress={() => seleccionarCiudad(null)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Mostrar paseadores de todas las ciudades"
              accessibilityState={{ selected: ciudadSeleccionada === null }}
            >
              <Text style={[styles.chipTexto, ciudadSeleccionada === null && styles.chipTextoActivo]}>
                Todas
              </Text>
            </TouchableOpacity>

            {CIUDADES.map((ciudad) => {
              const activa = ciudadSeleccionada === ciudad;
              return (
                <TouchableOpacity
                  key={ciudad}
                  style={[styles.chip, activa && styles.chipActivo]}
                  onPress={() => seleccionarCiudad(ciudad)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ciudad ${ciudad}`}
                  accessibilityState={{ selected: activa }}
                >
                  <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                    🏙️ {ciudad}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Separador */}
            <View style={styles.separador} />

            {/* Chip: Solo disponibles */}
            <TouchableOpacity
              style={[styles.chip, soloDisponibles && styles.chipActivo]}
              onPress={() => setSoloDisponibles(!soloDisponibles)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Filtrar solo paseadores disponibles"
              accessibilityState={{ selected: soloDisponibles }}
            >
              <Text style={[styles.chipTexto, soloDisponibles && styles.chipTextoActivo]}>
                ✓ Disponibles
              </Text>
            </TouchableOpacity>
          </View>

          {/* Segunda fila: barrios de la ciudad seleccionada */}
          {barrios.length > 0 && (
            <View style={styles.filtrosScroll}>
              <Text style={styles.filtroGrupoLabel}>Barrio</Text>
              {barrios.map((barrio) => {
                const activo = barrioSeleccionado === barrio;
                return (
                  <TouchableOpacity
                    key={barrio}
                    style={[styles.chip, activo && styles.chipActivo]}
                    onPress={() => setBarrioSeleccionado(activo ? null : barrio)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Filtrar por barrio ${barrio}`}
                    accessibilityState={{ selected: activo }}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                      📍 {barrio}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={paseadoresFiltrados}
        keyExtractor={(item) => item.id}
        numColumns={columnas}
        key={`grid-${columnas}`} // Requerido por FlatList al cambiar columnas
        columnWrapperStyle={columnas > 1 ? { gap: spacing.md } : undefined}
        contentContainerStyle={[styles.lista, { gap: spacing.md }]}
        ListHeaderComponent={
          <Text style={styles.encabezado}>{resumenFiltros()}</Text>
        }
        ListEmptyComponent={
          <View style={styles.sinResultados}>
            <Text style={styles.sinResultadosIcono}>🔍</Text>
            <Text style={styles.sinResultadosTitulo}>Sin resultados</Text>
            <Text style={styles.sinResultadosTexto}>
              No hay paseadores con los filtros seleccionados.
            </Text>
            <TouchableOpacity
              onPress={limpiarFiltros}
              style={styles.limpiarBtnInline}
              accessibilityRole="button"
              accessibilityLabel="Limpiar todos los filtros"
            >
              <Text style={styles.limpiarBtnInlineTexto}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <PaseadorCard
            paseador={item}
            onPress={() => router.push(`/paseadores/${item.id}`)}
          />
        )}
        ListFooterComponent={
          paseadoresFiltrados.length > 0 ? (
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
    borderBottomColor: colors.grisClaro,
    paddingVertical: spacing.md - 4,
  },
  filtrosInner: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filtrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  filtrosTitulo: {
    fontSize: fonts.sizes.sm,
    fontWeight: '800',
    color: colors.negro,
    letterSpacing: 0.2,
  },
  filtrosScroll: {
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filtroGrupoLabel: {
    fontSize: fonts.sizes.xs,
    fontWeight: '700',
    color: colors.grisOscuro,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginRight: 2,
  },
  chip: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.grisMedio,
    backgroundColor: colors.blanco,
  },
  chipActivo: {
    backgroundColor: colors.verdeOscuro,
    borderColor: colors.verdeOscuro,
  },
  chipTexto: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    fontWeight: '600',
  },
  chipTextoActivo: {
    color: colors.blanco,
  },
  separador: {
    width: 1,
    height: 20,
    backgroundColor: colors.grisClaro,
    marginHorizontal: spacing.xs,
  },
  limpiarBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radius.full,
    backgroundColor: colors.verdePastel,
  },
  limpiarTexto: {
    fontSize: fonts.sizes.xs + 1,
    color: colors.verdeOscuro,
    fontWeight: '700',
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
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    marginBottom: spacing.md,
    fontWeight: '600',
  },

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

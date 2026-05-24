import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Paseador } from '../../types/paseador';
import { getPaseadores } from '../../services/paseadores.service';
import { PaseadorCard } from '../../components/PaseadorCard';
import { EmptyState } from '../../components/EmptyState';
import { colors, fonts, radius, spacing } from '../../constants/theme';

type Estado = 'cargando' | 'exito' | 'error' | 'vacio';

export default function ListaPaseadores() {
  const [paseadores, setPaseadores] = useState<Paseador[]>([]);
  const [estado, setEstado] = useState<Estado>('cargando');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
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

  // Lista de barrios únicos extraída de los datos
  const barrios = useMemo(() => {
    const todos = paseadores.map((p) => p.barrio);
    return [...new Set(todos)];
  }, [paseadores]);

  // Paseadores filtrados según los filtros activos
  const paseadoresFiltrados = useMemo(() => {
    return paseadores.filter((p) => {
      if (soloDisponibles && !p.disponible) return false;
      if (barrioSeleccionado && p.barrio !== barrioSeleccionado) return false;
      return true;
    });
  }, [paseadores, soloDisponibles, barrioSeleccionado]);

  const hayFiltrosActivos = soloDisponibles || barrioSeleccionado !== null;

  const limpiarFiltros = () => {
    setSoloDisponibles(false);
    setBarrioSeleccionado(null);
  };

  if (estado === 'cargando') {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={colors.verde} />
        <Text style={styles.cargandoTexto}>Buscando paseadores...</Text>
      </View>
    );
  }
  if (estado === 'error') return <EmptyState tipo="error" onReintentar={cargar} />;
  if (estado === 'vacio') return <EmptyState tipo="vacio" />;

  return (
    <View style={styles.contenedor}>

      {/* Barra de filtros */}
      <View style={styles.filtrosWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosScroll}
        >
          {/* Chip: Solo disponibles */}
          <TouchableOpacity
            style={[styles.chip, soloDisponibles && styles.chipActivo]}
            onPress={() => setSoloDisponibles(!soloDisponibles)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipTexto, soloDisponibles && styles.chipTextoActivo]}>
              ✓ Disponibles
            </Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separador} />

          {/* Chips de barrio */}
          {barrios.map((barrio) => (
            <TouchableOpacity
              key={barrio}
              style={[styles.chip, barrioSeleccionado === barrio && styles.chipActivo]}
              onPress={() =>
                setBarrioSeleccionado(barrioSeleccionado === barrio ? null : barrio)
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipTexto,
                  barrioSeleccionado === barrio && styles.chipTextoActivo,
                ]}
              >
                📍 {barrio}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Botón limpiar filtros */}
        {hayFiltrosActivos && (
          <TouchableOpacity style={styles.limpiarBtn} onPress={limpiarFiltros}>
            <Text style={styles.limpiarTexto}>✕ Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      <FlatList
        data={paseadoresFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <Text style={styles.encabezado}>
            {paseadoresFiltrados.length} de {paseadores.length} paseadores
            {hayFiltrosActivos ? ' (filtrado)' : ' en Cipolletti'}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.sinResultados}>
            <Text style={styles.sinResultadosIcono}>🔍</Text>
            <Text style={styles.sinResultadosTitulo}>Sin resultados</Text>
            <Text style={styles.sinResultadosTexto}>
              No hay paseadores con los filtros seleccionados.
            </Text>
            <TouchableOpacity onPress={limpiarFiltros} style={styles.limpiarBtnInline}>
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
    gap: 12,
    backgroundColor: colors.crema,
  },
  cargandoTexto: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
  },

  // Filtros
  filtrosWrap: {
    backgroundColor: colors.blanco,
    borderBottomWidth: 1,
    borderBottomColor: colors.grisClaro,
    paddingVertical: spacing.sm,
  },
  filtrosScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.grisMedio,
    backgroundColor: colors.blanco,
  },
  chipActivo: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
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
    backgroundColor: colors.grisMedio,
    marginHorizontal: spacing.xs,
  },
  limpiarBtn: {
    alignSelf: 'center',
    marginTop: spacing.xs,
    marginHorizontal: spacing.lg,
  },
  limpiarTexto: {
    fontSize: fonts.sizes.xs,
    color: colors.naranja,
    fontWeight: '700',
  },

  // Lista
  lista: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  sinResultadosIcono: { fontSize: 48 },
  sinResultadosTitulo: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    color: colors.negro,
  },
  sinResultadosTexto: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: 'center',
  },
  limpiarBtnInline: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.verde,
  },
  limpiarBtnInlineTexto: {
    fontSize: fonts.sizes.sm,
    color: colors.verde,
    fontWeight: '700',
  },
});

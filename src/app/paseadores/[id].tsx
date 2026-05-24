import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Paseador } from '../../types/paseador';
import { getPaseadorById } from '../../services/paseadores.service';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { StarRating } from '../../components/StarRating';
import { colors, fonts, radius, shadows, spacing } from '../../constants/theme';

export default function DetallePaseador() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paseador, setPaseador] = useState<Paseador | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPaseadorById(id)
      .then((data) => {
        setPaseador(data);
        setCargando(false);
      })
      .catch(() => {
        setError(true);
        setCargando(false);
      });
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={colors.verde} />
      </View>
    );
  }

  if (error || !paseador) {
    return <EmptyState tipo="error" />;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contenedor}
      showsVerticalScrollIndicator={false}
    >
      {/* Foto y encabezado */}
      <View style={styles.header}>
        <Image source={{ uri: paseador.foto }} style={styles.foto} />
        <View style={styles.headerInfo}>
          <Text style={styles.nombre}>
            {paseador.nombre} {paseador.apellido}
          </Text>
          <Text style={styles.barrio}>📍 {paseador.barrio}</Text>
          <StarRating calificacion={paseador.calificacion} tamano="md" />
          <Text style={styles.resenasCantidad}>
            {paseador.cantidadResenas} reseñas
          </Text>
        </View>
      </View>

      {/* Precio y disponibilidad */}
      <View style={styles.precioRow}>
        <View>
          <Text style={styles.precio}>
            ${paseador.precioHora.toLocaleString('es-AR')}
            <Text style={styles.precioSufijo}> / hora</Text>
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            paseador.disponible ? styles.disponible : styles.noDisponible,
          ]}
        >
          <Text
            style={[
              styles.badgeTexto,
              paseador.disponible
                ? styles.badgeTextoDisp
                : styles.badgeTextoNoDis,
            ]}
          >
            {paseador.disponible ? '✓ Disponible' : '✗ No disponible'}
          </Text>
        </View>
      </View>

      {/* Descripción */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Sobre mí</Text>
        <Text style={styles.descripcion}>{paseador.descripcion}</Text>
      </View>

      {/* Razas */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Razas aceptadas</Text>
        <View style={styles.razasRow}>
          {paseador.razasAceptadas.map((raza, i) => (
            <View key={i} style={styles.razaChip}>
              <Text style={styles.razaTexto}>{raza}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Turnos disponibles */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Turnos disponibles</Text>
        {paseador.turnosDisponibles.map((turno) => (
          <View
            key={turno.id}
            style={[
              styles.turnoRow,
              !turno.disponible && styles.turnoOcupado,
            ]}
          >
            <Text style={styles.turnoDia}>{turno.dia}</Text>
            <Text style={styles.turnoHorario}>{turno.horario}</Text>
            <Text
              style={[
                styles.turnoEstado,
                turno.disponible
                  ? styles.turnoEstadoDisp
                  : styles.turnoEstadoOcup,
              ]}
            >
              {turno.disponible ? 'Libre' : 'Ocupado'}
            </Text>
          </View>
        ))}
      </View>

      {/* Reseñas */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>
          Reseñas ({paseador.resenas.length})
        </Text>
        {paseador.resenas.map((resena) => (
          <View key={resena.id} style={styles.resenaCard}>
            <View style={styles.resenaEncabezado}>
              <Text style={styles.resenaAutor}>{resena.autor}</Text>
              <StarRating
                calificacion={resena.calificacion}
                tamano="sm"
                mostrarNumero={false}
              />
            </View>
            <Text style={styles.resenaMascota}>🐶 {resena.mascota}</Text>
            <Text style={styles.resenaTexto}>{resena.texto}</Text>
            <Text style={styles.resenaFecha}>{resena.fecha}</Text>
          </View>
        ))}
      </View>

      {/* CTA reserva */}
      {paseador.disponible && (
        <AppButton
          label="Reservar un turno"
          onPress={() =>
            router.push({
              pathname: '/paseadores/reserva',
              params: { id: paseador.id, nombre: paseador.nombre },
            })
          }
          style={styles.ctaReserva}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.crema },
  contenedor: { padding: spacing.lg, paddingBottom: spacing.xxl },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crema,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  foto: { width: 110, height: 130, resizeMode: 'cover' },
  headerInfo: { flex: 1, padding: spacing.md, gap: spacing.xs },
  nombre: { fontSize: fonts.sizes.lg, fontWeight: '800', color: colors.negro },
  barrio: { fontSize: fonts.sizes.sm, color: colors.grisOscuro },
  resenasCantidad: { fontSize: fonts.sizes.xs, color: colors.grisOscuro },
  precioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.blanco,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  precio: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.verde },
  precioSufijo: { fontSize: fonts.sizes.sm, fontWeight: '400', color: colors.grisOscuro },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  disponible: { backgroundColor: colors.verdePastel },
  noDisponible: { backgroundColor: colors.crema },
  badgeTexto: { fontSize: fonts.sizes.sm, fontWeight: '700' },
  badgeTextoDisp: { color: colors.verde },
  badgeTextoNoDis: { color: colors.grisOscuro },
  seccion: {
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  seccionTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: '700',
    color: colors.negro,
    marginBottom: spacing.sm,
  },
  descripcion: { fontSize: fonts.sizes.md, color: colors.grisOscuro, lineHeight: 22 },
  razasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  razaChip: {
    backgroundColor: colors.verdePastel,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  razaTexto: { fontSize: fonts.sizes.sm, color: colors.verde, fontWeight: '600' },
  turnoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.crema,
  },
  turnoOcupado: { opacity: 0.5 },
  turnoDia: { flex: 1, fontSize: fonts.sizes.sm, fontWeight: '600', color: colors.negro },
  turnoHorario: { flex: 2, fontSize: fonts.sizes.sm, color: colors.grisOscuro },
  turnoEstado: { fontSize: fonts.sizes.sm, fontWeight: '700' },
  turnoEstadoDisp: { color: colors.verde },
  turnoEstadoOcup: { color: colors.grisOscuro },
  resenaCard: {
    borderBottomWidth: 1,
    borderBottomColor: colors.crema,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  resenaEncabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resenaAutor: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.negro },
  resenaMascota: { fontSize: fonts.sizes.sm, color: colors.grisOscuro },
  resenaTexto: { fontSize: fonts.sizes.sm, color: colors.negro, lineHeight: 20 },
  resenaFecha: { fontSize: fonts.sizes.xs, color: colors.grisMedio },
  ctaReserva: { marginTop: spacing.md },
});

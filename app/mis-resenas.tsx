import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { StarRating } from '../components/StarRating';
import { colors, fonts, radius, shadows, spacing } from '../src/constants/theme';
import { useSesion } from '../src/context/SesionContext';
import { getMisResenas } from '../src/services/resenas.service';
import { Resena } from '../src/types/paseador';

type Estado = 'cargando' | 'exito' | 'error' | 'sin-sesion';

// Pantalla para que un paseador consulte las reseñas de su propio perfil.
export default function MisResenas() {
  const { sesion, cargando: cargandoSesion } = useSesion();
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [estado, setEstado] = useState<Estado>('cargando');
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!sesion) {
      setEstado('sin-sesion');
      return;
    }

    setEstado('cargando');
    setError(null);
    try {
      const datos = await getMisResenas();
      setResenas(datos);
      setEstado('exito');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar tus reseñas.');
      setEstado('error');
    }
  }, [sesion]);

  useEffect(() => {
    if (cargandoSesion) return;
    cargar();
  }, [cargar, cargandoSesion]);

  if (cargandoSesion || estado === 'cargando') {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={colors.verde} />
      </View>
    );
  }

  if (estado === 'sin-sesion') {
    return (
      <View style={styles.centrado}>
        <Text style={styles.mensaje}>Iniciá sesión como paseador para ver tus reseñas.</Text>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/login')}
          accessibilityRole="button"
          accessibilityLabel="Ir a iniciar sesión"
        >
          <Text style={styles.botonTexto}>Ir a iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (estado === 'error') {
    return <EmptyState tipo="error" onReintentar={cargar} mensaje={error ?? undefined} />;
  }

  if (resenas.length === 0) {
    return (
      <EmptyState
        tipo="vacio"
        titulo="Todavía no tenés reseñas"
        mensaje="Cuando los clientes califiquen tus paseos, vas a ver sus reseñas acá."
      />
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contenedor}>
      <Text style={styles.encabezado}>
        {resenas.length} {resenas.length === 1 ? 'reseña recibida' : 'reseñas recibidas'}
      </Text>

      {resenas.map((resena) => (
        <View key={resena.id} style={styles.resenaCard}>
          <View style={styles.resenaEncabezado}>
            <Text style={styles.resenaAutor}>{resena.autor}</Text>
            <StarRating calificacion={resena.calificacion} tamano="sm" mostrarNumero={false} />
          </View>
          <Text style={styles.resenaMascota}>🐶 {resena.mascota}</Text>
          <Text style={styles.resenaTexto}>{resena.texto}</Text>
          <Text style={styles.resenaFecha}>{resena.fecha}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.crema },
  contenedor: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.crema,
    padding: spacing.lg,
    gap: spacing.md,
  },
  mensaje: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: colors.verde,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  botonTexto: { color: colors.blanco, fontWeight: '700' },
  encabezado: {
    fontSize: fonts.sizes.md,
    fontWeight: '700',
    color: colors.negro,
    marginBottom: spacing.md,
  },
  resenaCard: {
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
    ...shadows.card,
  },
  resenaEncabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resenaAutor: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.negro },
  resenaMascota: { fontSize: fonts.sizes.sm, color: colors.grisOscuro },
  resenaTexto: { fontSize: fonts.sizes.sm, color: colors.negro, lineHeight: 20 },
  resenaFecha: { fontSize: fonts.sizes.xs, color: colors.grisMedio },
});

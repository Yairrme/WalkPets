import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { StarRating } from '../../components/StarRating';
import { colors, fonts, radius, shadows, spacing } from '../../src/constants/theme';
import { useSesion } from '../../src/context/SesionContext';
import { getPaseadorById } from '../../src/services/paseadores.service';
import { crearResena } from '../../src/services/resenas.service';
import { Paseador } from '../../src/types/paseador';
import {
  construirMensajeWhatsApp,
  construirUrlTel,
  construirUrlWhatsApp,
  formatearTelefono,
} from '../../src/utils/telefono';

const CALIFICACIONES = [1, 2, 3, 4, 5];

export default function DetallePaseador() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sesion } = useSesion();
  const [paseador, setPaseador] = useState<Paseador | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [mascota, setMascota] = useState('');
  const [textoResena, setTextoResena] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [enviando, setEnviando] = useState(false);
  const [errorResena, setErrorResena] = useState<string | null>(null);
  const [exitoResena, setExitoResena] = useState(false);

  const puedeResenar = sesion?.usuario.rol === 'cliente' && !paseador?.esPropietario;

  const cargar = useCallback(() => {
    if (!id) {
      setCargando(false);
      setError(true);
      return;
    }

    setCargando(true);
    setError(false);
    getPaseadorById(id)
      .then((data) => {
        setPaseador(data);
        setError(data === null);
        setCargando(false);
      })
      .catch(() => {
        setError(true);
        setCargando(false);
      });
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const enviarResena = async () => {
    if (!id) return;

    setErrorResena(null);
    setExitoResena(false);

    if (!mascota.trim()) {
      setErrorResena('Contanos el nombre de tu mascota.');
      return;
    }
    if (textoResena.trim().length < 10) {
      setErrorResena('Escribí al menos 10 caracteres sobre el paseo.');
      return;
    }

    setEnviando(true);
    try {
      await crearResena(id, {
        mascota: mascota.trim(),
        texto: textoResena.trim(),
        calificacion,
      });
      setMascota('');
      setTextoResena('');
      setCalificacion(5);
      setExitoResena(true);
      cargar();
    } catch (e) {
      setErrorResena(
        e instanceof Error ? e.message : 'No se pudo publicar la reseña.'
      );
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={colors.verde} />
        <Text style={styles.cargandoTexto}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error || !paseador) {
    return <EmptyState tipo="error" onReintentar={cargar} />;
  }

  const telefonoFormateado = formatearTelefono(paseador.telefono);
  const urlTel = construirUrlTel(paseador.telefono);
  const urlWhatsApp = construirUrlWhatsApp(
    paseador.telefono,
    construirMensajeWhatsApp(paseador.nombre)
  );
  const nombreCompleto = `${paseador.nombre} ${paseador.apellido}`;

  const abrirEnlace = async (url: string | null) => {
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No se pudo abrir la aplicación', 'Revisá el número e intentá nuevamente.');
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contenedor}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Foto y encabezado */}
      <View style={styles.header}>
        <Image source={{ uri: paseador.foto }} style={styles.foto} />
        <View style={styles.headerInfo}>
          <Text style={styles.nombre}>{nombreCompleto}</Text>
          <Text style={styles.barrio}>
            📍 {paseador.barrio}, {paseador.ciudad}
          </Text>
          <View style={styles.ratingRow}>
            <StarRating calificacion={paseador.calificacion} tamano="md" />
            <Text style={styles.resenasCantidad}>
              {paseador.cantidadResenas} reseñas
            </Text>
          </View>
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

      {/* Contacto directo: teléfono y WhatsApp */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Contacto</Text>
        {telefonoFormateado ? (
          <>
            <Text style={styles.telefono}>{telefonoFormateado}</Text>
            <View style={styles.contactoRow}>
              <TouchableOpacity
                style={[styles.contactoBtn, styles.contactoTel]}
                onPress={() => abrirEnlace(urlTel)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Llamar a ${nombreCompleto}`}
                accessibilityHint="Abre la aplicación de teléfono con el número del paseador"
              >
                <Text style={styles.contactoTexto}>📞 Llamar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactoBtn, styles.contactoWhatsApp]}
                onPress={() => abrirEnlace(urlWhatsApp)}
                activeOpacity={0.85}
                accessibilityRole="link"
                accessibilityLabel={`Contactar a ${nombreCompleto} por WhatsApp`}
                accessibilityHint="Abre WhatsApp con un mensaje prellenado de WalkPets"
              >
                <Text style={styles.contactoTexto}>💬 WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.contactoSinTelefono}>
            Este paseador todavía no tiene un teléfono de contacto válido.
          </Text>
        )}
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

      {/* Reseñas */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>
          Reseñas ({paseador.resenas.length})
        </Text>
        {paseador.resenas.length === 0 ? (
          <Text style={styles.sinResenas}>Todavía no hay reseñas de este paseador.</Text>
        ) : (
          paseador.resenas.map((resena) => (
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
          ))
        )}
      </View>

      {/* Publicar reseña: solo clientes autenticados */}
      {puedeResenar && (
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Dejá tu reseña</Text>

          {exitoResena && (
            <View style={styles.exitoCaja}>
              <Text style={styles.exitoTexto}>¡Gracias! Tu reseña se publicó.</Text>
            </View>
          )}

          {errorResena && (
            <View style={styles.errorCaja}>
              <Text style={styles.errorTexto}>{errorResena}</Text>
            </View>
          )}

          <Text style={styles.label}>Calificación</Text>
          <View style={styles.estrellasRow}>
            {CALIFICACIONES.map((valor) => (
              <TouchableOpacity
                key={valor}
                onPress={() => setCalificacion(valor)}
                accessibilityRole="button"
                accessibilityLabel={`Calificar con ${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`}
                accessibilityState={{ selected: calificacion === valor }}
              >
                <Text
                  style={[
                    styles.estrella,
                    valor <= calificacion && styles.estrellaActiva,
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nombre de tu mascota</Text>
          <TextInput
            style={styles.input}
            value={mascota}
            onChangeText={setMascota}
            placeholder="Ej: Rocky"
            placeholderTextColor={colors.grisMedio}
            accessibilityLabel="Nombre de tu mascota"
          />

          <Text style={styles.label}>Tu experiencia</Text>
          <TextInput
            style={[styles.input, styles.inputMultilinea]}
            value={textoResena}
            onChangeText={setTextoResena}
            placeholder="Contanos cómo fue el paseo..."
            placeholderTextColor={colors.grisMedio}
            multiline
            accessibilityLabel="Tu experiencia con el paseador"
          />

          <TouchableOpacity
            style={[styles.enviarBtn, enviando && styles.enviarBtnDeshabilitado]}
            onPress={enviarResena}
            disabled={enviando}
            accessibilityRole="button"
            accessibilityLabel="Publicar reseña"
            accessibilityState={{ disabled: enviando }}
          >
            {enviando ? (
              <ActivityIndicator color={colors.blanco} />
            ) : (
              <Text style={styles.enviarTexto}>Publicar reseña</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!sesion && (
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>¿Ya paseaste con {paseador.nombre}?</Text>
          <Text style={styles.avisoSesion}>
            Iniciá sesión como cliente para dejar tu reseña.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/login')}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión para dejar una reseña"
          >
            <Text style={styles.loginTexto}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      )}
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
    gap: spacing.sm,
    backgroundColor: colors.crema,
  },
  cargandoTexto: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.grisClaro,
    ...shadows.card,
  },
  foto: { width: 120, height: 150, resizeMode: 'cover', backgroundColor: colors.grisClaro },
  headerInfo: { flex: 1, padding: spacing.md, gap: spacing.xs, justifyContent: 'center' },
  nombre: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.negro },
  barrio: { fontSize: fonts.sizes.sm, color: colors.grisOscuro },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 2,
  },
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
    borderWidth: 1,
    borderColor: colors.grisClaro,
    ...shadows.card,
  },
  seccionTitulo: {
    fontSize: fonts.sizes.md + 1,
    fontWeight: '800',
    color: colors.negro,
    marginBottom: spacing.sm,
  },
  telefono: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    color: colors.negro,
    marginBottom: spacing.sm,
  },
  contactoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  contactoBtn: {
    flex: 1,
    minWidth: 130,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactoTel: { backgroundColor: colors.verde },
  contactoWhatsApp: { backgroundColor: colors.whatsapp },
  contactoTexto: { color: colors.blanco, fontWeight: '700', fontSize: fonts.sizes.sm },
  contactoSinTelefono: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    fontStyle: 'italic',
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
  sinResenas: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    fontStyle: 'italic',
  },
  resenaCard: {
    backgroundColor: colors.crema,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: 4,
  },
  resenaEncabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resenaAutor: { fontSize: fonts.sizes.sm, fontWeight: '700', color: colors.negro },
  resenaMascota: { fontSize: fonts.sizes.sm, color: colors.grisOscuro },
  resenaTexto: { fontSize: fonts.sizes.sm, color: colors.negro, lineHeight: 20 },
  resenaFecha: { fontSize: fonts.sizes.xs, color: colors.grisMedio },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
    color: colors.negro,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  estrellasRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  estrella: { fontSize: 30, color: colors.grisMedio },
  estrellaActiva: { color: colors.naranja },
  input: {
    backgroundColor: colors.grisClaro,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.sizes.md,
    color: colors.negro,
    marginBottom: spacing.sm,
  },
  inputMultilinea: { minHeight: 90, textAlignVertical: 'top' },
  enviarBtn: {
    backgroundColor: colors.verde,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  enviarBtnDeshabilitado: { opacity: 0.7 },
  enviarTexto: { color: colors.blanco, fontWeight: '700', fontSize: fonts.sizes.sm },
  exitoCaja: {
    backgroundColor: colors.exitoClaro,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  exitoTexto: { color: colors.exito, fontSize: fonts.sizes.sm, fontWeight: '600' },
  errorCaja: {
    backgroundColor: colors.errorClaro,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorTexto: { color: colors.error, fontSize: fonts.sizes.sm, fontWeight: '600' },
  avisoSesion: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    marginBottom: spacing.sm,
  },
  loginBtn: {
    backgroundColor: colors.verde,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  loginTexto: { color: colors.blanco, fontWeight: '700', fontSize: fonts.sizes.sm },
});

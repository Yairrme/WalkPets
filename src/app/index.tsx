import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, fonts, radius, shadows, spacing } from "../constants/theme";

// Importamos el logo circular de la marca
const logo = require("../../assets/images/branding/logo.png");

export default function Inicio() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contenedor}
      showsVerticalScrollIndicator={false}
    >
      {/* =========================================================================
          CABECERA HERO (Banner principal de marca, ahora más compacto y elegante)
          ========================================================================= */}
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Image style={styles.logoImage} source={logo} resizeMode="cover" />
        </View>
        <Text style={styles.marca}>walkpets</Text>
        <Text style={styles.marcaSub}>PASEADORES</Text>
        <Text style={styles.subtitulo}>
          Conectamos paseadores de confianza{"\n"}con dueños de mascotas en Cipolletti
        </Text>
      </View>

      {/* =========================================================================
          ACCIONES RÁPIDAS (Botones de navegación principales simplificados)
          ========================================================================= */}
      <View style={styles.accionesContainer}>
        {/* BOTÓN 1: Buscar Paseadores */}
        <TouchableOpacity
          style={styles.btnBuscar}
          onPress={() => router.push("/paseadores")}
          activeOpacity={0.9}
        >
          <Text style={styles.btnBuscarIcono}>🐕</Text>
          <View style={styles.btnBuscarTextoWrap}>
            <Text style={styles.btnBuscarTitulo}>Buscar Paseador</Text>
            <Text style={styles.btnBuscarSubtitulo}>Ver paseadores disponibles en Cipolletti</Text>
          </View>
          <Text style={styles.btnBuscarFlecha}>→</Text>
        </TouchableOpacity>

        {/* BOTÓN 2: Registrarse como Paseador (¡NUEVO FLOW!) */}
        <TouchableOpacity
          style={styles.btnRegistrar}
          onPress={() => router.push("/paseadores/registro")}
          activeOpacity={0.9}
        >
          <Text style={styles.btnRegistrarIcono}>🐾</Text>
          <View style={styles.btnRegistrarTextoWrap}>
            <Text style={styles.btnRegistrarTitulo}>Quiero ser Paseador</Text>
            <Text style={styles.btnRegistrarSubtitulo}>Regístrate en la red para ofrecer paseos</Text>
          </View>
          <Text style={styles.btnRegistrarFlecha}>→</Text>
        </TouchableOpacity>
      </View>



      {/* =========================================================================
          GUÍA SIMPLIFICADA DE USO
          ========================================================================= */}
      <Text style={styles.seccionTitulo}>¿Cómo funciona WalkPets?</Text>

      {[
        {
          icono: "🔍",
          titulo: "Buscá un perfil ideal",
          descripcion: "Explora perfiles, lee reseñas reales y compara tarifas por hora.",
        },
        {
          icono: "📅",
          titulo: "Elegí el horario",
          descripcion: "Elige el turno que mejor se adapte a las necesidades de tu mascota.",
        },
        {
          icono: "✅",
          titulo: "¡Listo para pasear!",
          descripcion: "Reserva el turno e interactúa directamente por teléfono. ¡Sin vueltas!",
        },
      ].map((paso, i) => (
        <View key={i} style={styles.pasoCard}>
          <View style={styles.pasoIconoWrap}>
            <Text style={styles.pasoIcono}>{paso.icono}</Text>
          </View>
          <View style={styles.pasoTexto}>
            <Text style={styles.pasoTitulo}>{paso.titulo}</Text>
            <Text style={styles.pasoDesc}>{paso.descripcion}</Text>
          </View>
        </View>
      ))}

      {/* Pie de página sutil */}
      <Text style={styles.footer}>Hecho con ❤️ para las mascotas de Cipolletti</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.crema
  },
  contenedor: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },

  // Hero: Banner superior simplificado y estético
  hero: {
    alignItems: "center",
    paddingVertical: spacing.xl + 4,
    backgroundColor: colors.verde,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.blanco,
    padding: 3,
    marginBottom: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  marca: {
    fontSize: fonts.sizes.xxl + 2,
    fontWeight: "800",
    color: colors.blanco,
    letterSpacing: -0.5,
  },
  marcaSub: {
    fontSize: fonts.sizes.xs - 1,
    fontWeight: "800",
    color: colors.verdeMenta,
    letterSpacing: 5,
    marginTop: -2,
  },
  subtitulo: {
    fontSize: fonts.sizes.sm + 1,
    color: colors.verdeMenta,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  // Contenedor de acciones duales principales
  accionesContainer: {
    gap: spacing.sm + 2,
    marginBottom: spacing.lg,
  },

  // Botón Buscar Paseador (Verde Sólido Premium)
  btnBuscar: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.card,
  },
  btnBuscarIcono: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  btnBuscarTextoWrap: {
    flex: 1,
  },
  btnBuscarTitulo: {
    fontSize: fonts.sizes.md + 1,
    fontWeight: "800",
    color: colors.blanco,
    marginBottom: 2,
  },
  btnBuscarSubtitulo: {
    fontSize: fonts.sizes.xs,
    color: colors.verdePastel,
    opacity: 0.9,
  },
  btnBuscarFlecha: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.blanco,
    marginLeft: spacing.sm,
  },

  // Botón Registrar Paseador (Contraste VerdePastel y borde Verde)
  btnRegistrar: {
    backgroundColor: colors.verdePastel,
    borderColor: colors.verde,
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.card,
  },
  btnRegistrarIcono: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  btnRegistrarTextoWrap: {
    flex: 1,
  },
  btnRegistrarTitulo: {
    fontSize: fonts.sizes.md + 1,
    fontWeight: "800",
    color: colors.verde,
    marginBottom: 2,
  },
  btnRegistrarSubtitulo: {
    fontSize: fonts.sizes.xs,
    color: colors.verdeClaro,
    opacity: 0.9,
  },
  btnRegistrarFlecha: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.verde,
    marginLeft: spacing.sm,
  },

  // Estadísticas
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.blanco,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.grisClaro,
    ...shadows.card,
  },
  statNumero: {
    fontSize: fonts.sizes.md + 2,
    fontWeight: "800",
    color: colors.verde,
  },
  statLabel: {
    fontSize: fonts.sizes.xs - 1,
    color: colors.grisOscuro,
    fontWeight: "600",
    marginTop: 2,
  },

  // Título de secciones secundarias
  seccionTitulo: {
    fontSize: fonts.sizes.md + 1,
    fontWeight: "700",
    color: colors.negro,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },

  // Tarjetas informativas
  pasoCard: {
    backgroundColor: colors.blanco,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.grisClaro,
    ...shadows.card,
  },
  pasoIconoWrap: {
    width: 44,
    height: 44,
    backgroundColor: colors.verdePastel,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pasoIcono: {
    fontSize: 20
  },
  pasoTexto: {
    flex: 1
  },
  pasoTitulo: {
    fontSize: fonts.sizes.sm + 1,
    fontWeight: "700",
    color: colors.negro,
    marginBottom: 2,
  },
  pasoDesc: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    lineHeight: 16,
  },

  // Pie de página
  footer: {
    textAlign: "center",
    fontSize: fonts.sizes.xs,
    color: colors.grisOscuro,
    marginTop: spacing.xl,
    opacity: 0.8,
  },
});

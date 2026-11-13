import { Entypo, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { colors, fonts, radius, shadows, spacing } from "../src/constants/theme";
import { VideoYoutube } from "../components/VideoYoutube";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { Aparecer } from "../components/Aparecer";
import { Flotar } from "../components/Flotar";
import { BotonBuscar } from "../components/BotonBuscar";

// ============================================================================
// PANTALLA: / (inicio)
// Presenta WalkPets y lleva a buscar paseadores. Tiene dos diseños según el ancho:
// - Móvil (< 600 px): logo arriba, propuesta de valor, beneficios, video y una
//   barra fija abajo con el botón "Buscar paseadores".
// - Ancho: texto y botones a la izquierda, logo a la derecha.
// El video de YouTube se carga recién cuando la persona toca "play" (primero se
// muestra solo la miniatura), así no gasta datos al abrir la pantalla.
// ============================================================================

// Punto de quiebre entre layout móvil y wide (escritorio/tablet grande)
const WIDE_BREAKPOINT = 600;

// Beneficios rápidos del hero (ícono de la familia FontAwesome + texto)
const BENEFICIOS: { icono: ComponentProps<typeof FontAwesome>["name"]; texto: string }[] = [
  { icono: "map-marker", texto: "Cipolletti y Neuquén" },
  { icono: "phone", texto: "Contacto directo" },
  { icono: "star", texto: "Reseñas reales" },
];

function ChipsBeneficios({ alineados }: { alineados?: "inicio" }) {
  return (
    <View style={[styles.heroChips, alineados === "inicio" && styles.heroChipsWide]}>
      {BENEFICIOS.map((b) => (
        <View key={b.texto} style={styles.heroChip}>
          <FontAwesome name={b.icono} size={13} color={colors.verde} />
          <Text style={styles.heroChipTexto}>{b.texto}</Text>
        </View>
      ))}
    </View>
  );
}

// Logo circular de la marca
const logo = require("../assets/Logo Walk Pets.png");

// ▶ Pegá tu URL de YouTube acá (el ID se extrae automáticamente)
const YOUTUBE_URL = "https://www.youtube.com/watch?v=plJUSgZ0guc";

export default function Inicio() {
  const [mostrarQuienes, setMostrarQuienes] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  // El logo se adapta al ancho disponible para no desbordar en pantallas chicas
  const logoSize = Math.min(340, Math.max(160, width - spacing.lg * 2 - 24));
  const logoSizeWide = Math.min(360, Math.max(200, width * 0.3));

  return (
    <View style={styles.pantalla}>
      {/* Barra superior: sabe si hay sesión y colapsa en móvil */}
      <AppHeader
        onQuienesSomos={() => setMostrarQuienes((visible) => !visible)}
        quienesActivo={mostrarQuienes}
      />

      {/* Panel desplegable: Quiénes somos */}
      {mostrarQuienes && (
        <View style={styles.quienesPanel}>
          <View style={styles.quienesCard}>
            <TouchableOpacity
              style={styles.quienesCerrar}
              onPress={() => setMostrarQuienes(false)}
              accessibilityRole="button"
              accessibilityLabel="Cerrar panel Quiénes somos"
            >
              <Entypo name="cross" size={24} color={colors.grisOscuro} />
            </TouchableOpacity>
            <View style={styles.quienesIcono}>
              <FontAwesome name="paw" size={22} color={colors.verde} />
            </View>
            <Text style={styles.quienesTitulo}>Sobre WalkPets</Text>
            <Text style={styles.quienesTexto}>
              WalkPets es una plataforma que conecta dueños de mascotas con
              paseadores profesionales de confianza en Cipolletti y Neuquén.
              Nuestro objetivo es garantizar paseos seguros, felices y al mejor
              precio.
            </Text>
            <View style={styles.quienesDivider} />
            <Text style={styles.quienesCreador}>Creado por</Text>
            <Text style={styles.quienesNombre}>Yair Melinguer</Text>
            <View style={styles.quienesDivider} />
            {/* Redes sociales */}
            <Text style={styles.quienesSiguenos}>Síguenos en</Text>
            <View style={styles.quienesRedes}>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://instagram.com")}
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityLabel="Instagram de WalkPets"
              >
                <View style={styles.quienesRedCircle}>
                  <Entypo name="instagram" size={20} color={colors.verde} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://linkedin.com")}
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityLabel="LinkedIn de WalkPets"
              >
                <View style={styles.quienesRedCircle}>
                  <Entypo name="linkedin" size={20} color={colors.verde} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://x.com")}
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityLabel="X (Twitter) de WalkPets"
              >
                <View style={styles.quienesRedCircle}>
                  <FontAwesome name="twitter" size={20} color={colors.verde} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://wa.me/5490000000000")}
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityLabel="WhatsApp de WalkPets"
              >
                <View style={styles.quienesRedCircle}>
                  <FontAwesome name="whatsapp" size={20} color={colors.verde} />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.quienesCopy}>
              © 2026 WalkPets · Hecho con ❤️ en Cipolletti y Neuquén
            </Text>
          </View>
        </View>
      )}

      {/* =====================================================================
          HERO PRINCIPAL
          ===================================================================== */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isWide && styles.scrollContentWide,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, isWide && styles.heroSectionWide]}>
          {!isWide ? (
            /* ── MODO MÓVIL: centrado, logo arriba del texto ── */
            <View style={styles.heroMobile}>
              {/* Logo circular grande, con tamaño adaptado al ancho */}
              <Aparecer>
                <Flotar>
                  <View
                    style={[
                      styles.logoWrapper,
                      { width: logoSize, height: logoSize },
                    ]}
                  >
                    <Image
                      source={logo}
                      style={styles.logoImgMobile}
                      resizeMode="contain"
                      accessibilityLabel="Logo de WalkPets"
                    />
                  </View>
                </Flotar>
              </Aparecer>

              <Aparecer retraso={120} style={styles.heroTextosMobile}>
              {/* Propuesta de valor: el logo ya dice la marca, esto dice qué hace */}
              <Text style={styles.heroLead} accessibilityRole="header">
                Conectamos a dueños de mascotas con paseadores de confianza
              </Text>
              </Aparecer>

              {/* Beneficios rápidos */}
              <ChipsBeneficios />

              {/* =====================================================================
                  SECCIÓN DE VIDEO (carga diferida: miniatura → WebView al tocar)
                  ===================================================================== */}
              <View style={styles.videoSection}>
                <View style={styles.videoHeader}>
                  <Text style={styles.videoTitulo}>
                    ¿Por qué es importante pasear a tu mascota?
                  </Text>
                  <Text style={styles.videoSubtitulo}>
                    Un paseo diario mejora la salud física y mental de tu
                    amigo de 4 patas
                  </Text>
                </View>
                <View style={styles.videoContainer}>
                  <VideoYoutube
                    url={YOUTUBE_URL}
                    titulo="¿Por qué es importante pasear a tu mascota?"
                  />
                </View>
              </View>
            </View>
          ) : (
            /* ── MODO WIDE: columna izquierda + logo derecha ── */
            <>
              <Aparecer style={styles.heroLeftWide}>
                <View style={styles.heroTituloRow} accessibilityRole="header">
                  <Text style={styles.heroTituloWalk}>Walk </Text>
                  <Text style={styles.heroTituloPets}>Pets</Text>
                </View>
                <Text style={[styles.heroDescripcion, styles.heroDescripcionWide]}>
                  Conectamos a dueños de mascotas con paseadores de confianza
                </Text>

                {/* Beneficios rápidos */}
                <ChipsBeneficios alineados="inicio" />

                <View style={styles.ctaContainerWide}>
                  <BotonBuscar onPress={() => router.push("/paseadores")} />
                  <AppButton
                    label="Quiero ser paseador"
                    variante="outline"
                    onPress={() => router.push("/paseadores/registro")}
                    style={styles.ctaSecundario}
                    accessibilityHint="Abre el formulario de registro de paseadores"
                  />
                </View>
              </Aparecer>
              <Aparecer retraso={180} style={styles.logoWrapperWide}>
                <Flotar>
                <View
                  style={[
                    styles.logoRingWide,
                    {
                      width: logoSizeWide,
                      height: logoSizeWide,
                      borderRadius: logoSizeWide / 2,
                    },
                  ]}
                >
                  <Image
                    source={logo}
                    style={styles.logoImgWide}
                    resizeMode="cover"
                    accessibilityLabel="Logo de WalkPets"
                  />
                </View>
                </Flotar>
              </Aparecer>
            </>
          )}
        </View>
      </ScrollView>

      {/* =====================================================================
          BARRA DE ACCIÓN FIJA — al fondo (solo móvil)
          ===================================================================== */}
      {!isWide && (
        <View style={styles.barraAccion}>
          <BotonBuscar
            onPress={() => router.push("/paseadores")}
            style={{ flex: 1, width: "100%" }}
          />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// ESTILOS
// =============================================================================
const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.crema,
  },

  // ─── QUIÉNES SOMOS ────────────────────────────────────────────────
  quienesPanel: {
    backgroundColor: colors.verdePastel,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  quienesCard: {
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    width: "100%",
    maxWidth: 560,
    ...shadows.card,
  },
  quienesCerrar: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  quienesIcono: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.verdePastel,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  quienesTitulo: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.subtitulo,
    color: colors.verde,
    marginBottom: spacing.sm,
  },
  quienesTexto: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    textAlign: "center",
    lineHeight: 20,
  },
  quienesDivider: {
    width: "40%",
    height: 1,
    backgroundColor: colors.grisClaro,
    marginVertical: spacing.md,
  },
  quienesCreador: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.pesos.semi,
    color: colors.grisOscuro,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  quienesNombre: {
    fontSize: fonts.sizes.md + 1,
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
  },
  quienesSiguenos: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.pesos.semi,
    color: colors.grisOscuro,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  quienesRedes: {
    flexDirection: "row",
    gap: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  quienesRedCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.verdePastel,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.verdeMenta,
  },
  quienesCopy: {
    fontSize: fonts.sizes.xs,
    color: colors.grisOscuro,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  // ─── SCROLL ──────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },
  scrollContentWide: {
    paddingBottom: spacing.xxl,
  },

  // ─── HERO ────────────────────────────────────────────────────────────
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.crema,
  },
  heroSectionWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl + 8,
  },

  heroMobile: {
    alignItems: "center",
    width: "100%",
  },

  // Logo móvil: marco circular con el mismo tratamiento que en escritorio
  logoWrapper: {
    marginBottom: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: colors.verde,
    backgroundColor: colors.blanco,
    padding: 6,
    overflow: "hidden",
  },
  logoImgMobile: {
    width: "100%",
    height: "100%",
  },

  // Logo wide
  heroTextosMobile: {
    alignItems: "center",
  },
  heroLeftWide: {
    flex: 1,
    alignItems: "flex-start",
    paddingRight: spacing.xl,
  },
  logoWrapperWide: {
    flex: 1,
    alignItems: "center",
  },
  logoRingWide: {
    borderWidth: 4,
    borderColor: colors.verde,
    padding: 6,
    backgroundColor: colors.blanco,
  },
  logoImgWide: {
    width: "100%",
    height: "100%",
    borderRadius: 200,
  },

  heroTituloRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.sm,
  },
  heroTituloWalk: {
    fontSize: fonts.sizes.xxxl + 4,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.display,
    color: colors.negro,
    fontStyle: "italic",
  },
  heroTituloPets: {
    fontSize: fonts.sizes.xxxl + 4,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.display,
    color: colors.verdeOliva,
    fontStyle: "italic",
  },
  heroLead: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.subtitulo,
    color: colors.verdeOscuro,
    textAlign: "center",
    lineHeight: 29,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    maxWidth: 340,
  },
  heroDescripcion: {
    fontSize: fonts.sizes.md + 1,
    color: colors.grisOscuro,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: spacing.lg,
    maxWidth: 360,
  },
  heroDescripcionWide: {
    textAlign: "left",
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroChipsWide: {
    justifyContent: "flex-start",
  },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.lineaFuerte,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 2,
  },
  heroChipTexto: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.medio,
    color: colors.verdeOscuro,
  },

  // ─── SECCIÓN DE VIDEO ────────────────────────────────────────────────
  videoSection: {
    width: "100%",
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.verdePastel,
    ...shadows.card,
  },
  videoHeader: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  videoTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.subtitulo,
    color: colors.verde,
    marginBottom: spacing.xs + 2,
    textAlign: "left",
  },
  videoSubtitulo: {
    fontSize: fonts.sizes.sm - 1,
    color: colors.grisOscuro,
    lineHeight: 18,
    textAlign: "left",
  },
  videoContainer: {
    width: "100%",
    height: 220,
    backgroundColor: colors.negro,
  },

  ctaContainerWide: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    flexWrap: "wrap",
    marginTop: spacing.lg,
  },
  ctaSecundario: {
    minWidth: 220,
  },

  // ─── BARRA DE ACCIÓN FIJA (solo móvil) ───────────────────────────
  // Fondo sólido del color de la pantalla + filete superior: el contenido que
  // pasa por detrás no se mezcla con el botón.
  barraAccion: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.sm + 4,
    backgroundColor: colors.crema,
    borderTopWidth: 1,
    borderTopColor: colors.linea,
  },
});
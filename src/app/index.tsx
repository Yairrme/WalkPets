import { Entypo, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
import { WebView } from "react-native-webview";
import { colors, fonts, radius, shadows, spacing } from "../constants/theme";

// Logo circular de la marca
const logo = require("../../assets/Logo Walk Pets.png");

export default function Inicio() {
  const [mostrarQuienes, setMostrarQuienes] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  // ▶ Pegá tu URL de YouTube acá (el ID se extrae automáticamente)
  const youtubeUrl = "https://www.youtube.com/watch?v=plJUSgZ0guc";
  const videoId = youtubeUrl.split("v=")[1]?.split("&")[0] ?? "";
  // HTML inline para controlar el embed al 100% y evitar videos relacionados
  const htmlVideo = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * { margin: 0; padding: 0; background: #000; }
          body { width: 100%; height: 100%; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&showinfo=0&disablekb=0"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      </body>
    </html>
  `;

  return (
    <View style={styles.pantalla}>
      {/* =====================================================================
          BARRA DE NAVEGACIÓN SUPERIOR
          ===================================================================== */}
      <View style={styles.navbar}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBrandGroup} activeOpacity={0.9}>
            <View>
              <View style={styles.navBrand}>
                <Text style={styles.navTituloWalk}>Walk</Text>
                <Text style={styles.navTituloPets}>Pets</Text>
              </View>
              <Text style={styles.navSubtitulo}>PASEADORES</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.navBotones}>
            {isWide && (
              <>
                <TouchableOpacity
                  style={styles.navBtnQuienes}
                  onPress={() => setMostrarQuienes(!mostrarQuienes)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.navBtnQuienesTxt,
                    mostrarQuienes && { color: "rgba(255, 255, 255, 0.6)" }
                  ]}>Quiénes somos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navBtnRegistro}
                  activeOpacity={0.8}
                  onPress={() => router.push("/paseadores/registro")}
                >
                  <Text style={styles.navBtnRegistroTxt}>Regístrate</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.navBtnSesion}
              activeOpacity={0.8}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.navBtnSesionTxt}>{isWide ? "Iniciar sesión" : "Entrar"}</Text>
            </TouchableOpacity>
            {!isWide && (
              <TouchableOpacity onPress={() => setMenuAbierto(!menuAbierto)} style={{ marginLeft: 8, padding: 4 }}>
                <Entypo name="menu" size={32} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Menú móvil desplegable */}
      {!isWide && menuAbierto && (
        <View style={styles.mobileMenu}>
          {/* 1. Quiero ser paseador */}
          <TouchableOpacity
            style={styles.mobileMenuBtn}
            onPress={() => {
              setMenuAbierto(false);
              router.push("/paseadores/registro");
            }}
          >
            <FontAwesome name="paw" size={15} color={colors.blanco} style={{ marginRight: 10 }} />
            <Text style={styles.mobileMenuBtnTxt}>Quiero ser paseador</Text>
          </TouchableOpacity>
          <View style={styles.mobileMenuDivider} />
          {/* 2. Quiénes somos */}
          <TouchableOpacity
            style={styles.mobileMenuBtn}
            onPress={() => {
              setMenuAbierto(false);
              setMostrarQuienes(!mostrarQuienes);
            }}
          >
            <Entypo name="info-with-circle" size={15} color={colors.blanco} style={{ marginRight: 10 }} />
            <Text style={styles.mobileMenuBtnTxt}>Quiénes somos</Text>
          </TouchableOpacity>
          <View style={styles.mobileMenuDivider} />
          {/* 3. Regístrate */}
          <TouchableOpacity
            style={styles.mobileMenuBtn}
            onPress={() => {
              setMenuAbierto(false);
              router.push("/paseadores/registro");
            }}
          >
            <Entypo name="add-user" size={15} color={colors.blanco} style={{ marginRight: 10 }} />
            <Text style={styles.mobileMenuBtnTxt}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Panel desplegable: Quiénes somos */}
      {mostrarQuienes && (
        <View style={styles.quienesPanel}>
          <View style={styles.quienesCard}>
            <TouchableOpacity
              style={{ position: "absolute", top: 8, right: 8, padding: 8, zIndex: 10 }}
              onPress={() => setMostrarQuienes(false)}
            >
              <Entypo name="cross" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.quienesEmoji}>🐾</Text>
            <Text style={styles.quienesTitulo}>Sobre WalkPets</Text>
            <Text style={styles.quienesTexto}>
              WalkPets es una plataforma que conecta dueños de mascotas con paseadores profesionales de confianza en Cipolletti. Nuestro objetivo es garantizar paseos seguros, felices y al mejor precio.
            </Text>
            <View style={styles.quienesDivider} />
            <Text style={styles.quienesCreador}>Creado por</Text>
            <Text style={styles.quienesNombre}>Yair Melinguer</Text>
            <View style={styles.quienesDivider} />
            {/* Redes sociales */}
            <Text style={styles.quienesSiguenos}>Síguenos en</Text>
            <View style={styles.quienesRedes}>
              <TouchableOpacity onPress={() => Linking.openURL("https://instagram.com")} activeOpacity={0.7}>
                <View style={styles.quienesRedCircle}>
                  <Entypo name="instagram" size={20} color={colors.verde} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("https://linkedin.com")} activeOpacity={0.7}>
                <View style={styles.quienesRedCircle}>
                  <Entypo name="linkedin" size={20} color={colors.verde} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("https://x.com")} activeOpacity={0.7}>
                <View style={styles.quienesRedCircle}>
                  <FontAwesome name="twitter" size={20} color={colors.verde} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL("https://wa.me/5490000000000")} activeOpacity={0.7}>
                <View style={styles.quienesRedCircle}>
                  <FontAwesome name="whatsapp" size={20} color={colors.verde} />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.quienesCopy}>© 2026 WalkPets · Hecho con ❤️ en Cipolletti</Text>
          </View>
        </View>
      )}

      {/* =====================================================================
          HERO PRINCIPAL
          ===================================================================== */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, isWide && styles.heroSectionWide]}>
          {!isWide ? (
            /* ── MODO MÓVIL: centrado, logo arriba del texto ── */
            <View style={styles.heroMobile}>
              {/* Logo circular grande */}
              <View style={styles.logoWrapper}>
                <Image source={logo} style={styles.logoImgMobile} resizeMode="contain" />
              </View>

              {/* Descripción */}
              <Text style={styles.heroDescripcion}>
                Conectamos a dueños de{"\n"}mascotas con paseadores de{"\n"}confianza
              </Text>

              {/* =====================================================================
                  SECCIÓN DE VIDEO
                  ===================================================================== */}
              <View style={styles.videoSection}>
                <View style={styles.videoHeader}>
                  <Text style={styles.videoTitulo}>🐾 ¿Por qué es importante pasear a tu mascota?</Text>
                  <Text style={styles.videoSubtitulo}>Un paseo diario mejora la salud física y mental de tu amigo de 4 patas</Text>
                </View>
                <View style={styles.videoContainer}>
                  <WebView
                    originWhitelist={['*']}
                    source={{ html: htmlVideo }}
                    style={styles.video}
                    allowsFullscreenVideo
                    javaScriptEnabled
                    domStorageEnabled
                    scrollEnabled={false}
                    bounces={false}
                  />
                </View>
              </View>
            </View>
          ) : (
            /* ── MODO WIDE: columna izquierda + logo derecha ── */
            <>
              <View style={styles.heroLeftWide}>
                <View style={styles.heroTituloRow}>
                  <Text style={styles.heroTituloWalk}>Walk </Text>
                  <Text style={styles.heroTituloPets}>Pets</Text>
                </View>
                <Text style={styles.heroDescripcion}>
                  Conectamos a dueños de{"\n"}mascotas con paseadores de{"\n"}confianza
                </Text>
                <View style={styles.ctaContainerWide}>
                  <TouchableOpacity
                    style={styles.btnPrimario}
                    onPress={() => router.push("/paseadores")}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnPrimarioTxt}>Buscar paseadores</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnSecundario}
                    onPress={() => router.push("/paseadores/registro")}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnSecundarioTxt}>Quiero ser paseador</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.logoWrapperWide}>
                <View style={styles.logoRingWide}>
                  <Image source={logo} style={styles.logoImgWide} resizeMode="cover" />
                </View>
              </View>
            </>
          )}
        </View>

      </ScrollView>

      {/* =====================================================================
          BOTÓN LIQUID GLASS — flotante al fondo (solo móvil)
          ===================================================================== */}
      {!isWide && (
        <View style={styles.liquidGlassBar}>
          <TouchableOpacity
            style={styles.liquidBtnPrimario}
            onPress={() => router.push("/paseadores")}
            activeOpacity={0.82}
          >
            <Entypo name="magnifying-glass" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.liquidBtnPrimarioTxt}>Buscar paseadores</Text>
          </TouchableOpacity>
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

  // ─── NAVBAR ──────────────────────────────────────────────────────────
  navbar: {
    paddingHorizontal: spacing.md + 4,
    paddingTop: Platform.OS === "ios" ? 54 : 38,
    paddingBottom: spacing.sm + 4,
    backgroundColor: "rgba(86, 90, 33, 1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: -6,
  },
  navBrand: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  navTituloWalk: {
    fontSize: fonts.sizes.lg + 4,
    fontWeight: "900",
    color: colors.blanco,
  },
  navTituloPets: {
    fontSize: fonts.sizes.lg + 4,
    fontWeight: "900",
    color: colors.blanco,
    marginLeft: 2,
  },
  navSubtitulo: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 3,
    marginTop: -2,
  },
  navBotones: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  navBtnQuienes: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  navBtnQuienesTxt: {
    fontSize: fonts.sizes.sm - 1,
    fontWeight: "600",
    color: colors.blanco,
  },
  navBtnRegistro: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.blanco,
  },
  navBtnRegistroTxt: {
    color: colors.blanco,
    fontSize: fonts.sizes.sm - 1,
    fontWeight: "700",
  },
  navBtnSesion: {
    backgroundColor: colors.blanco,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  navBtnSesionTxt: {
    color: "rgba(86, 90, 33, 1)",
    fontSize: fonts.sizes.sm - 1,
    fontWeight: "700",
  },

  mobileMenu: {
    backgroundColor: "rgba(86, 90, 33, 1)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  mobileMenuBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
  },
  mobileMenuBtnTxt: {
    color: colors.blanco,
    fontSize: fonts.sizes.md,
    fontWeight: "600",
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: spacing.xs,
  },

  // ─── QUIÉNES SOMOS ────────────────────────────────────────────────
  quienesPanel: {
    backgroundColor: colors.verdePastel,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  quienesCard: {
    backgroundColor: colors.blanco,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.card,
  },
  quienesEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  quienesTitulo: {
    fontSize: fonts.sizes.lg,
    fontWeight: "800",
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
    fontWeight: "600",
    color: colors.grisOscuro,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  quienesNombre: {
    fontSize: fonts.sizes.md + 1,
    fontWeight: "800",
    color: colors.verde,
  },
  quienesRol: {
    fontSize: fonts.sizes.xs,
    color: colors.verdeClaro,
    fontWeight: "600",
    marginTop: 2,
  },
  quienesSiguenos: {
    fontSize: fonts.sizes.xs + 1,
    fontWeight: "700",
    color: colors.grisOscuro,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  quienesRedes: {
    flexDirection: "row",
    gap: spacing.sm + 4,
    marginBottom: spacing.sm,
  },
  quienesRedCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingBottom: 140,
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl + 8,
  },

  heroMobile: {
    alignItems: "center",
    width: "100%",
  },

  // Logo móvil
  logoWrapper: {
    width: 340,
    height: 340,
    marginBottom: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImgMobile: {
    width: "100%",
    height: "100%",
  },

  // Logo wide
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
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 4,
    borderColor: colors.verde,
    padding: 6,
    backgroundColor: colors.blanco,
    ...shadows.card,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
    fontWeight: "900",
    color: colors.negro,
    fontStyle: "italic",
  },
  heroTituloPets: {
    fontSize: fonts.sizes.xxxl + 4,
    fontWeight: "900",
    color: "rgba(86, 90, 33, 1)",
    fontStyle: "italic",
  },
  heroDescripcion: {
    fontSize: fonts.sizes.md + 1,
    color: colors.grisOscuro,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: spacing.md,
  },

  // ─── SECCIÓN DE VIDEO ────────────────────────────────────────────────
  videoSection: {
    width: "100%",
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.verdePastel,
    ...shadows.card,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  videoHeader: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  videoTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: "800",
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
  video: {
    width: "100%",
    height: "100%",
  },

  ctaContainerWide: {
    flexDirection: "row",
    gap: spacing.sm + 4,
    flexWrap: "wrap",
    marginTop: spacing.lg,
  },
  btnPrimario: {
    backgroundColor: colors.negro,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm + 2,
    alignItems: "center",
    ...shadows.card,
  },
  btnPrimarioTxt: {
    color: colors.blanco,
    fontSize: fonts.sizes.sm + 1,
    fontWeight: "700",
  },
  btnSecundario: {
    backgroundColor: colors.blanco,
    borderWidth: 1.5,
    borderColor: colors.grisOscuro,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm + 2,
    alignItems: "center",
  },
  btnSecundarioTxt: {
    color: colors.negro,
    fontSize: fonts.sizes.sm + 1,
    fontWeight: "600",
  },

  // ─── LIQUID GLASS BAR (solo móvil) ────────────────────────────────
  liquidGlassBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.md,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    gap: spacing.sm,
    shadowColor: "#3D5A1E",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  liquidBtnPrimario: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(86, 90, 33, 0.92)",
    borderRadius: radius.xl,
    paddingVertical: spacing.md + 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#3D5A1E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  liquidBtnPrimarioTxt: {
    color: "#fff",
    fontSize: fonts.sizes.md,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  liquidBtnSecundario: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: "rgba(86,90,33,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  liquidBtnSecundarioTxt: {
    color: "rgba(86,90,33,1)",
    fontSize: fonts.sizes.md,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

});

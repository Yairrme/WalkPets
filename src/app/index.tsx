import { Entypo, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { colors, fonts, radius, shadows, spacing } from "../constants/theme";

// Logo circular de la marca
const logo = require("../../assets/images/branding/logo.png");

export default function Inicio() {
  const [mostrarQuienes, setMostrarQuienes] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  return (
    <View style={styles.pantalla}>
      {/* =====================================================================
          BARRA DE NAVEGACIÓN SUPERIOR
          ===================================================================== */}
      <View style={styles.navbar}>
        {/* Fila principal: Logo + Botones */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBrandGroup} activeOpacity={0.9}>
            <View style={styles.navLogoMini}>
              <Image source={logo} style={styles.navLogoMiniImg} resizeMode="cover" />
            </View>
            <View>
              <View style={styles.navBrand}>
                <Text style={styles.navTituloWalk}>Walk</Text>
                <Text style={styles.navTituloPets}>Pets</Text>
              </View>
              <Text style={styles.navSubtitulo}>PASEADORES</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.navBotones}>
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
            <TouchableOpacity style={styles.navBtnRegistro} activeOpacity={0.8}>
              <Text style={styles.navBtnRegistroTxt}>Regístrate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtnSesion} activeOpacity={0.8}>
              <Text style={styles.navBtnSesionTxt}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Panel desplegable: Quiénes somos */}
      {mostrarQuienes && (
        <View style={styles.quienesPanel}>
          <View style={styles.quienesCard}>
            <Text style={styles.quienesEmoji}>🐾</Text>
            <Text style={styles.quienesTitulo}>Sobre WalkPets</Text>
            <Text style={styles.quienesTexto}>
              WalkPets es una plataforma que conecta dueños de mascotas con paseadores profesionales de confianza en Cipolletti. Nuestro objetivo es garantizar paseos seguros, felices y al mejor precio.
            </Text>
            <View style={styles.quienesDivider} />
            <Text style={styles.quienesCreador}>Creado por</Text>
            <Text style={styles.quienesNombre}>Yair Melinguer</Text>
            <Text style={styles.quienesRol}>Fundador & Desarrollador</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================================
            SECCIÓN HERO — Texto a la izquierda + Logo a la derecha
            ===================================================================== */}
        <View style={[styles.heroSection, isWide && styles.heroSectionWide]}>
          {/* Columna izquierda: Texto + CTAs */}
          <View style={[styles.heroLeft, isWide && styles.heroLeftWide]}>
            <View style={styles.heroTituloRow}>
              <Text style={styles.heroTituloWalk}>Walk </Text>
              <Text style={styles.heroTituloPets}>Pets</Text>
            </View>
            <Text style={styles.heroDescripcion}>
              Conectamos a dueños de{"\n"}mascotas con paseadores de{"\n"}confianza
            </Text>

            {/* Botones de acción en fila */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.btnPrimario}
                onPress={() => router.push("/paseadores")}
                activeOpacity={0.85}
              >
                <Text style={styles.btnPrimarioTxt}>Buscar paseadores disponibles</Text>
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

          {/* Columna derecha: Logo circular */}
          <View style={[styles.logoWrapper, isWide && styles.logoWrapperWide]}>
            <View style={[styles.logoRing, isWide && styles.logoRingWide]}>
              <Image source={logo} style={styles.logoImg} resizeMode="cover" />
            </View>
          </View>
        </View>
        {/* =====================================================================
            FOOTER
            ===================================================================== */}
        <View style={styles.footerAccent} />

        <View style={styles.footer}>
          {/* Fila principal */}
          <View style={styles.footerRow}>
            <Text style={styles.footerTitulo}>Síguenos en</Text>

            <View style={styles.footerIconos}>
              {/* Instagram */}
              <TouchableOpacity
                onPress={() => Linking.openURL("https://instagram.com")}
                activeOpacity={0.7}
              >
                <View style={styles.socialCircle}>
                  <Entypo name="instagram" size={22} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity
                onPress={() => Linking.openURL("https://linkedin.com")}
                activeOpacity={0.7}
              >
                <View style={styles.socialCircle}>
                  <Entypo name="linkedin" size={22} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* X / Twitter */}
              <TouchableOpacity
                onPress={() => Linking.openURL("https://x.com")}
                activeOpacity={0.7}
              >
                <View style={styles.socialCircle}>
                  <FontAwesome name="twitter" size={22} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity
                onPress={() => Linking.openURL("https://wa.me/5490000000000")}
                activeOpacity={0.7}
              >
                <View style={styles.socialCircle}>
                  <FontAwesome name="whatsapp" size={22} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerDivider} />

          {/* Fila inferior: Branding + Copyright */}
          <View style={styles.footerBottom}>
            <View style={styles.footerBrandRow}>
              <Text style={styles.footerPaw}>🐾</Text>
              <Text style={styles.footerBrandWalk}>Walk</Text>
              <Text style={styles.footerBrandPets}>Pets</Text>
            </View>
            <Text style={styles.footerCopy}>
              © 2026 WalkPets · Hecho con ❤️ en Cipolletti
            </Text>
          </View>
        </View>
      </ScrollView>
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
  // 👇 AQUÍ AJUSTAS LA POSICIÓN DE TODO EL LOGO Y TEXTO (Subir/Bajar)
  navBrandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: -6, // ← Cambia a un número más negativo para subir, o positivo para bajar
  },

  // 👇 AQUÍ AJUSTAS EL TAMASÑO DEL MINI LOGO
  navLogoMini: {
    width: 50, // ← Ancho del logo (antes era 36)
    height: 50, // ← Alto del logo (antes era 36)
    borderRadius: 25, // ← Debe ser la mitad del tamaño (44 / 2) para ser redondo
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.blanco,
  },
  navLogoMiniImg: {
    width: "100%",
    height: "100%",
  },
  navBrand: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  // 👇 AQUÍ AJUSTAS EL TEXTO "Walk"
  navTituloWalk: {
    fontSize: fonts.sizes.lg + 4, // ← Tamaño de fuente de "Walk"
    fontWeight: "900",
    color: colors.blanco,
  },

  // 👇 AQUÍ AJUSTAS EL TEXTO "Pets"
  navTituloPets: {
    fontSize: fonts.sizes.lg + 4, // ← Tamaño de fuente de "Pets"
    fontWeight: "900",
    color: colors.blanco,
    marginLeft: 2,
  },

  // 👇 AQUÍ AJUSTAS EL TEXTITO DE ABAJO ("PASEADORES")
  navSubtitulo: {
    fontSize: 9, // ← Tamaño de fuente
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 3,
    marginTop: -2, // ← Cambia esto para subir o bajar la palabra "Paseadores"
  },
  navBotones: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 4,
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

  // ─── QUIÉNES SOMOS (panel desplegable) ────────────────────────────
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

  // ─── SCROLL ──────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ─── HERO ────────────────────────────────────────────────────────────
  heroSection: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.xl,
    backgroundColor: colors.crema,
    gap: spacing.lg,
  },
  heroSectionWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl + 8,
  },

  // Columna izquierda: Texto + CTAs
  heroLeft: {
    alignItems: "flex-start",
    flex: 1,
  },
  heroLeftWide: {
    paddingRight: spacing.xl,
  },

  heroTituloRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.sm,
  },
  heroTituloWalk: {
    fontSize: fonts.sizes.xxxl + 2,
    fontWeight: "900",
    color: colors.negro,
    fontStyle: "italic",
  },
  heroTituloPets: {
    fontSize: fonts.sizes.xxxl + 2,
    fontWeight: "900",
    color: "rgba(86, 90, 33, 1)",
    fontStyle: "italic",
  },
  heroDescripcion: {
    fontSize: fonts.sizes.md + 1,
    color: colors.grisOscuro,
    textAlign: "left",
    lineHeight: 24,
    marginBottom: spacing.lg,
  },

  // CTAs en fila
  ctaContainer: {
    flexDirection: "row",
    gap: spacing.sm + 4,
    flexWrap: "wrap",
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

  // Columna derecha: Logo
  logoWrapper: {
    alignItems: "flex-start",
  },
  logoWrapperWide: {
    flex: 1,
    alignItems: "flex-start",
  },
  logoRing: {
    width: 290,
    height: 290,
    borderRadius: 130,
    borderWidth: 4,
    borderColor: colors.verde,
    padding: 6,
    backgroundColor: colors.blanco,
    ...shadows.card,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoRingWide: {
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  logoImg: {
    width: "100%",
    height: "100%",
    borderRadius: 200,
  },

  // ─── FOOTER ──────────────────────────────────────────────────────────
  footerAccent: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  footer: {
    backgroundColor: "rgba(86, 90, 33, 1)",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg + 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  footerTitulo: {
    fontSize: fonts.sizes.md,
    fontWeight: "700",
    fontStyle: "italic",
    color: colors.blanco,
  },
  footerIconos: {
    flexDirection: "row",
    gap: spacing.sm + 4,
  },
  socialCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  socialIcon: {
    fontSize: 16,
    color: colors.blanco,
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: spacing.md,
  },
  footerBottom: {
    alignItems: "center",
  },
  footerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs + 2,
  },
  footerPaw: {
    fontSize: 14,
  },
  footerBrandWalk: {
    fontSize: fonts.sizes.sm,
    fontWeight: "800",
    color: colors.blanco,
  },
  footerBrandPets: {
    fontSize: fonts.sizes.sm,
    fontWeight: "800",
    color: "rgba(255,255,255,0.8)",
  },
  footerCopy: {
    fontSize: fonts.sizes.xs - 1,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
});

import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { colors, fonts, radius, shadows, spacing } from "../constants/theme";

type Rol = "usuario" | "paseador";

export default function LoginScreen() {
  const [rol, setRol] = useState<Rol>("usuario");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [cargando, setCargando] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  // Lógica de inicio de sesión simulada
  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      if (Platform.OS === "web") {
        alert("Por favor, ingresá tu correo electrónico y contraseña.");
      } else {
        Alert.alert("Campos incompletos", "Por favor, ingresá tu correo electrónico y contraseña.");
      }
      return;
    }

    setCargando(true);
    // Simulamos verificación en servidor de 1.2 segundos
    setTimeout(() => {
      setCargando(false);
      const mensaje =
        rol === "usuario"
          ? "¡Bienvenido/a de nuevo! Encontrá a tu paseador ideal."
          : "¡Hola Paseador! Accediendo a tu panel de gestión y turnos.";

      if (Platform.OS === "web") {
        alert(mensaje);
        router.push("/paseadores");
      } else {
        Alert.alert("¡Sesión iniciada!", mensaje, [
          { text: "Continuar", onPress: () => router.push("/paseadores") },
        ]);
      }
    }, 1200);
  };

  // Autocompletar con credenciales de prueba para facilitar revisión/evaluación
  const rellenarDemo = (tipo: Rol) => {
    setRol(tipo);
    if (tipo === "usuario") {
      setEmail("dueno@walkpets.com");
      setPassword("mascotas123");
    } else {
      setEmail("juan.perez@walkpets.com");
      setPassword("paseadorpro2026");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollWide]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===================================================================
            ENCABEZADO DE SALUDO E INTRODUCCIÓN
            =================================================================== */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <FontAwesome
              name={rol === "usuario" ? "paw" : "user-circle"}
              size={36}
              color={rol === "usuario" ? colors.verde : colors.naranja}
            />
          </View>
          <Text style={styles.titulo}>¡Bienvenido a WalkPets!</Text>
          <Text style={styles.subtitulo}>
            {rol === "usuario"
              ? "Encontrá al paseador ideal para tu mejor amigo y reservá turnos con total confianza."
              : "Accedé a tu panel profesional, gestioná tus paseos diarios y conectá con nuevos clientes."}
          </Text>
        </View>

        {/* ===================================================================
            SELECTOR DE ROL (DUEÑO DE MASCOTA vs PASEADOR)
            =================================================================== */}
        <View style={styles.switcherContainer}>
          <TouchableOpacity
            style={[
              styles.switcherBtn,
              rol === "usuario" && styles.switcherBtnActivoUsuario,
            ]}
            onPress={() => setRol("usuario")}
            activeOpacity={0.9}
          >
            <Text style={[styles.switcherIcon, rol === "usuario" && { color: colors.blanco }]}>
              🐾
            </Text>
            <Text
              style={[
                styles.switcherTxt,
                rol === "usuario" && styles.switcherTxtActivo,
              ]}
            >
              Dueño de Mascota
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switcherBtn,
              rol === "paseador" && styles.switcherBtnActivoPaseador,
            ]}
            onPress={() => setRol("paseador")}
            activeOpacity={0.9}
          >
            <Text style={[styles.switcherIcon, rol === "paseador" && { color: colors.blanco }]}>
              🦮
            </Text>
            <Text
              style={[
                styles.switcherTxt,
                rol === "paseador" && styles.switcherTxtActivo,
              ]}
            >
              Soy Paseador
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===================================================================
            TARJETA FORMULARIO DE INICIO DE SESIÓN
            =================================================================== */}
        <View style={[styles.card, isWide && styles.cardWide]}>
          {/* Indicador de rol dentro del card */}
          <View style={styles.badgeRol}>
            <Text style={styles.badgeRolTxt}>
              {rol === "usuario" ? "Iniciando como Dueño" : "Iniciando como Paseador Profesional"}
            </Text>
          </View>

          {/* Campo: Correo Electrónico */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color={colors.grisOscuro} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={rol === "usuario" ? "ejemplo@correo.com" : "tu.nombre@walkpets.com"}
                placeholderTextColor={colors.grisMedio}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Campo: Contraseña */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color={colors.grisOscuro} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor={colors.grisMedio}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Entypo
                  name={showPassword ? "eye-with-line" : "eye"}
                  size={20}
                  color={colors.grisOscuro}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Opciones adicionales: Recordar y Olvidé contraseña */}
          <View style={styles.opcionesRow}>
            <TouchableOpacity
              style={styles.checkGroup}
              onPress={() => setRecordar(!recordar)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, recordar && styles.checkboxActivo]}>
                {recordar && <FontAwesome name="check" size={12} color={colors.blanco} />}
              </View>
              <Text style={styles.checkTxt}>Recordar mi sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "web") {
                  alert("Te enviamos las instrucciones para restablecer tu contraseña a tu correo.");
                } else {
                  Alert.alert("Recuperar contraseña", "Te enviamos las instrucciones a tu correo.");
                }
              }}
            >
              <Text style={styles.forgotTxt}>¿Olvidaste tu clave?</Text>
            </TouchableOpacity>
          </View>

          {/* Botón Principal de Submit */}
          <AppButton
            label={rol === "usuario" ? "Entrar como Dueño" : "Entrar al Panel Pro"}
            onPress={handleLogin}
            cargando={cargando}
            variante={rol === "usuario" ? "primario" : "secundario"}
            style={rol === "paseador" ? styles.btnPaseador : undefined}
          />

          {/* =================================================================
              SECCIÓN DE DEMO RÁPIDO (PARA FACILITAR EVALUACIÓN/PRUEBAS)
              ================================================================= */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>💡 ¿Querés probar rápido (Modo Demo)?</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => rellenarDemo("usuario")}
              >
                <Text style={styles.demoBtnTxt}>🐕 Probar Dueño</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoBtn, styles.demoBtnPaseador]}
                onPress={() => rellenarDemo("paseador")}
              >
                <Text style={[styles.demoBtnTxt, { color: colors.naranja }]}>🦮 Probar Paseador</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ===================================================================
            PIE DE PÁGINA / REGISTRO
            =================================================================== */}
        <View style={styles.footer}>
          {rol === "paseador" ? (
            <View style={styles.footerRow}>
              <Text style={styles.footerTxt}>¿Querés sumar tu servicio a WalkPets?</Text>
              <TouchableOpacity onPress={() => router.push("/paseadores/registro")}>
                <Text style={styles.footerLink}>Regístrate como Paseador</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.footerRow}>
              <Text style={styles.footerTxt}>¿Todavía no tenés cuenta de dueño?</Text>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === "web") {
                    alert("¡Podés explorar y buscar paseadores libres sin registrarte! Cuando elijas uno, te pediremos tus datos básicos.");
                    router.push("/paseadores");
                  } else {
                    Alert.alert(
                      "Exploración libre",
                      "¡Podés explorar y buscar paseadores sin registrarte! Te pediremos tus datos al momento de reservar.",
                      [{ text: "Ver paseadores", onPress: () => router.push("/paseadores") }]
                    );
                  }
                }}
              >
                <Text style={styles.footerLink}>Explorar paseadores gratis</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.crema,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  scrollWide: {
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
    maxWidth: 500,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.blanco,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadows.card,
  },
  titulo: {
    fontSize: fonts.sizes.xxl,
    fontWeight: "800",
    color: colors.negro,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  switcherContainer: {
    flexDirection: "row",
    backgroundColor: colors.grisClaro,
    borderRadius: radius.full,
    padding: 5,
    marginBottom: spacing.xl,
    width: "100%",
    maxWidth: 480,
    ...shadows.card,
  },
  switcherBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radius.full,
    gap: 8,
  },
  switcherBtnActivoUsuario: {
    backgroundColor: colors.verde,
    ...shadows.card,
  },
  switcherBtnActivoPaseador: {
    backgroundColor: colors.naranja,
    ...shadows.card,
  },
  switcherIcon: {
    fontSize: 16,
  },
  switcherTxt: {
    fontSize: fonts.sizes.sm,
    fontWeight: "700",
    color: colors.negro,
  },
  switcherTxtActivo: {
    color: colors.blanco,
  },
  card: {
    backgroundColor: colors.blanco,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 480,
    ...shadows.card,
    shadowOpacity: 0.12,
  },
  cardWide: {
    padding: spacing.xxl,
  },
  badgeRol: {
    alignSelf: "center",
    backgroundColor: colors.verdePastel,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  badgeRolTxt: {
    fontSize: fonts.sizes.xs,
    fontWeight: "700",
    color: colors.verde,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: "700",
    color: colors.negro,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.grisClaro,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.negro,
    height: "100%",
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  opcionesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  checkGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.grisMedio,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blanco,
  },
  checkboxActivo: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
  },
  checkTxt: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  forgotTxt: {
    fontSize: fonts.sizes.sm,
    color: colors.verde,
    fontWeight: "700",
  },
  btnPaseador: {
    backgroundColor: colors.naranja,
  },
  demoSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.grisClaro,
    alignItems: "center",
  },
  demoTitle: {
    fontSize: fonts.sizes.xs,
    color: colors.grisOscuro,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  demoButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  demoBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.verdePastel,
    borderWidth: 1,
    borderColor: colors.verde,
  },
  demoBtnPaseador: {
    backgroundColor: colors.naranjaClaro,
    borderColor: colors.naranja,
  },
  demoBtnTxt: {
    fontSize: fonts.sizes.xs,
    fontWeight: "700",
    color: colors.verde,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  footerRow: {
    alignItems: "center",
    gap: spacing.xs,
  },
  footerTxt: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  footerLink: {
    fontSize: fonts.sizes.md,
    fontWeight: "800",
    color: colors.verde,
    textDecorationLine: "underline",
  },
});

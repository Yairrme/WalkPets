import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { colors, fonts, radius, shadows, spacing } from "../src/constants/theme";
import { useSesion } from "../src/context/SesionContext";
import {
  CREDENCIALES_DEMO,
  esModoDemo,
  iniciarSesion,
  registrarCuentaCliente,
} from "../src/services/auth.service";
import { normalizarTelefono } from "../src/utils/telefono";

type Modo = "login" | "registro";

export default function LoginScreen() {
  const { sesion, iniciar, cerrar } = useSesion();

  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const modoDemo = esModoDemo();

  const limpiarFormulario = () => {
    setError(null);
    setPassword("");
  };

  const cambiarModo = (nuevo: Modo) => {
    setModo(nuevo);
    limpiarFormulario();
  };

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError("Ingresá tu correo electrónico y contraseña.");
      return;
    }

    setCargando(true);
    try {
      const nueva = await iniciarSesion({ email, password });
      iniciar(nueva);
      router.push("/paseadores");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  const handleRegistro = async () => {
    setError(null);

    const errores: string[] = [];
    if (!nombre.trim()) errores.push("el nombre");
    if (!apellido.trim()) errores.push("el apellido");
    if (!email.trim()) errores.push("el correo");
    if (!password) errores.push("la contraseña");

    if (errores.length > 0) {
      setError(`Completá ${errores.join(", ")}.`);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    let telefonoNormalizado: string | undefined;
    if (telefono.trim()) {
      const normalizado = normalizarTelefono(telefono);
      if (!normalizado) {
        setError("Ingresá un teléfono válido (ej. +54 299 4123456) o dejalo vacío.");
        return;
      }
      telefonoNormalizado = `+${normalizado}`;
    }

    setCargando(true);
    try {
      const nueva = await registrarCuentaCliente({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email,
        password,
        telefono: telefonoNormalizado,
      });
      iniciar(nueva);
      router.push("/paseadores");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  const rellenarDemo = (tipo: "cliente" | "paseador") => {
    setModo("login");
    setError(null);
    setEmail(CREDENCIALES_DEMO[tipo].email);
    setPassword(CREDENCIALES_DEMO[tipo].password);
  };

  // Sesión activa: mostramos el resumen y las acciones disponibles por rol.
  if (sesion) {
    const esPaseador = sesion.usuario.rol === "paseador";

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoCircle}>
          <FontAwesome name="check-circle" size={36} color={colors.verde} />
        </View>
        <Text style={styles.titulo}>Sesión iniciada</Text>
        <Text style={styles.subtitulo}>
          {sesion.usuario.nombre} {sesion.usuario.apellido} ·{" "}
          {esPaseador ? "Paseador" : "Cliente"}
        </Text>
        <Text style={styles.sesionEmail}>{sesion.usuario.email}</Text>

        <View style={styles.sesionAcciones}>
          <AppButton
            label="Ver paseadores"
            onPress={() => router.push("/paseadores")}
          />
          {esPaseador && (
            <AppButton
              label="Mis reseñas"
              variante="secundario"
              onPress={() => router.push("/mis-resenas")}
            />
          )}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await cerrar();
              setEmail("");
              setPassword("");
              setModo("login");
            }}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Text style={styles.logoutTxt}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollWide]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <FontAwesome name="paw" size={36} color={colors.verde} />
          </View>
          <Text style={styles.titulo}>
            {modo === "login" ? "¡Bienvenido a WalkPets!" : "Creá tu cuenta"}
          </Text>
          <Text style={styles.subtitulo}>
            {modo === "login"
              ? "Ingresá para publicar reseñas y contactar a paseadores de Cipolletti y Neuquén."
              : "Registrate como cliente para dejar reseñas de los paseadores que contrataste."}
          </Text>
        </View>

        <View style={styles.switcherContainer}>
          <TouchableOpacity
            style={[styles.switcherBtn, modo === "login" && styles.switcherBtnActivo]}
            onPress={() => cambiarModo("login")}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
            accessibilityState={{ selected: modo === "login" }}
          >
            <Text style={[styles.switcherTxt, modo === "login" && styles.switcherTxtActivo]}>
              Ingresar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switcherBtn, modo === "registro" && styles.switcherBtnActivo]}
            onPress={() => cambiarModo("registro")}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Crear cuenta de cliente"
            accessibilityState={{ selected: modo === "registro" }}
          >
            <Text style={[styles.switcherTxt, modo === "registro" && styles.switcherTxtActivo]}>
              Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, isWide && styles.cardWide]}>
          <View style={styles.badgeRol}>
            <Text style={styles.badgeRolTxt}>
              {modo === "login" ? "Acceso a tu cuenta" : "Cuenta de cliente"}
            </Text>
          </View>

          {error && (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorTexto}>{error}</Text>
            </View>
          )}

          {modo === "registro" && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombre</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person" size={20} color={colors.grisOscuro} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Martina"
                    placeholderTextColor={colors.grisMedio}
                    value={nombre}
                    onChangeText={setNombre}
                    accessibilityLabel="Nombre"
                    autoComplete="given-name"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Apellido</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person-outline" size={20} color={colors.grisOscuro} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Gómez"
                    placeholderTextColor={colors.grisMedio}
                    value={apellido}
                    onChangeText={setApellido}
                    accessibilityLabel="Apellido"
                    autoComplete="family-name"
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color={colors.grisOscuro} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colors.grisMedio}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Correo electrónico"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color={colors.grisOscuro} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={modo === "registro" ? "Mínimo 8 caracteres" : "••••••••••••"}
                placeholderTextColor={colors.grisMedio}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                accessibilityLabel="Contraseña"
                autoComplete={modo === "registro" ? "new-password" : "current-password"}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <Entypo
                  name={showPassword ? "eye-with-line" : "eye"}
                  size={20}
                  color={colors.grisOscuro}
                />
              </TouchableOpacity>
            </View>
          </View>

          {modo === "registro" && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Teléfono (opcional)</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="phone" size={20} color={colors.grisOscuro} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: +54 299 4123456"
                  placeholderTextColor={colors.grisMedio}
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  accessibilityLabel="Teléfono (opcional)"
                  autoComplete="tel"
                />
              </View>
            </View>
          )}

          <AppButton
            label={modo === "login" ? "Ingresar" : "Crear mi cuenta"}
            onPress={modo === "login" ? handleLogin : handleRegistro}
            cargando={cargando}
          />

          {modoDemo && modo === "login" && (
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>💡 Cuentas de demostración (modo mock)</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => rellenarDemo("cliente")}
                  accessibilityRole="button"
                  accessibilityLabel="Completar credenciales de cliente de demostración"
                >
                  <Text style={styles.demoBtnTxt}>🐕 Cliente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoBtn, styles.demoBtnPaseador]}
                  onPress={() => rellenarDemo("paseador")}
                  accessibilityRole="button"
                  accessibilityLabel="Completar credenciales de paseador de demostración"
                >
                  <Text style={[styles.demoBtnTxt, { color: colors.naranja }]}>🦮 Paseador</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerTxt}>¿Querés ofrecer tus servicios?</Text>
            <TouchableOpacity onPress={() => router.push("/paseadores/registro")}>
              <Text style={styles.footerLink}>Registrate como Paseador</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => router.push("/paseadores")}>
              <Text style={styles.footerLink}>Explorar paseadores</Text>
            </TouchableOpacity>
          </View>
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
  sesionEmail: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
    marginTop: spacing.xs,
  },
  sesionAcciones: {
    width: "100%",
    maxWidth: 420,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  logoutBtn: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  logoutTxt: {
    fontSize: fonts.sizes.sm,
    fontWeight: "700",
    color: colors.error,
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  switcherBtnActivo: {
    backgroundColor: colors.verdeOscuro,
    ...shadows.card,
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
  alertError: {
    backgroundColor: colors.errorClaro,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  alertErrorTexto: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    fontWeight: "600",
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
    textAlign: "center",
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
    gap: spacing.sm,
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

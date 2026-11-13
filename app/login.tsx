import { Entypo, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { Campo } from "../components/formulario/Campo";
import { ETIQUETA_ROL } from "../src/constants/roles";
import { colors, fonts, radius, spacing } from "../src/constants/theme";
import { useSesion } from "../src/context/SesionContext";
import { iniciarSesion, registrarCuentaCliente } from "../src/services/auth.service";
import { normalizarTelefono } from "../src/utils/telefono";

// ============================================================================
// PANTALLA: /login
// Dos modos en la misma pantalla: "Ingresar" (login) y "Crear cuenta"
// (registro de cliente). Los paseadores se registran en /paseadores/registro.
// Si ya hay sesión, muestra un resumen con los accesos según el rol.
// La pantalla valida lo básico; el backend vuelve a validar todo.
// ============================================================================

type Modo = "login" | "registro";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { sesion, iniciar, cerrar } = useSesion();

  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esRegistro = modo === "registro";

  // Al cambiar de modo se borran el error y la contraseña escrita.
  const cambiarModo = (nuevo: Modo) => {
    setModo(nuevo);
    setError(null);
    setPassword("");
  };

  // Devuelve el primer error de validación, o null si el formulario está bien.
  const validar = (): string | null => {
    if (!esRegistro) {
      return email.trim() && password ? null : "Ingresá tu correo electrónico y contraseña.";
    }
    const faltan = [
      !nombre.trim() && "el nombre",
      !apellido.trim() && "el apellido",
      !email.trim() && "el correo",
      !password && "la contraseña",
    ].filter(Boolean);
    if (faltan.length) return `Completá ${faltan.join(", ")}.`;
    if (!EMAIL_VALIDO.test(email.trim())) return "Ingresá un correo electrónico válido.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (telefono.trim() && !normalizarTelefono(telefono)) {
      return "Ingresá un teléfono válido (ej. 4123456 o 299 4123456) o dejalo vacío.";
    }
    return null;
  };

  const enviar = async () => {
    const problema = validar();
    setError(problema);
    if (problema) return;

    setCargando(true);
    try {
      const nueva = esRegistro
        ? await registrarCuentaCliente({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email,
            password,
            telefono: telefono.trim() ? `+${normalizarTelefono(telefono)}` : undefined,
          })
        : await iniciarSesion({ email, password });
      iniciar(nueva);
      router.push(nueva.usuario.rol === "admin" ? "/admin" : "/paseadores");
    } catch (e) {
      const porDefecto = esRegistro ? "No se pudo crear la cuenta." : "No se pudo iniciar sesión.";
      setError(e instanceof Error ? e.message : porDefecto);
    } finally {
      setCargando(false);
    }
  };

  // ── Sesión activa: resumen y accesos según el rol ─────────────────────────
  if (sesion) {
    const { usuario } = sesion;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.icono}>
          <FontAwesome name="check" size={28} color={colors.verde} />
        </View>
        <Text style={styles.titulo}>Sesión iniciada</Text>
        <Text style={styles.subtitulo}>
          {usuario.nombre} {usuario.apellido} · {ETIQUETA_ROL[usuario.rol]}
        </Text>
        <Text style={styles.sesionEmail}>{usuario.email}</Text>

        <View style={styles.sesionAcciones}>
          {usuario.rol === "admin" && (
            <AppButton label="Panel de administración" onPress={() => router.push("/admin")} />
          )}
          <AppButton
            label="Ver paseadores"
            variante={usuario.rol === "admin" ? "secundario" : "primario"}
            onPress={() => router.push("/paseadores")}
          />
          {usuario.rol === "paseador" && (
            <AppButton
              label="Mis reseñas"
              variante="secundario"
              onPress={() => router.push("/mis-resenas")}
            />
          )}
          <Pressable
            style={styles.enlace}
            onPress={async () => {
              await cerrar();
              setEmail("");
              cambiarModo("login");
            }}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ── Formulario de ingreso / registro ──────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.encabezado}>
          <View style={styles.icono}>
            <FontAwesome name="paw" size={28} color={colors.verde} />
          </View>
          <Text style={styles.titulo} accessibilityRole="header">
            {esRegistro ? "Creá tu cuenta" : "Ingresá a WalkPets"}
          </Text>
          <Text style={styles.subtitulo}>
            {esRegistro
              ? "Registrate como cliente para dejar reseñas de los paseadores que contrataste."
              : "Para publicar reseñas y contactar paseadores de Cipolletti y Neuquén."}
          </Text>
        </View>

        {/* Selector de modo (control segmentado) */}
        <View style={styles.selector}>
          {(
            [
              ["login", "Ingresar", "Iniciar sesión"],
              ["registro", "Crear cuenta", "Crear cuenta de cliente"],
            ] as const
          ).map(([valor, texto, etiqueta]) => (
            <Pressable
              key={valor}
              style={[styles.selectorBtn, modo === valor && styles.selectorBtnActivo]}
              onPress={() => cambiarModo(valor)}
              accessibilityRole="button"
              accessibilityLabel={etiqueta}
              accessibilityState={{ selected: modo === valor }}
            >
              <Text style={[styles.selectorTxt, modo === valor && styles.selectorTxtActivo]}>
                {texto}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tarjeta}>
          {error && (
            <View style={styles.alerta} accessibilityRole="alert">
              <Text style={styles.alertaTexto}>{error}</Text>
            </View>
          )}

          {esRegistro && (
            <View style={styles.fila}>
              <Campo
                etiqueta="Nombre"
                enFila
                placeholder="Ej: Martina"
                value={nombre}
                onChangeText={setNombre}
                accessibilityLabel="Nombre"
                autoComplete="given-name"
              />
              <Campo
                etiqueta="Apellido"
                enFila
                placeholder="Ej: Gómez"
                value={apellido}
                onChangeText={setApellido}
                accessibilityLabel="Apellido"
                autoComplete="family-name"
              />
            </View>
          )}

          <Campo
            etiqueta="Correo electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Correo electrónico"
            autoComplete="email"
          />

          <Campo
            etiqueta="Contraseña"
            placeholder={esRegistro ? "Mínimo 8 caracteres" : "••••••••••••"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!verPassword}
            autoCapitalize="none"
            accessibilityLabel="Contraseña"
            autoComplete={esRegistro ? "new-password" : "current-password"}
            accesorio={
              <Pressable
                onPress={() => setVerPassword((v) => !v)}
                style={styles.ojo}
                accessibilityRole="button"
                accessibilityLabel={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <Entypo
                  name={verPassword ? "eye-with-line" : "eye"}
                  size={20}
                  color={colors.grisOscuro}
                />
              </Pressable>
            }
          />

          {esRegistro && (
            <Campo
              etiqueta="Teléfono"
              obligatorio={false}
              ayuda="Opcional. Sin código de área se asume 299."
              placeholder="Ej: 4123456 o 299 4123456"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              accessibilityLabel="Teléfono (opcional)"
              autoComplete="tel"
            />
          )}

          <AppButton
            label={esRegistro ? "Crear mi cuenta" : "Ingresar"}
            onPress={enviar}
            cargando={cargando}
          />
        </View>

        <View style={styles.pie}>
          <Text style={styles.pieTexto}>¿Querés ofrecer tus servicios?</Text>
          <Pressable style={styles.enlace} onPress={() => router.push("/paseadores/registro")}>
            <Text style={styles.enlaceTexto}>Registrate como paseador</Text>
          </Pressable>
          <Pressable style={styles.enlace} onPress={() => router.push("/paseadores")}>
            <Text style={styles.enlaceTexto}>Explorar paseadores</Text>
          </Pressable>
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
  encabezado: {
    alignItems: "center",
    marginBottom: spacing.lg,
    maxWidth: 440,
  },
  icono: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.verdePastel,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.pesos.semi,
    letterSpacing: fonts.tracking.titulo,
    color: colors.negro,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fonts.sizes.md,
    color: colors.grisOscuro,
    textAlign: "center",
    lineHeight: 22,
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
  cerrarSesion: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
    color: colors.error,
  },
  selector: {
    flexDirection: "row",
    backgroundColor: colors.grisClaro,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.lg,
    width: "100%",
    maxWidth: 480,
  },
  selectorBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: radius.full,
  },
  selectorBtnActivo: {
    backgroundColor: colors.verdeOscuro,
  },
  selectorTxt: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
    color: colors.verdeOscuro,
  },
  selectorTxtActivo: {
    color: colors.blanco,
  },
  tarjeta: {
    backgroundColor: colors.blanco,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.linea,
    padding: spacing.lg,
    gap: spacing.md,
    width: "100%",
    maxWidth: 480,
  },
  fila: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  alerta: {
    backgroundColor: colors.errorClaro,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
  },
  alertaTexto: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.pesos.semi,
  },
  ojo: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -spacing.sm,
  },
  pie: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  pieTexto: {
    fontSize: fonts.sizes.sm,
    color: colors.grisOscuro,
  },
  enlace: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  enlaceTexto: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.pesos.semi,
    color: colors.verde,
    textDecorationLine: "underline",
  },
});

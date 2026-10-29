import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { colors, fonts } from "../src/constants/theme";
import { AvisoModoPrueba } from "../components/AvisoModoPrueba";
import { BackButton } from "../components/BackButton";
import { BotonPerfilHeader } from "../components/BotonPerfilHeader";
import { SesionProvider } from "../src/context/SesionContext";

// ============================================================================
// ARCHIVO: _layout.tsx (Diseño Raíz / Root Layout)
// Propósito: Es el componente contenedor principal de toda la aplicación en
// Expo Router. Configura la pila de navegación nativa (Stack), define el estilo
// global de la barra superior (encabezado/header), inyecta el botón de volver
// personalizado y registra cada una de las pantallas disponibles en la app.
// ============================================================================

export default function RootLayout() {
  return (
    <SesionProvider>
      {/* Controla los íconos de la barra de estado del sistema (batería, hora, wifi) */}
      <StatusBar style="dark" />

      {/* =====================================================================
          STACK PRINCIPAL DE NAVEGACIÓN
          screenOptions define los estilos por defecto que heredarán todas
          las pantallas que no especifiquen lo contrario.
          ===================================================================== */}
      <Stack
        screenOptions={{
          // Color de fondo del encabezado: verde oscuro de la marca
          headerStyle: { backgroundColor: colors.verdeOscuro },
          // Color del texto e íconos en el encabezado (blanco)
          headerTintColor: colors.blanco,
          // Estilo tipográfico para el título de la pantalla en la barra
          headerTitleStyle: { fontWeight: fonts.pesos.semi, color: colors.blanco },
          // Título centrado también en Android
          headerTitleAlign: "center",
          // Oculta la línea o sombra inferior predeterminada del navegador
          headerShadowVisible: false,
          // Color de fondo por defecto para el área de contenido de todas las pantallas
          contentStyle: { backgroundColor: colors.crema },
          // Inyección global del botón de atrás animado. Si la pantalla se abrió
          // directo por URL (sin historial), vuelve al inicio en vez de no hacer nada.
          // Acceso a "Mi perfil" (o "Entrar") en todas las pantallas internas.
          headerRight: () => <BotonPerfilHeader />,
          headerLeft: () => (
            <View style={{ marginRight: 12 }}>
              <BackButton
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              />
            </View>
          ),
        }}
      >
        {/* ===================================================================
            REGISTRO DE RUTAS / PANTALLAS DEL STACK
            =================================================================== */}

        {/* 1. Pantalla de Inicio (Landing Page Hero) -> Ocultamos el header 
               porque esta pantalla tiene su propia barra de navegación personalizada */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* 2. Catálogo / Lista de Paseadores -> Sobrescribimos el botón de volver
               para que al presionarlo nos lleve explícitamente a la raíz ("/") */}
        <Stack.Screen
          name="paseadores/index"
          options={{ 
            title: "Paseadores",
            headerLeft: () => (
              <View style={{ marginRight: 12 }}>
                <BackButton
                  onPress={() => router.push("/")}
                  label="Volver al inicio"
                />
              </View>
            ),
          }}
        />

        {/* 3. Perfil Individual del Paseador (Ruta dinámica por ID) */}
        <Stack.Screen
          name="paseadores/[id]"
          options={{ title: "Perfil del paseador" }}
        />

        {/* 4. Formulario de Registro para nuevos Paseadores */}
        <Stack.Screen
          name="paseadores/registro"
          options={{ title: "Ofrecé tus paseos" }}
        />

        {/* 6. Pantalla de Inicio de Sesión (Login para Usuarios y Paseadores) */}
        <Stack.Screen
          name="login"
          options={{ title: "Iniciar Sesión" }}
        />

        {/* 7. Mi perfil: datos del cliente o panel del paseador */}
        <Stack.Screen
          name="mi-perfil"
          options={{ title: "Mi perfil" }}
        />

        {/* 8. Reseñas recibidas por el paseador autenticado */}
        <Stack.Screen
          name="mis-resenas"
          options={{ title: "Mis reseñas" }}
        />
      </Stack>
      {/* Aviso visible cuando los datos no van a la base (modo mock) */}
      <AvisoModoPrueba />
    </SesionProvider>
  );
}

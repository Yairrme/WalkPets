import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { colors } from "../constants/theme";
import { BackButton } from "../components/BackButton";

// ============================================================================
// ARCHIVO: _layout.tsx (Diseño Raíz / Root Layout)
// Propósito: Es el componente contenedor principal de toda la aplicación en
// Expo Router. Configura la pila de navegación nativa (Stack), define el estilo
// global de la barra superior (encabezado/header), inyecta el botón de volver
// personalizado y registra cada una de las pantallas disponibles en la app.
// ============================================================================

export default function RootLayout() {
  return (
    <>
      {/* Controla los íconos de la barra de estado del sistema (batería, hora, wifi) */}
      <StatusBar style="dark" />

      {/* =====================================================================
          STACK PRINCIPAL DE NAVEGACIÓN
          screenOptions define los estilos por defecto que heredarán todas
          las pantallas que no especifiquen lo contrario.
          ===================================================================== */}
      <Stack
        screenOptions={{
          // Color de fondo del encabezado: Verde oliva característico de la marca
          headerStyle: { backgroundColor: "rgba(86, 90, 33, 1)" },
          // Color del texto e íconos en el encabezado (blanco)
          headerTintColor: colors.blanco,
          // Estilo tipográfico para el título de la pantalla en la barra
          headerTitleStyle: { fontWeight: "700", color: colors.blanco },
          // Oculta la línea o sombra inferior predeterminada del navegador
          headerShadowVisible: false,
          // Color de fondo por defecto para el área de contenido de todas las pantallas
          contentStyle: { backgroundColor: colors.crema },
          // Inyección global del botón de atrás animado (por defecto hace router.back)
          headerLeft: () => (
            <View style={{ marginRight: 12 }}>
              <BackButton onPress={() => router.back()} />
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
                <BackButton onPress={() => router.push("/")} />
              </View>
            ),
          }}
        />

        {/* 3. Perfil Individual del Paseador (Ruta dinámica por ID) */}
        <Stack.Screen
          name="paseadores/[id]"
          options={{ title: "Perfil del paseador" }}
        />

        {/* 4. Pantalla para Reservar un Turno con el Paseador */}
        <Stack.Screen
          name="paseadores/reserva"
          options={{ title: "Reservar turno" }}
        />

        {/* 5. Formulario de Registro para nuevos Paseadores */}
        <Stack.Screen
          name="paseadores/registro"
          options={{ title: "Registrarse como Paseador" }}
        />

        {/* 6. Pantalla de Inicio de Sesión (Login para Usuarios y Paseadores) */}
        <Stack.Screen
          name="login"
          options={{ title: "Iniciar Sesión" }}
        />
      </Stack>
    </>
  );
}

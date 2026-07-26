import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { colors } from "../constants/theme";
import { BackButton } from "../components/BackButton";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "rgba(86, 90, 33, 1)" },
          headerTintColor: colors.blanco,
          headerTitleStyle: { fontWeight: "700", color: colors.blanco },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.crema },
          headerLeft: () => (
            <View style={{ marginRight: 12 }}>
              <BackButton onPress={() => router.back()} />
            </View>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
        <Stack.Screen
          name="paseadores/[id]"
          options={{ title: "Perfil del paseador" }}
        />
        <Stack.Screen
          name="paseadores/reserva"
          options={{ title: "Reservar turno" }}
        />
        <Stack.Screen
          name="paseadores/registro"
          options={{ title: "Registrarse como Paseador" }}
        />
        <Stack.Screen
          name="login"
          options={{ title: "Iniciar Sesión" }}
        />
      </Stack>
    </>
  );
}

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.blanco },
          headerTintColor: colors.verde,
          headerTitleStyle: { fontWeight: "700", color: colors.negro },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.crema },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="paseadores/index"
          options={{ title: "Paseadores en Cipolletti" }}
        />
        <Stack.Screen
          name="paseadores/[id]"
          options={{ title: "Perfil del paseador" }}
        />
        <Stack.Screen
          name="paseadores/reserva"
          options={{ title: "Reservar turno" }}
        />
      </Stack>
    </>
  );
}

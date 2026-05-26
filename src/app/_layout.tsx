import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, View, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../constants/theme";

const logo = require("../../assets/images/branding/logo.png");

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
          headerRight: () => (
            <View style={{ marginRight: 15 }}>
              <Image 
                source={logo} 
                style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 18, 
                  borderWidth: 1.5, 
                  borderColor: colors.blanco 
                }} 
                resizeMode="cover"
              />
            </View>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="paseadores/index"
          options={{ 
            title: "Paseadores en Cipolletti",
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => router.push("/")} 
                style={{ marginRight: 15 }}
                activeOpacity={0.8}
              >
                <FontAwesome name="arrow-left" size={20} color={colors.blanco} />
              </TouchableOpacity>
            )
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
      </Stack>
    </>
  );
}

import { Entypo } from "@expo/vector-icons";
import { createElement, useMemo, useState } from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "../src/constants/theme";
import {
  ORIGEN_EMBED,
  extraerYoutubeId,
  urlEmbed,
  urlMiniatura,
} from "../src/utils/youtube";

// ============================================================================
// Video de YouTube con carga diferida: primero muestra la miniatura y recién al
// tocar "play" monta el reproductor (así no gasta datos al abrir la pantalla).
// - Web: iframe directo (react-native-webview no funciona en web).
// - Android/iOS: WebView con baseUrl https, para que YouTube reciba un origen
//   válido; sin eso el reproductor muestra "Error 153" y no reproduce.
// ============================================================================

type Props = {
  url: string;
  titulo?: string;
};

export function VideoYoutube({ url, titulo = "Video" }: Props) {
  const [iniciado, setIniciado] = useState(false);
  const id = useMemo(() => extraerYoutubeId(url), [url]);

  if (!id) return null;

  if (!iniciado) {
    return (
      <TouchableOpacity
        style={styles.contenedor}
        activeOpacity={0.9}
        onPress={() => setIniciado(true)}
        accessibilityRole="button"
        accessibilityLabel="Reproducir video"
      >
        <Image
          source={{ uri: urlMiniatura(id) }}
          style={styles.relleno}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.circuloPlay}>
            <Entypo name="controller-play" size={28} color={colors.blanco} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (Platform.OS === "web") {
    const origen =
      typeof window !== "undefined" ? window.location.origin : ORIGEN_EMBED;
    return (
      <View style={styles.contenedor} testID="video-youtube-reproductor">
        {createElement("iframe", {
          src: urlEmbed(id, origen),
          title: titulo,
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowFullScreen: true,
          referrerPolicy: "strict-origin-when-cross-origin",
          style: { width: "100%", height: "100%", border: 0 },
        })}
      </View>
    );
  }

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style>
      * { margin: 0; padding: 0; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: ${colors.negro}; }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      src="${urlEmbed(id)}"
      title="${titulo.replace(/"/g, "&quot;")}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </body>
</html>`;

  return (
    <View style={styles.contenedor} testID="video-youtube-reproductor">
      <WebView
        originWhitelist={["*"]}
        source={{ html, baseUrl: ORIGEN_EMBED }}
        style={styles.relleno}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.negro,
  },
  relleno: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  circuloPlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.verdeOscuro,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
  },
});

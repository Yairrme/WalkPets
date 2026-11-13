// Helpers para incrustar videos de YouTube.

// Extrae el ID de video soportando los formatos de URL más comunes de YouTube
// (watch?v=, youtu.be/, embed/, shorts/). Devuelve "" si no lo reconoce.
export function extraerYoutubeId(url: string): string {
  const patrones = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];
  for (const patron of patrones) {
    const match = url.match(patron);
    if (match?.[1]) return match[1];
  }
  return "";
}

// Origen que se le informa a YouTube. Desde 2025 el reproductor embebido exige
// un Referer/origin válido: sin él muestra "Error 153" y el video no arranca.
export const ORIGEN_EMBED = "https://walkpets.app";

export function urlMiniatura(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// URL del reproductor embebido. autoplay=1 porque solo se monta después de que
// la persona tocó "play" en la miniatura. `origen` tiene que coincidir con la
// página que contiene el iframe (en web es window.location.origin).
export function urlEmbed(id: string, origen: string = ORIGEN_EMBED): string {
  const params = new URLSearchParams({
    autoplay: "1",
    controls: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    playsinline: "1",
    origin: origen,
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

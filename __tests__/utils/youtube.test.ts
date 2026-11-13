import { ORIGEN_EMBED, extraerYoutubeId, urlEmbed, urlMiniatura } from "../../src/utils/youtube";

describe("extraerYoutubeId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=plJUSgZ0guc", "plJUSgZ0guc"],
    ["https://www.youtube.com/watch?feature=share&v=plJUSgZ0guc", "plJUSgZ0guc"],
    ["https://youtu.be/plJUSgZ0guc?t=10", "plJUSgZ0guc"],
    ["https://www.youtube.com/embed/plJUSgZ0guc", "plJUSgZ0guc"],
    ["https://www.youtube.com/shorts/plJUSgZ0guc", "plJUSgZ0guc"],
  ])("extrae el ID de %s", (url, id) => {
    expect(extraerYoutubeId(url)).toBe(id);
  });

  it("devuelve vacío si la URL no es de YouTube", () => {
    expect(extraerYoutubeId("https://vimeo.com/123")).toBe("");
  });
});

describe("urlEmbed", () => {
  it("incluye autoplay, playsinline y el origen (sin origen YouTube da Error 153)", () => {
    const url = new URL(urlEmbed("abc123"));
    expect(url.origin + url.pathname).toBe("https://www.youtube.com/embed/abc123");
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.get("playsinline")).toBe("1");
    expect(url.searchParams.get("origin")).toBe(ORIGEN_EMBED);
  });

  it("acepta un origen propio (web)", () => {
    const url = new URL(urlEmbed("abc123", "http://localhost:8081"));
    expect(url.searchParams.get("origin")).toBe("http://localhost:8081");
  });
});

it("urlMiniatura arma la miniatura de YouTube", () => {
  expect(urlMiniatura("abc123")).toBe("https://img.youtube.com/vi/abc123/hqdefault.jpg");
});

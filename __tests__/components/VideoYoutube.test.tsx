import { fireEvent, render, screen } from "@testing-library/react-native";
import { VideoYoutube } from "../../components/VideoYoutube";
import { ORIGEN_EMBED } from "../../src/utils/youtube";

// La WebView nativa no existe en Jest: la reemplazamos por un View que guarda las props.
jest.mock("react-native-webview", () => {
  const { View } = jest.requireActual("react-native");
  return {
    WebView: (props: Record<string, unknown>) => <View testID="webview" {...props} />,
  };
});

const URL_VIDEO = "https://www.youtube.com/watch?v=plJUSgZ0guc";

describe("VideoYoutube", () => {
  it("muestra solo la miniatura hasta que se toca play", () => {
    render(<VideoYoutube url={URL_VIDEO} />);

    expect(screen.getByLabelText("Reproducir video")).toBeTruthy();
    expect(screen.queryByTestId("webview")).toBeNull();
  });

  it("al tocar play monta el reproductor con baseUrl https y reproducción inline", () => {
    render(<VideoYoutube url={URL_VIDEO} titulo="Paseos" />);

    fireEvent.press(screen.getByLabelText("Reproducir video"));

    const webview = screen.getByTestId("webview");
    const source = webview.props.source as { html: string; baseUrl: string };
    expect(source.baseUrl).toBe(ORIGEN_EMBED);
    expect(source.html).toContain("https://www.youtube.com/embed/plJUSgZ0guc?");
    expect(source.html).toContain("autoplay=1");
    expect(source.html).toContain('referrerpolicy="strict-origin-when-cross-origin"');
    expect(webview.props.allowsInlineMediaPlayback).toBe(true);
    expect(webview.props.mediaPlaybackRequiresUserAction).toBe(false);
  });

  it("no renderiza nada si la URL no es de YouTube", () => {
    render(<VideoYoutube url="https://vimeo.com/123" />);

    expect(screen.queryByLabelText("Reproducir video")).toBeNull();
  });
});

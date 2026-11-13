import { API_TIMEOUT_MS, API_URL } from '../../config/api';

export class ApiError extends Error {
  readonly status: number;
  readonly detalles?: string[];

  constructor(mensaje: string, status: number, detalles?: string[]) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }
}

export const MENSAJE_SESION_VENCIDA = 'Tu sesión venció. Iniciá sesión de nuevo.';

type ManejadorTokenRechazado = (token: string) => void;

let alRechazarToken: ManejadorTokenRechazado | null = null;

// Registra qué hacer cuando el servidor rechaza el token enviado (sesión
// vencida o cuenta eliminada). Recibe el token rechazado para que quien
// escucha ignore respuestas viejas. Devuelve una función para darlo de baja.
export function registrarSesionRechazada(manejador: ManejadorTokenRechazado): () => void {
  alRechazarToken = manejador;
  return () => {
    if (alRechazarToken === manejador) alRechazarToken = null;
  };
}

type Opciones = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

function extraerMensaje(payload: unknown): { mensaje: string; detalles?: string[] } {
  if (!payload || typeof payload !== 'object') {
    return { mensaje: 'Ocurrió un error al comunicarse con el servidor.' };
  }

  const data = payload as { message?: unknown; error?: unknown };
  if (Array.isArray(data.message)) {
    return {
      mensaje: 'Revisá los datos ingresados.',
      detalles: data.message.map((item) => String(item)),
    };
  }

  if (typeof data.message === 'string') {
    return { mensaje: data.message };
  }

  if (typeof data.error === 'string') {
    return { mensaje: data.error };
  }

  return { mensaje: 'Ocurrió un error al comunicarse con el servidor.' };
}

export async function apiFetch<T>(path: string, opciones: Opciones = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      'Falta configurar EXPO_PUBLIC_API_URL (ej. http://localhost:3000/api) en el .env y reiniciar Expo.',
      0
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  if (opciones.signal) {
    opciones.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const respuesta = await fetch(`${API_URL}${path}`, {
      method: opciones.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
        ...(opciones.token ? { Authorization: `Bearer ${opciones.token}` } : {}),
      },
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
      signal: controller.signal,
    });

    if (respuesta.status === 204) {
      return undefined as T;
    }

    const texto = await respuesta.text();
    const payload = texto ? JSON.parse(texto) : null;

    // Un 401 sin token (login con datos incorrectos) conserva el mensaje del
    // servidor; con token significa que la sesión guardada ya no sirve.
    if (respuesta.status === 401 && opciones.token) {
      alRechazarToken?.(opciones.token);
      throw new ApiError(MENSAJE_SESION_VENCIDA, 401);
    }

    if (!respuesta.ok) {
      const { mensaje, detalles } = extraerMensaje(payload);
      throw new ApiError(mensaje, respuesta.status, detalles);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('La conexión con el servidor tardó demasiado.', 0);
    }
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  } finally {
    clearTimeout(timeout);
  }
}

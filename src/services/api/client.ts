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
    throw new ApiError('La API no está configurada (EXPO_PUBLIC_API_URL).', 0);
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

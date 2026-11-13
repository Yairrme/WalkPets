// Ayudas para simular el backend en las pruebas de servicios: en vez de una
// base en memoria, se reemplaza `fetch` y se devuelven respuestas con la misma
// forma que el contrato de la API NestJS.

export const API_URL_PRUEBA = 'http://api.walkpets.test/api';

export function respuestaJson(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  } as unknown as Response;
}

// Reemplaza fetch por un jest.fn() y lo devuelve para configurar respuestas.
export function simularFetch(): jest.Mock {
  const fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

// Cuerpo JSON enviado en la llamada número `indice` a fetch.
export function cuerpoEnviado(fetchMock: jest.Mock, indice = 0): Record<string, unknown> {
  return JSON.parse(fetchMock.mock.calls[indice][1].body as string);
}

export const PASEADOR_API = {
  id: 'p-1',
  usuarioId: 'u-paseador',
  nombre: 'Nuevo',
  apellido: 'Paseador',
  fotoUrl: 'avatar:hombre',
  ciudad: 'Neuquén',
  barrio: 'Neuquén Centro',
  descripcion: 'Paseos diarios con experiencia.',
  precioHora: 2000,
  telefono: '+5492994000000',
  disponible: true,
  razasAceptadas: ['Todas las razas'],
  redes: { instagram: 'nuevo.paseos' },
  certificaciones: ['Habilitación municipal'],
  calificacionPromedio: 0,
  cantidadResenas: 0,
};

export const sesionDe = (rol: 'cliente' | 'paseador' | 'admin') => ({
  token: `token-${rol}`,
  usuario: { id: `u-${rol}`, nombre: 'Ana', apellido: 'Paz', email: `${rol}@walkpets.test`, rol },
});

import { esCiudad } from '../constants/ciudades';
import { usarApi } from '../config/api';
import { NuevoPaseadorInput, Paseador, Resena, Sesion } from '../types/paseador';
import { normalizarTelefono } from '../utils/telefono';
import { apiFetch, ApiError } from './api/client';
import { registrarCuentaPaseadorMock } from './auth.service';
import { guardarSesion, obtenerSesionGuardada } from './sesion.service';

const PASEADORES_MOCK: Paseador[] = [
  {
    id: '1',
    usuarioId: 'demo-paseador',
    nombre: 'Lucía',
    apellido: 'Fernández',
    foto: 'https://randomuser.me/api/portraits/women/32.jpg',
    barrio: 'Cipolletti Centro',
    ciudad: 'Cipolletti',
    descripcion:
      'Amante de los animales con 4 años de experiencia. Salidas diarias, puntual y responsable. Mando fotos y videos durante cada paseo.',
    precioHora: 1800,
    calificacion: 4.9,
    cantidadResenas: 38,
    telefono: '+54 299 4123456',
    disponible: true,
    razasAceptadas: ['Todas las razas'],
    turnosDisponibles: [
      { id: 't1', dia: 'Lunes', horario: '08:00 - 09:00', disponible: true },
      { id: 't2', dia: 'Lunes', horario: '10:00 - 11:00', disponible: true },
      { id: 't3', dia: 'Martes', horario: '08:00 - 09:00', disponible: false },
      { id: 't4', dia: 'Miércoles', horario: '08:00 - 09:00', disponible: true },
      { id: 't5', dia: 'Jueves', horario: '17:00 - 18:00', disponible: true },
      { id: 't6', dia: 'Viernes', horario: '08:00 - 09:00', disponible: true },
    ],
    resenas: [
      {
        id: 'r1',
        autor: 'Martina G.',
        mascota: 'Rocky',
        texto: 'Lucía es increíble, mi perro la adora. Siempre llega puntual y manda fotos del paseo.',
        calificacion: 5,
        fecha: '2024-11-10',
      },
      {
        id: 'r2',
        autor: 'Pablo R.',
        mascota: 'Luna',
        texto: 'Muy profesional y cariñosa con los animales. La recomiendo totalmente.',
        calificacion: 5,
        fecha: '2024-10-22',
      },
      {
        id: 'r3',
        autor: 'Sofía M.',
        mascota: 'Teo',
        texto: 'Excelente servicio. Mi perro llega cansado y feliz de cada paseo.',
        calificacion: 4,
        fecha: '2024-09-15',
      },
    ],
  },
  {
    id: '2',
    nombre: 'Mateo',
    apellido: 'Torres',
    foto: '',
    barrio: 'Villa Alberdi',
    ciudad: 'Cipolletti',
    descripcion:
      'Estudiante de veterinaria, cuido perros desde los 16 años. Rutas seguras, siempre con correa. Zonas de parque y espacios verdes.',
    precioHora: 1500,
    calificacion: 4.7,
    cantidadResenas: 22,
    telefono: '+54 299 4234567',
    disponible: true,
    razasAceptadas: ['Razas medianas', 'Razas grandes'],
    turnosDisponibles: [
      { id: 't7', dia: 'Lunes', horario: '07:00 - 08:00', disponible: true },
      { id: 't8', dia: 'Martes', horario: '07:00 - 08:00', disponible: true },
      { id: 't9', dia: 'Miércoles', horario: '18:00 - 19:00', disponible: true },
      { id: 't10', dia: 'Viernes', horario: '07:00 - 08:00', disponible: false },
      { id: 't11', dia: 'Sábado', horario: '09:00 - 10:00', disponible: true },
    ],
    resenas: [
      {
        id: 'r4',
        autor: 'Carla V.',
        mascota: 'Simba',
        texto: 'Mateo conoce mucho de perros, mi pastor alemán confía en él desde el primer día.',
        calificacion: 5,
        fecha: '2024-11-01',
      },
      {
        id: 'r5',
        autor: 'Diego L.',
        mascota: 'Negra',
        texto: 'Buen paseador, puntual. A veces tarda un poco en responder los mensajes.',
        calificacion: 4,
        fecha: '2024-10-05',
      },
    ],
  },
  {
    id: '3',
    nombre: 'Valentina',
    apellido: 'Cruz',
    foto: 'https://randomuser.me/api/portraits/women/68.jpg',
    barrio: 'Ceferino',
    ciudad: 'Cipolletti',
    descripcion:
      'Paseadora certificada con curso de primeros auxilios para mascotas. Grupos reducidos de máximo 3 perros. Rutas tranquilas y seguras.',
    precioHora: 2200,
    calificacion: 5.0,
    cantidadResenas: 51,
    telefono: '+54 299 4345678',
    disponible: true,
    razasAceptadas: ['Todas las razas', 'Cachorros'],
    turnosDisponibles: [
      { id: 't12', dia: 'Lunes', horario: '09:00 - 10:00', disponible: true },
      { id: 't13', dia: 'Martes', horario: '09:00 - 10:00', disponible: true },
      { id: 't14', dia: 'Miércoles', horario: '09:00 - 10:00', disponible: true },
      { id: 't15', dia: 'Jueves', horario: '09:00 - 10:00', disponible: true },
      { id: 't16', dia: 'Viernes', horario: '09:00 - 10:00', disponible: true },
    ],
    resenas: [
      {
        id: 'r6',
        autor: 'Ana P.',
        mascota: 'Coco',
        texto: 'La mejor paseadora que tuve. Mi perrita la espera en la puerta todos los días.',
        calificacion: 5,
        fecha: '2024-11-15',
      },
      {
        id: 'r7',
        autor: 'Lucas B.',
        mascota: 'Milo',
        texto: 'Valentina es una profesional. Tranquilidad total cuando dejo a mi perro con ella.',
        calificacion: 5,
        fecha: '2024-11-08',
      },
      {
        id: 'r8',
        autor: 'Florencia K.',
        mascota: 'Belu',
        texto: 'Increíble. Mandó fotos durante todo el paseo. Muy recomendable.',
        calificacion: 5,
        fecha: '2024-10-30',
      },
    ],
  },
  {
    id: '4',
    nombre: 'Santiago',
    apellido: 'Morales',
    foto: 'https://randomuser.me/api/portraits/men/22.jpg',
    barrio: 'Neuquén Centro',
    ciudad: 'Neuquén',
    descripcion:
      'Me encanta pasar tiempo con perros. Paseos tranquilos por el barrio, ideal para perros mayores o con movilidad reducida.',
    precioHora: 1200,
    calificacion: 4.3,
    cantidadResenas: 9,
    telefono: '+54 299 4456789',
    disponible: false,
    razasAceptadas: ['Razas pequeñas', 'Perros mayores'],
    turnosDisponibles: [
      { id: 't17', dia: 'Sábado', horario: '10:00 - 11:00', disponible: false },
      { id: 't18', dia: 'Domingo', horario: '10:00 - 11:00', disponible: false },
    ],
    resenas: [
      {
        id: 'r9',
        autor: 'Romina F.',
        mascota: 'Pepa',
        texto: 'Muy bueno con perros mayores. Va despacio y con paciencia.',
        calificacion: 5,
        fecha: '2024-09-20',
      },
      {
        id: 'r10',
        autor: 'Hernán S.',
        mascota: 'Bobby',
        texto: 'Cumple, aunque no siempre está disponible. Buen trato con los animales.',
        calificacion: 4,
        fecha: '2024-08-12',
      },
    ],
  },
];

type ResenaApi = {
  id: string;
  autorNombre: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: string;
};

type PaseadorApi = {
  id: string;
  usuarioId?: string;
  nombre: string;
  apellido: string;
  fotoUrl: string;
  ciudad: string;
  barrio: string;
  descripcion: string;
  precioHora: number;
  telefono: string;
  disponible: boolean;
  razasAceptadas: string[];
  calificacionPromedio: number;
  cantidadResenas: number;
  resenas?: ResenaApi[];
  esPropietario?: boolean;
};

type RespuestaRegistroPaseador = {
  accessToken: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string | null;
    rol: 'cliente' | 'paseador';
  };
  paseador: PaseadorApi;
};

function mapResena(dto: ResenaApi): Resena {
  return {
    id: dto.id,
    autor: dto.autorNombre,
    mascota: dto.mascota,
    texto: dto.texto,
    calificacion: dto.calificacion,
    fecha: dto.fecha.slice(0, 10),
  };
}

function mapPaseador(dto: PaseadorApi): Paseador {
  return {
    id: dto.id,
    usuarioId: dto.usuarioId,
    nombre: dto.nombre,
    apellido: dto.apellido,
    foto: dto.fotoUrl ?? '',
    barrio: dto.barrio,
    ciudad: dto.ciudad as Paseador['ciudad'],
    descripcion: dto.descripcion,
    precioHora: dto.precioHora,
    calificacion: dto.calificacionPromedio,
    cantidadResenas: dto.cantidadResenas,
    telefono: dto.telefono,
    disponible: dto.disponible,
    razasAceptadas: dto.razasAceptadas,
    resenas: (dto.resenas ?? []).map(mapResena),
    turnosDisponibles: [],
    esPropietario: dto.esPropietario,
  };
}

function copiarPaseador(paseador: Paseador): Paseador {
  return {
    ...paseador,
    razasAceptadas: [...paseador.razasAceptadas],
    resenas: [...paseador.resenas],
    turnosDisponibles: [...paseador.turnosDisponibles],
  };
}

// Obtiene el listado de paseadores desde la API o desde el mock.
export async function getPaseadores(): Promise<Paseador[]> {
  if (usarApi()) {
    const datos = await apiFetch<PaseadorApi[]>('/paseadores');
    return datos.map(mapPaseador);
  }

  // Simulamos un retraso de red de 900 milisegundos (0.9 segundos)
  await new Promise((resolve) => setTimeout(resolve, 900));
  // Devolvemos copias para que las pantallas no muten el arreglo interno.
  return PASEADORES_MOCK.map(copiarPaseador);
}

// Busca un paseador específico por su ID. Devuelve null si no existe.
export async function getPaseadorById(id: string): Promise<Paseador | null> {
  if (usarApi()) {
    const sesion = await obtenerSesionGuardada();
    try {
      const datos = await apiFetch<PaseadorApi>(`/paseadores/${id}`, {
        token: sesion?.token,
      });
      return mapPaseador(datos);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Simulamos un retraso de red de 500 milisegundos
  await new Promise((resolve) => setTimeout(resolve, 500));
  const paseador = PASEADORES_MOCK.find((p) => p.id === id);
  if (!paseador) return null;

  const sesion = await obtenerSesionGuardada();
  return {
    ...copiarPaseador(paseador),
    esPropietario: Boolean(sesion && paseador.usuarioId === sesion.usuario.id),
  };
}

function generarIdPaseador(): string {
  const maximo = PASEADORES_MOCK.reduce((max, paseador) => {
    const numero = Number.parseInt(paseador.id, 10);
    return Number.isNaN(numero) ? max : Math.max(max, numero);
  }, 0);

  return String(maximo + 1);
}

function validarDatosRegistro(datos: NuevoPaseadorInput): string {
  if (!esCiudad(datos.ciudad)) {
    throw new Error('La ciudad debe ser Cipolletti o Neuquén');
  }

  const telefonoNormalizado = normalizarTelefono(datos.telefono);
  if (!telefonoNormalizado) {
    throw new Error('El teléfono no es válido');
  }

  return `+${telefonoNormalizado}`;
}

// Registra un paseador. En modo API crea la cuenta y el perfil en el backend.
export async function registrarPaseador(datos: NuevoPaseadorInput): Promise<Paseador> {
  const telefono = validarDatosRegistro(datos);

  if (usarApi()) {
    if (!datos.email || !datos.password) {
      throw new Error('El correo y la contraseña son obligatorios para registrarse');
    }

    const respuesta = await apiFetch<RespuestaRegistroPaseador>('/auth/registro', {
      method: 'POST',
      body: {
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        password: datos.password,
        telefono,
        rol: 'paseador',
        paseador: {
          fotoUrl: datos.foto,
          ciudad: datos.ciudad,
          barrio: datos.barrio,
          descripcion: datos.descripcion,
          precioHora: datos.precioHora,
          razasAceptadas: datos.razasAceptadas,
        },
      },
    });

    const sesion: Sesion = {
      token: respuesta.accessToken,
      usuario: {
        ...respuesta.usuario,
        telefono: respuesta.usuario.telefono ?? undefined,
      },
    };
    await guardarSesion(sesion);

    return mapPaseador(respuesta.paseador);
  }

  // Simulamos un retraso de red de 800 milisegundos
  await new Promise((resolve) => setTimeout(resolve, 800));

  let usuarioId: string | undefined;
  if (datos.email && datos.password) {
    const sesion = await registrarCuentaPaseadorMock({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      password: datos.password,
      telefono,
    });
    usuarioId = sesion.usuario.id;
  }

  // Armamos el objeto completo del nuevo paseador.
  const nuevoPaseador: Paseador = {
    ...datos,
    id: generarIdPaseador(),
    usuarioId,
    telefono,
    calificacion: 0,
    cantidadResenas: 0,
    resenas: [],
    // El flujo objetivo no incluye reservas: el nuevo perfil no crea turnos.
    turnosDisponibles: [],
  };

  // Guardamos el nuevo paseador en nuestro arreglo de datos de prueba
  PASEADORES_MOCK.push(nuevoPaseador);

  // Devolvemos una copia para no exponer el objeto interno.
  return copiarPaseador(nuevoPaseador);
}

// Agrega una reseña al mock y recalcula el promedio del paseador.
export function agregarResenaMock(
  paseadorId: string,
  datos: { mascota: string; texto: string; calificacion: number },
  autor: string
): Resena {
  const paseador = PASEADORES_MOCK.find((p) => p.id === paseadorId);
  if (!paseador) {
    throw new Error('Paseador no encontrado');
  }

  const resena: Resena = {
    id: `r-${Date.now()}-${paseador.resenas.length + 1}`,
    autor,
    mascota: datos.mascota,
    texto: datos.texto,
    calificacion: datos.calificacion,
    fecha: new Date().toISOString().slice(0, 10),
  };

  paseador.resenas = [resena, ...paseador.resenas];
  paseador.cantidadResenas = paseador.resenas.length;
  const promedio =
    paseador.resenas.reduce((total, item) => total + item.calificacion, 0) /
    paseador.resenas.length;
  paseador.calificacion = Number(promedio.toFixed(1));

  return resena;
}

// Reseñas del perfil que pertenece al usuario autenticado (modo mock).
export function getMisResenasMock(usuarioId: string): Resena[] {
  const paseador = PASEADORES_MOCK.find((p) => p.usuarioId === usuarioId);
  if (!paseador) return [];

  return paseador.resenas.map((resena) => ({ ...resena }));
}



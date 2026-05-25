import { Paseador } from '../types/paseador';

const PASEADORES_MOCK: Paseador[] = [
  {
    id: '1',
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
    foto: 'https://randomuser.me/api/portraits/men/45.jpg',
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
    barrio: 'Parque Industrial',
    ciudad: 'Cipolletti',
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

export async function getPaseadores(): Promise<Paseador[]> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return PASEADORES_MOCK;
}

export async function getPaseadorById(id: string): Promise<Paseador | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return PASEADORES_MOCK.find((p) => p.id === id) ?? null;
}

export async function registrarPaseador(
  datos: Omit<Paseador, 'id' | 'calificacion' | 'cantidadResenas' | 'resenas' | 'turnosDisponibles'>
): Promise<Paseador> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const nuevoPaseador: Paseador = {
    ...datos,
    id: String(PASEADORES_MOCK.length + 1),
    calificacion: 5.0,
    cantidadResenas: 0,
    resenas: [],
    turnosDisponibles: [
      { id: `t1_${PASEADORES_MOCK.length + 1}`, dia: 'Lunes', horario: '09:00 - 11:00', disponible: true },
      { id: `t2_${PASEADORES_MOCK.length + 1}`, dia: 'Miércoles', horario: '15:00 - 17:00', disponible: true },
      { id: `t3_${PASEADORES_MOCK.length + 1}`, dia: 'Viernes', horario: '10:00 - 12:00', disponible: true },
    ],
  };
  PASEADORES_MOCK.push(nuevoPaseador);
  return nuevoPaseador;
}

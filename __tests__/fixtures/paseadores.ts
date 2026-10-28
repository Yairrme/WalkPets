import { Paseador } from '../../src/types/paseador';

export const paseadorCipolletti: Paseador = {
  id: '1',
  nombre: 'Lucía',
  apellido: 'Fernández',
  foto: 'https://example.com/lucia.jpg',
  barrio: 'Cipolletti Centro',
  ciudad: 'Cipolletti',
  descripcion:
    'Amante de los animales con 4 años de experiencia. Salidas diarias, puntual y responsable.',
  precioHora: 1800,
  calificacion: 4.9,
  cantidadResenas: 38,
  telefono: '+54 299 4123456',
  disponible: true,
  razasAceptadas: ['Todas las razas'],
  turnosDisponibles: [
    { id: 't1', dia: 'Lunes', horario: '08:00 - 09:00', disponible: true },
  ],
  resenas: [
    {
      id: 'r1',
      autor: 'Martina G.',
      mascota: 'Rocky',
      texto:
        'Lucía es increíble, mi perro la adora. Siempre llega puntual y manda fotos del paseo.',
      calificacion: 5,
      fecha: '2024-11-10',
    },
  ],
};

export const paseadorVillaAlberdi: Paseador = {
  id: '2',
  nombre: 'Mateo',
  apellido: 'Torres',
  foto: '',
  barrio: 'Villa Alberdi',
  ciudad: 'Cipolletti',
  descripcion: 'Estudiante de veterinaria, cuido perros desde los 16 años.',
  precioHora: 1500,
  calificacion: 4.7,
  cantidadResenas: 22,
  telefono: '+54 299 4234567',
  disponible: true,
  razasAceptadas: ['Razas medianas', 'Razas grandes'],
  turnosDisponibles: [],
  resenas: [],
};

export const paseadorNeuquen: Paseador = {
  id: '4',
  nombre: 'Santiago',
  apellido: 'Morales',
  foto: '',
  barrio: 'Neuquén Centro',
  ciudad: 'Neuquén',
  descripcion:
    'Paseos tranquilos por el barrio, ideal para perros mayores o con movilidad reducida.',
  precioHora: 1200,
  calificacion: 4.3,
  cantidadResenas: 9,
  telefono: '+54 299 4456789',
  disponible: false,
  razasAceptadas: ['Razas pequeñas', 'Perros mayores'],
  turnosDisponibles: [],
  resenas: [
    {
      id: 'r9',
      autor: 'Romina F.',
      mascota: 'Pepa',
      texto: 'Muy bueno con perros mayores. Va despacio y con paciencia.',
      calificacion: 5,
      fecha: '2024-09-20',
    },
  ],
};

export const paseadorSinResenas: Paseador = {
  ...paseadorVillaAlberdi,
  id: '99',
  nombre: 'Ana',
  apellido: 'Paz',
  cantidadResenas: 0,
  resenas: [],
};

export const paseadorSinTelefono: Paseador = {
  ...paseadorVillaAlberdi,
  id: '98',
  nombre: 'Bruno',
  apellido: 'Sosa',
  telefono: '',
};

export const paseadores: Paseador[] = [
  paseadorCipolletti,
  paseadorVillaAlberdi,
  paseadorNeuquen,
];

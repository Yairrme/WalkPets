// Representa la estructura completa de un Paseador en la aplicación.
// Define todos los datos que debe tener un perfil de paseador.
export type Paseador = {
  id: string; // Identificador único del paseador
  nombre: string; // Nombre de pila
  apellido: string; // Apellido
  foto: string; // URL de la foto de perfil (puede estar vacía)
  barrio: string; // Barrio donde trabaja principalmente
  ciudad: string; // Ciudad donde opera
  descripcion: string; // Breve biografía o presentación del paseador
  precioHora: number; // Tarifa que cobra por cada hora de paseo
  calificacion: number; // Promedio de calificación (ej. 4.8)
  cantidadResenas: number; // Cantidad total de reseñas recibidas
  telefono: string; // Número de contacto
  disponible: boolean; // Indica si actualmente acepta nuevos perros
  razasAceptadas: string[]; // Lista de preferencias (ej. "Razas pequeñas", "Todas las razas")
  resenas: Resena[]; // Lista de comentarios dejados por otros dueños
  turnosDisponibles: Turno[]; // Horarios en los que tiene disponibilidad para pasear
};

// Representa un comentario o calificación que dejó un cliente.
export type Resena = {
  id: string; // Identificador único de la reseña
  autor: string; // Nombre de la persona que escribe la reseña
  mascota: string; // Nombre del perro/mascota
  texto: string; // El comentario o descripción de la experiencia
  calificacion: number; // Puntuación otorgada, generalmente de 1 a 5
  fecha: string; // Fecha en la que se escribió la reseña (formato YYYY-MM-DD)
};

// Representa un bloque de horario que el paseador tiene libre.
export type Turno = {
  id: string; // Identificador único del turno
  dia: string; // Día de la semana (ej. "Lunes", "Martes")
  horario: string; // Franja horaria (ej. "08:00 - 09:00")
  disponible: boolean; // Si el turno ya fue reservado (false) o sigue libre (true)
};

// Representa los datos necesarios para solicitar o crear una nueva reserva.
export type ReservaTurno = {
  paseadorId: string; // ID del paseador elegido
  turnoId: string; // ID del turno horario elegido
  nombreDuenio: string; // Nombre de quien contrata
  nombreMascota: string; // Nombre del perro a pasear
  telefono: string; // Teléfono de contacto para esta reserva
  notas: string; // Indicaciones adicionales (ej. "Cuidado, tira mucho de la correa")
};

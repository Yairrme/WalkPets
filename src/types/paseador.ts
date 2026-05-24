export type Paseador = {
  id: string;
  nombre: string;
  apellido: string;
  foto: string;
  barrio: string;
  ciudad: string;
  descripcion: string;
  precioHora: number;
  calificacion: number;
  cantidadResenas: number;
  telefono: string;
  disponible: boolean;
  razasAceptadas: string[];
  resenas: Resena[];
  turnosDisponibles: Turno[];
};

export type Resena = {
  id: string;
  autor: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: string;
};

export type Turno = {
  id: string;
  dia: string;
  horario: string;
  disponible: boolean;
};

export type ReservaTurno = {
  paseadorId: string;
  turnoId: string;
  nombreDuenio: string;
  nombreMascota: string;
  telefono: string;
  notas: string;
};

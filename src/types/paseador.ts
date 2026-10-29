import { Ciudad } from '../constants/ciudades';

// Representa la estructura completa de un Paseador en la aplicación.
// Define todos los datos que debe tener un perfil de paseador.
export type Paseador = {
  id: string; // Identificador único del paseador
  usuarioId?: string; // Usuario dueño del perfil, cuando existe autenticación
  nombre: string; // Nombre de pila
  apellido: string; // Apellido
  foto: string; // URL de la foto de perfil (puede estar vacía)
  barrio: string; // Barrio donde trabaja principalmente
  ciudad: Ciudad; // Ciudad donde opera (Cipolletti o Neuquén)
  descripcion: string; // Breve biografía o presentación del paseador
  precioHora: number; // Tarifa que cobra por cada hora de paseo
  calificacion: number; // Promedio de calificación (ej. 4.8)
  cantidadResenas: number; // Cantidad total de reseñas recibidas
  telefono: string; // Número de contacto (se normaliza antes de llamar o usar WhatsApp)
  disponible: boolean; // Indica si actualmente acepta nuevos perros
  razasAceptadas: string[]; // Lista de preferencias (ej. "Razas pequeñas", "Todas las razas")
  resenas: Resena[]; // Lista de comentarios dejados por otros dueños
  redes: RedesSociales; // Usuarios de redes (sin "@"); vacío = no la usa
  certificaciones: string[]; // Permisos y certificaciones declarados por el paseador
  esPropietario?: boolean; // true cuando el usuario autenticado es dueño del perfil
};

export type RedesSociales = {
  instagram: string;
  facebook: string;
  tiktok: string;
  web: string; // URL completa (https://...)
};

// Datos que envía el formulario de registro de paseadores.
export type NuevoPaseadorInput = Omit<
  Paseador,
  'id' | 'calificacion' | 'cantidadResenas' | 'resenas'
> & {
  email?: string; // Requerido en modo API para crear la cuenta
  password?: string; // Requerido en modo API; nunca se persiste en el frontend
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

// Datos para publicar una reseña desde la app.
export type NuevaResenaInput = {
  mascota: string;
  texto: string;
  calificacion: number;
};

export type Rol = 'cliente' | 'paseador';

export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: Rol;
  // Datos opcionales del perfil del cliente; nunca se muestran a otros usuarios.
  ciudad?: Ciudad | null;
  barrio?: string;
  mascotas?: string;
};

// Campos que el paseador puede editar desde su panel.
export type CambiosPerfilPaseador = Partial<
  Pick<
    Paseador,
    | 'foto'
    | 'ciudad'
    | 'barrio'
    | 'descripcion'
    | 'precioHora'
    | 'telefono'
    | 'disponible'
    | 'razasAceptadas'
    | 'redes'
    | 'certificaciones'
  >
>;

// Campos que cualquier usuario puede editar de su cuenta ("Mi perfil").
export type CambiosCuenta = Partial<
  Pick<Usuario, 'nombre' | 'apellido' | 'telefono' | 'ciudad' | 'barrio' | 'mascotas'>
>;

export type Sesion = {
  token: string;
  usuario: Usuario;
};

import { useState } from 'react';
import { ReservaTurno } from '../types/paseador';

// Definimos la estructura para los mensajes de error del formulario.
// Todos los campos son opcionales (?) porque pueden no tener error.
type Errores = {
  nombreDuenio?: string;
  nombreMascota?: string;
  telefono?: string;
  turnoId?: string;
};

// Estado por defecto (vacío) que tendrán los campos del formulario al iniciar.
const estadoInicial: ReservaTurno = {
  paseadorId: '',
  turnoId: '',
  nombreDuenio: '',
  nombreMascota: '',
  telefono: '',
  notas: '',
};

// Este es un "Custom Hook" (gancho personalizado) que encapsula toda la lógica
// para manejar el formulario de reserva, separándola de la interfaz de usuario visual.
export function useReservaForm(paseadorId: string) {
  // Estado para almacenar los valores ingresados por el usuario.
  // Inicia con el estado por defecto y el ID del paseador que recibimos por parámetro.
  const [valores, setValores] = useState<ReservaTurno>({
    ...estadoInicial,
    paseadorId,
  });

  // Estado para almacenar los errores de validación (si los hay).
  const [errores, setErrores] = useState<Errores>({});
  
  // Estado para saber si el formulario ya fue enviado exitosamente.
  const [enviado, setEnviado] = useState(false);

  // Función que se ejecuta cada vez que el usuario escribe en un campo.
  function handleCampo(campo: keyof ReservaTurno, valor: string) {
    // Actualiza el estado manteniendo los valores anteriores (...prev) 
    // y sobrescribiendo solo el campo que cambió.
    setValores((prev) => ({ ...prev, [campo]: valor }));
    
    // Si ese campo tenía un error previo, al volver a escribir lo borramos
    // para que desaparezca el mensaje de error de la pantalla mientras corrige.
    if (errores[campo as keyof Errores]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  // Función interna que verifica que todos los campos requeridos estén completos y correctos.
  function validar(): boolean {
    const nuevosErrores: Errores = {};

    // Validamos que el nombre del dueño no esté vacío.
    if (!valores.nombreDuenio.trim()) {
      nuevosErrores.nombreDuenio = 'Tu nombre es obligatorio';
    }
    // Validamos que el nombre de la mascota no esté vacío.
    if (!valores.nombreMascota.trim()) {
      nuevosErrores.nombreMascota = 'El nombre de tu mascota es obligatorio';
    }
    // Validamos el teléfono: que no esté vacío y que tenga un formato numérico válido.
    if (!valores.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s]{8,}$/.test(valores.telefono.trim())) {
      nuevosErrores.telefono = 'Ingresá un teléfono válido';
    }
    // Validamos que el usuario haya seleccionado un turno.
    if (!valores.turnoId) {
      nuevosErrores.turnoId = 'Seleccioná un turno disponible';
    }

    // Actualizamos el estado con los errores encontrados (si no hay, el objeto estará vacío).
    setErrores(nuevosErrores);
    
    // Devuelve 'true' si no hay errores (el formulario es válido), o 'false' si hay alguno.
    return Object.keys(nuevosErrores).length === 0;
  }

  // Función que se ejecuta cuando el usuario presiona el botón "Enviar" o "Reservar".
  function handleSubmit() {
    // Primero validamos. Si hay errores, detenemos el envío (retornamos false).
    if (!validar()) return false;

    // TODO: Aquí iría la lógica real para enviar los datos a un servidor o API.
    // Por ahora, solo simulamos que el envío fue exitoso.
    setEnviado(true);
    return true;
  }

  // Función para reiniciar el formulario a su estado original (vacío).
  function reset() {
    setValores({ ...estadoInicial, paseadorId });
    setErrores({});
    setEnviado(false);
  }

  // Exponemos las variables y funciones para que la pantalla que use este hook
  // pueda acceder a ellas fácilmente.
  return { valores, errores, enviado, handleCampo, handleSubmit, reset };
}

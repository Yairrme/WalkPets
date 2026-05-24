import { useState } from 'react';
import { ReservaTurno } from '../types/paseador';

type Errores = {
  nombreDuenio?: string;
  nombreMascota?: string;
  telefono?: string;
  turnoId?: string;
};

const estadoInicial: ReservaTurno = {
  paseadorId: '',
  turnoId: '',
  nombreDuenio: '',
  nombreMascota: '',
  telefono: '',
  notas: '',
};

export function useReservaForm(paseadorId: string) {
  const [valores, setValores] = useState<ReservaTurno>({
    ...estadoInicial,
    paseadorId,
  });
  const [errores, setErrores] = useState<Errores>({});
  const [enviado, setEnviado] = useState(false);

  function handleCampo(campo: keyof ReservaTurno, valor: string) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo as keyof Errores]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): boolean {
    const nuevosErrores: Errores = {};

    if (!valores.nombreDuenio.trim()) {
      nuevosErrores.nombreDuenio = 'Tu nombre es obligatorio';
    }
    if (!valores.nombreMascota.trim()) {
      nuevosErrores.nombreMascota = 'El nombre de tu mascota es obligatorio';
    }
    if (!valores.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s]{8,}$/.test(valores.telefono.trim())) {
      nuevosErrores.telefono = 'Ingresá un teléfono válido';
    }
    if (!valores.turnoId) {
      nuevosErrores.turnoId = 'Seleccioná un turno disponible';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleSubmit() {
    if (!validar()) return false;

    // Simulación de envío
    setEnviado(true);
    return true;
  }

  function reset() {
    setValores({ ...estadoInicial, paseadorId });
    setErrores({});
    setEnviado(false);
  }

  return { valores, errores, enviado, handleCampo, handleSubmit, reset };
}
